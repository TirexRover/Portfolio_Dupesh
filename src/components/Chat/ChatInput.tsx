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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
            onClick={() => setValue(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-end gap-3 rounded-[28px] border border-white/70 bg-white/80 px-5 py-3 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/70">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={`Ask about ${ownerName}'s work, skills, or projects…`}
            className="max-h-40 flex-1 resize-none bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            aria-label="Chat prompt"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-60"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">
            {loading
              ? statusLine || `Retrieving from ${ownerName}'s career brain…`
              : 'Enter to send · Shift+Enter for newline'}
          </span>
        </div>
      </div>
    </div>
  );
}
