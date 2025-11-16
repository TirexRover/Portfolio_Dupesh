import type { RankedChunk, SourceRef } from '@/types/data';

const ENV_OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY ?? import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct:free';

export type AnswerOptions = {
  personaName?: string;
  profileSummary?: string;
};

export type AnswerResult = {
  content: string;
  sources: SourceRef[];
  mode: 'local' | 'api';
};

export async function generateAnswer(
  question: string,
  context: RankedChunk[],
  options: AnswerOptions
): Promise<AnswerResult> {
  const apiKey = resolveOpenRouterKey();
  const persona = options.personaName ?? 'Dupesh';
  if (apiKey) {
    try {
      const result = await callOpenRouter(question, context, apiKey, persona, options.profileSummary);
      return result;
    } catch (error) {
      console.warn('Failed to call external model, falling back to local summarizer', error);
    }
  }

  return summarizeLocally(question, context, persona);
}

async function callOpenRouter(
  question: string,
  context: RankedChunk[],
  apiKey: string,
  personaName: string,
  profileSummary?: string
): Promise<AnswerResult> {
  const contextSnippet = buildContext(context);
  const systemPrompt = buildSystemPrompt(personaName);
  const profileBlock = profileSummary ? `Profile\n${profileSummary}\n\n` : '';
  
  const requestBody = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `${profileBlock}Context passages:\n${contextSnippet}\n\nQuestion: ${question}`
      }
    ],
    max_tokens: 400,
    temperature: 0.4
  };

  // Use Netlify function endpoint (works in dev and production)
  const endpoint = import.meta.env.DEV 
    ? '/.netlify/functions/chat'
    : '/.netlify/functions/chat';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty response from model');
  }

  return { content, sources: buildSources(context), mode: 'api' };
}

function resolveOpenRouterKey(): string | undefined {
  if (ENV_OPENROUTER_KEY) return ENV_OPENROUTER_KEY;
  if (typeof window !== 'undefined') {
    const globalKey = (window as unknown as { __OPENROUTER_KEY?: string }).__OPENROUTER_KEY;
    if (globalKey) return globalKey;
    try {
      return window.localStorage?.getItem('openrouter_key') ?? undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function buildSystemPrompt(personaName: string): string {
  return `You are a retrieval QA agent describing ${personaName}. Speak strictly in third person, always referring to the candidate as "${personaName}" or "Dupesh"—never use "I". Use only the provided resume/LinkedIn/GitHub context. Prefer concise paragraphs or bullet points (2–4 sentences total). Highlight concrete skills, metrics, employers, and outcomes when available, and finish every response with "Confidence: Low/Medium/High". If information is missing, say "The available resume data doesn't mention that about ${personaName}."`;
}

function summarizeLocally(question: string, context: RankedChunk[], personaName: string): AnswerResult {
  if (!context.length) {
    return {
      content: `The available resume data doesn't mention that about ${personaName}. confidence: Low`,
      sources: [],
      mode: 'local'
    };
  }

  const bullets = context.slice(0, 3).map((chunk) => {
    const trimmed = chunk.text.length > 260 ? `${chunk.text.slice(0, 257)}…` : chunk.text;
    return `• ${trimmed} (source: ${chunk.section} — ${chunk.source})`;
  });

  const confidence = deriveConfidence(question, context);
  const answer = [
    `${personaName} summary (${confidence} confidence):`,
    ...bullets,
    '',
    `Confidence: ${confidence}`
  ].join('\n');

  return {
    content: answer,
    sources: buildSources(context),
    mode: 'local'
  };
}

function deriveConfidence(question: string, chunks: RankedChunk[]): 'Low' | 'Medium' | 'High' {
  const qTokens = new Set(question.toLowerCase().split(/[^\p{L}\p{N}]+/u));
  const coverage = chunks.reduce((score, chunk) => {
    let overlap = 0;
    for (const token of qTokens) {
      if (!token || token.length < 3) continue;
      if (chunk.text.toLowerCase().includes(token)) overlap += 1;
    }
    return score + overlap;
  }, 0);

  if (coverage > 8) return 'High';
  if (coverage > 3) return 'Medium';
  return 'Low';
}

function buildContext(chunks: RankedChunk[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `### Chunk ${index + 1} [${chunk.section} | ${chunk.source}] (id: ${chunk.id})\n${chunk.text}`
    )
    .join('\n\n');
}

function buildSources(chunks: RankedChunk[]): SourceRef[] {
  return chunks.map((chunk) => ({
    chunkId: chunk.id,
    section: chunk.section,
    label: `${chunk.section} · ${chunk.source}`,
    snippet: chunk.text.slice(0, 220)
  }));
}
