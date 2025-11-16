import type { ChatMessage } from '@/types/chat';
import { ChatMessageRow } from './ChatMessageRow';
import { ChatInput } from './ChatInput';

export type ChatPaneProps = {
  messages: ChatMessage[];
  onSend: (value: string) => void;
  loading: boolean;
  exampleQuestions: string[];
  statusLine?: string;
  ownerName: string;
};

export function ChatPane({ messages, onSend, loading, exampleQuestions, statusLine, ownerName }: ChatPaneProps) {
  return (
  <section className="glass-panel flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl lg:min-h-[calc(100vh-8rem)]">
      <div className="border-b border-white/60 px-5 py-4 dark:border-white/10 sm:px-6 sm:py-5">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">I am {ownerName}'s Copilot</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Ask anything.</h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.map((message) => (
          <ChatMessageRow key={message.id} message={message} />
        ))}
      </div>

      <div className="border-t border-white/60 px-4 py-4 dark:border-white/10 sm:px-6">
        <ChatInput
          onSend={onSend}
          loading={loading}
          suggestions={exampleQuestions}
          statusLine={statusLine}
          ownerName={ownerName}
        />
      </div>
    </section>
  );
}
