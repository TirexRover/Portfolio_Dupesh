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
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            // Paragraphs
            p: ({ node, ...props }: any) => (
              <p {...props} className="mb-2 leading-relaxed" />
            ),
            // Headings (support #, ##, ###)
            h1: ({ node, ...props }: any) => (
              <h1 {...props} className="text-xl font-semibold my-1" />
            ),
            h2: ({ node, ...props }: any) => (
              <h2 {...props} className="text-lg font-semibold my-1" />
            ),
            h3: ({ node, ...props }: any) => (
              <h3 {...props} className="text-base font-semibold my-1" />
            ),
            // Links
            a: ({ node, ...props }: any) => (
              // open external links in a new tab and keep tailwind styling
              <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline" />
            ),
            // Strong
            strong: ({ node, ...props }: any) => (
              <strong {...props} className="font-semibold" />
            ),
            // Lists
            ul: ({ node, ...props }: any) => (
              <ul {...props} className="list-disc pl-6 space-y-1 my-1" />
            ),
            ol: ({ node, ...props }: any) => (
              <ol {...props} className="list-decimal pl-6 space-y-1 my-1" />
            ),
            li: ({ node, ...props }: any) => <li {...props} className="my-1" />,
            // Blockquote
            blockquote: ({ node, ...props }: any) => (
              <blockquote {...props} className="border-l-4 border-slate-200 pl-4 italic text-slate-600 dark:border-slate-700 dark:text-slate-300 my-2" />
            ),
            // Code blocks & inline code
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="my-2">
                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="rounded bg-slate-100 px-1 py-0.5 text-sm dark:bg-slate-800" {...props}>
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
