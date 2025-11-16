import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = {
  message: ChatMessage;
};

export function ChatMessageRow({ message }: Props) {
  const isAssistant = message.role === 'assistant';
  const bubbleClasses = isAssistant
    ? 'bg-white/70 text-slate-900 shadow-lg ring-1 ring-white/70 backdrop-blur-md dark:bg-slate-900/70 dark:text-slate-100 dark:ring-white/10'
    : 'bg-primary-500/15 text-slate-900 shadow-lg ring-1 ring-primary-200/70 backdrop-blur-md dark:bg-primary-400/25 dark:text-slate-100';
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
        className={`max-w-[min(620px,92%)] rounded-[20px] px-4 py-3 text-[0.9375rem] leading-relaxed sm:max-w-[min(620px,82%)] sm:rounded-[22px] sm:px-4 sm:py-3 sm:text-[0.95rem] ${bubbleClasses} ${
          isAssistant ? 'self-start' : 'self-end'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            // Paragraphs
            p: ({ node, ...props }: any) => (
              <p {...props} className="mb-2 leading-relaxed text-sm sm:text-base text-slate-900 dark:text-slate-100" />
            ),
            // Headings (support #, ##, ###)
            h1: ({ node, ...props }: any) => (
              <h1 {...props} className="my-1 text-lg font-semibold sm:text-xl text-slate-900 dark:text-slate-100" />
            ),
            h2: ({ node, ...props }: any) => (
              <h2 {...props} className="my-1 text-base font-semibold sm:text-lg text-slate-900 dark:text-slate-100" />
            ),
            h3: ({ node, ...props }: any) => (
              <h3 {...props} className="my-1 text-sm font-semibold sm:text-base text-slate-900 dark:text-slate-100" />
            ),
            // Links
            a: ({ node, ...props }: any) => (
              // open external links in a new tab and keep tailwind styling
              <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline break-words" />
            ),
            // Strong
            strong: ({ node, ...props }: any) => (
              <strong {...props} className="font-semibold text-slate-900 dark:text-slate-100" />
            ),
            // Lists
            ul: ({ node, ...props }: any) => (
              <ul {...props} className="my-1 space-y-1 pl-5 text-sm sm:pl-6 sm:text-base list-disc text-slate-900 dark:text-slate-100" />
            ),
            ol: ({ node, ...props }: any) => (
              <ol {...props} className="my-1 space-y-1 pl-5 text-sm sm:pl-6 sm:text-base list-decimal text-slate-900 dark:text-slate-100" />
            ),
            li: ({ node, ...props }: any) => <li {...props} className="my-1 text-slate-900 dark:text-slate-100" />,
            // Blockquote
            blockquote: ({ node, ...props }: any) => (
              <blockquote {...props} className="border-l-4 border-slate-200 pl-4 italic text-slate-600 dark:border-slate-700 dark:text-slate-300 my-2" />
            ),
            // Code blocks & inline code
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="my-2 overflow-x-auto text-xs sm:text-sm">
                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs break-words sm:text-sm dark:bg-slate-800 text-slate-900 dark:text-slate-100" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
