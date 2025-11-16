import type { RankedChunk, SourceRef } from '@/types/data';

const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct:free';

export type AnswerOptions = {
  personaName?: string;
  profileSummary?: string;
};

export type AnswerResult = {
  content: string;
  sources: SourceRef[];
  mode: 'api';
};

export async function generateAnswer(
  question: string,
  context: RankedChunk[],
  options: AnswerOptions
): Promise<AnswerResult> {
  const persona = options.personaName ?? 'Dupesh';
  // Always call OpenRouter via the server proxy for Q&A
  const result = await callOpenRouter(question, context, persona, options.profileSummary);
  return result;
}

async function callOpenRouter(
  question: string,
  context: RankedChunk[],
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
  const endpoint = '/.netlify/functions/chat';

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

function buildSystemPrompt(personaName: string): string {
  return `You are an assistant describing ${personaName}. Speak strictly in third person, always referring to the candidate as "${personaName}" or "Dupesh"—never use "I". Use only the provided profile summary and any context passages supplied by the client. Prefer concise paragraphs or bullet points (2–4 sentences total). Highlight concrete skills, metrics, employers, and outcomes when available, and finish every response with "Confidence: Low/Medium/High". If information is missing, say "The available profile data doesn't mention that about ${personaName}."`;
}

// Local summarizer and confidence estimation removed — OpenRouter is used for all answers.

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
