import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types/chat';

type Props = {
  message: ChatMessage;
};

export function ChatMessageRow({ message }: Props) {
  const isAssistant = message.role === 'assistant';
  const bubbleClasses = isAssistant
    ? 'bg-white/70 text-slate-900 shadow-lg ring-1 ring-white/70 backdrop-blur-md dark:bg-slate-900/70 dark:text-white dark:ring-white/10'
    : 'bg-primary-500/15 text-slate-900 shadow-lg ring-1 ring-primary-200/70 backdrop-blur-md dark:bg-primary-400/25 dark:text-white';
  const alignment = isAssistant ? 'justify-start' : 'justify-end';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full ${alignment}`}
    >
      <div
        className={`max-w-[min(620px,82%)] rounded-[22px] px-4 py-3 text-[0.95rem] leading-relaxed ${bubbleClasses} ${
          isAssistant ? 'self-start' : 'self-end'
        }`}
      >
        {message.content.split('\n').map((line: string, index: number) => (
          <p key={`${message.id}-${index}`} className="whitespace-pre-line">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
