import type { RankedChunk, SourceRef } from '@/types/data';

const AI_MODEL = import.meta.env.VITE_AI_API_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free';

export type AnswerOptions = {
  personaName?: string;
  profileSummary?: string;
  // Full natural language LLM context supplied from site.json.metadata.llmContext
  llmContext?: string;
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
  // Call AI API via the server proxy for Q&A
  const result = await callAI(question, context, persona, options.profileSummary, options.llmContext);
  return result;
}

async function callAI(
  question: string,
  context: RankedChunk[],
  personaName: string,
  profileSummary?: string,
  llmContext?: string
): Promise<AnswerResult> {
  const contextSnippet = buildContext(context);
  const systemPrompt = buildSystemPrompt(personaName, llmContext);
  const profileBlock = profileSummary ? `Profile\n${profileSummary}\n\n` : '';

  const MAX_OUTPUT_TOKENS = Number(import.meta.env.VITE_AI_API_MAX_TOKENS ?? 600);
  const requestBody = {
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `${profileBlock}Context passages:\n${contextSnippet}\n\nQuestion: ${question}`
      }
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.75
  };

  // Use API endpoint (defaults to Vercel path, falls back to Netlify path if configured)
  const endpoint = import.meta.env.VITE_API_ENDPOINT || '/api/chat';

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

export function buildSystemPrompt(personaName: string, llmContext?: string): string {
  const base = `You are a professional assistant summarizing a person named ${personaName}. Use only the supplied "Profile" and the provided "Context passages"—do not invent facts or add external information. Always write in third person and refer to the person by "${personaName}" or "Dupesh"; do not use "I".

- For general or domain-level questions (not explicitly about the candidate):
  1) First, answer the question creatively and helpfully (examples, analogies, and practical suggestions are encouraged).
  2) Then add a short section titled "How this applies to ${personaName}:" that maps the general answer to the candidate—provide a one-line suitability statement (Yes/No/Maybe), 2–3 bibliography-backed reasons mapping the answer to the candidate's skills/experience, and cite context passages or "Profile" chunks where possible.

- For specific questions about ${personaName}:
  - Keep the answer concise (1–3 short paragraphs or 2–4 bullets).
  - Highlight concrete skills, metrics, employers, outcomes, and relevant projects found in the profile or context.
  - When stating facts, cite the supporting context chunk(s) (e.g., "Chunk 2 [Work Experience]").
  - If information is missing, explicitly say: "The available profile data doesn't mention that about ${personaName}."
  - If you must extrapolate, preface the extrapolation with "Assumption:" and explain the basis briefly.

- For "is this candidate fit for X role" questions: include a one-line assessment, 3 evidence-backed bullets tying candidate skills to the role, and 1 "Gaps/Unknowns" bullet listing any clarifying pieces of information you'd need.

Always respond in markdown format, using headings, bullet points, and bolding for emphasis where appropriate. Keep response length under 200 tokens, only exceed when absolutely needed or detailed explanation asked.`;
  if (!llmContext) return base;
  // Provide the full LLM context as an explicit block in the system prompt to ensure it's available
  // to the model for every user message. This prevents the assistant from inventing facts outside the
  // provided profile/context.
  return `${base}\n\nLLM Context:\n${llmContext}`;
}

// AI model handles all answer generation with confidence estimation

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
    snippet: chunk.text.slice(0, 500)
  }));
}
