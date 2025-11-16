import type { SourceRef } from './data';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  sources?: SourceRef[];
  variant?: 'default' | 'summary' | 'role-match';
};

export type SeedMessageInput = {
  role: Exclude<ChatRole, 'system'>;
  content: string;
};

export type SeedPayload = {
  prompts: string[];
  messages: SeedMessageInput[];
  generatedAt: string;
  source: 'openrouter' | 'fallback';
};
