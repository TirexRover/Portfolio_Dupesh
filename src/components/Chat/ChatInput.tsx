import { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (value: string) => void;
  loading?: boolean;
  suggestions: string[];
  statusLine?: string;
  ownerName: string;
}

export function ChatInput({ onSend, loading, suggestions, statusLine, ownerName }: Props) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Only show suggestions if there are messages (hide initially for cleaner look) */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
          {suggestions.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="no-select rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1.5 text-slate-700 shadow-sm transition active:scale-95 sm:px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 hover:border-white/80 hover:bg-white/90 sm:hover:border-white/90 sm:hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/40 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => setValue(suggestion)}
            >
              <span className="line-clamp-1">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-end gap-2.5 rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-lg sm:gap-3 sm:rounded-[28px] sm:px-5 sm:py-3 dark:border-white/10 dark:bg-slate-900/70">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={`Ask about ${ownerName}'s work, skills, or projects…`}
            className="max-h-32 flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 sm:max-h-40 sm:text-base dark:text-white dark:placeholder:text-slate-500"
            aria-label="Chat prompt"
            style={{ minHeight: '1.5rem' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg transition active:scale-95 sm:h-12 sm:w-12 sm:rounded-2xl sm:hover:bg-primary-500 disabled:opacity-60"
            aria-label="Send message"
          >
            <Send size={18} className="sm:hidden" />
            <Send size={18} className="hidden sm:block" />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-1 px-1 text-[10px] text-slate-600 sm:gap-2 sm:text-xs dark:text-slate-400">
          <span className="line-clamp-1 font-medium">
            {loading
              ? statusLine || `Retrieving from ${ownerName}'s career brain…`
              : 'Enter to send · Shift+Enter for newline'}
          </span>
        </div>
      </div>
    </div>
  );
}
