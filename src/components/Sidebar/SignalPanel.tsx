import type { Metadata } from '@/types/data';

type Props = {
  stats?: Metadata['stats'];
};

export function SignalPanel({ stats }: Props) {
  if (!stats) return null;

  return (
    <section className="glass-panel flex flex-col gap-3 p-4 text-slate-900 sm:gap-4 sm:p-5 dark:text-slate-100">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 sm:text-xs dark:text-slate-400">Snapshot</p>
        <p className="text-2xl font-semibold text-primary-600 sm:text-3xl dark:text-primary-300">
          {stats.yearsExperience}+ yrs
        </p>
        <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-300">Building AI systems end-to-end</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:gap-3 sm:text-sm">
        {stats.topSkills.slice(0, 4).map((skill: string) => (
          <div
            key={skill}
            className="rounded-xl border border-white/60 bg-white/70 px-2.5 py-2 text-center text-slate-800 shadow-sm sm:rounded-2xl sm:px-3 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm"
          >
            <span className="line-clamp-2">{skill}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
