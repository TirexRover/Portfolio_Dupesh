import type { ChatMessage, SeedMessageInput } from '@/types/chat';

const FALLBACK_TRANSCRIPT: SeedMessageInput[] = [];

export const exampleQuestions = [
  'What are your strongest skills?',
  'Tell me about your flagship project.',
  'How do you evaluate LLM copilots?',
  'Where have you driven the most impact?'
];

export function buildFallbackConversation(): ChatMessage[] {
  return mapSeedMessages(FALLBACK_TRANSCRIPT);
}

export function mapSeedMessages(inputs: SeedMessageInput[]): ChatMessage[] {
  const now = Date.now();
  return inputs.map((message, index) => ({
    id: `seed-${index}`,
    role: message.role,
    content: message.content,
    createdAt: now + index * 50
  }));
}
