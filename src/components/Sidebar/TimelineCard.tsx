import type { Metadata } from '@/types/data';

type Props = {
  stats?: Metadata['stats'];
};

export function TimelineCard({ stats }: Props) {
  if (!stats?.timeline?.length) return null;

  return (
    <section className="glass-panel border border-white/60 bg-white/70 p-4 text-slate-900 shadow-xl sm:p-5 dark:border-slate-600/50 dark:bg-slate-800/60 dark:text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 sm:text-xs dark:text-slate-300">Timeline</p>
        <span className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 sm:h-1 sm:w-10" />
      </div>
      <ol className="relative space-y-2.5 border-l border-white/60 pl-3 text-xs sm:space-y-3 sm:pl-4 dark:border-slate-600/50">
        {stats.timeline.map((entry) => (
          <li key={entry.label} className="pl-2.5 sm:pl-3">
            <span className="absolute -left-1.5 mt-0.5 h-2.5 w-2.5 rounded-full bg-primary-500 sm:h-3 sm:w-3" />
            <p className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">{entry.label}</p>
            <p className="text-[11px] text-slate-500 sm:text-xs dark:text-slate-300">{entry.detail}</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-400 sm:text-[10px] dark:text-slate-500">{entry.year}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
