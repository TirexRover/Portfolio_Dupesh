import type { Metadata } from '@/types/data';

type Props = {
  stats?: Metadata['stats'];
};

export function SignalPanel({ stats }: Props) {
  if (!stats) return null;

  return (
    <section className="glass-panel flex flex-col gap-4 p-5 text-slate-900 dark:text-slate-100">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Snapshot</p>
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">
          {stats.yearsExperience}+ yrs
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-300">Building AI systems end-to-end</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
          {stats.topSkills.slice(0, 4).map((skill: string) => (
          <div
            key={skill}
            className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm"
          >
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
}
