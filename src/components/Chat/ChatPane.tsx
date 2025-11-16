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
    <section className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl lg:min-h-[calc(100vh-8rem)]">
      <div className="flex-shrink-0 border-b border-white/60 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-5">
        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300 sm:text-xs">I am {ownerName}'s Copilot</p>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">Ask anything about Dupesh...</h1>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:space-y-3 sm:px-6 sm:py-5">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
            <p className="max-w-md px-4">Ask me anything about {ownerName}&apos;s experience, skills, or projects!</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageRow key={message.id} message={message} />
        ))}
      </div>

      <div className="flex-shrink-0 border-t border-white/60 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-4">
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
