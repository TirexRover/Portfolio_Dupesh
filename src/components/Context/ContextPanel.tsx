import type { Metadata } from '@/types/data';

type Props = {
  metadata?: Metadata;
};

type ProjectStat = Metadata['stats']['topProjects'][number];
type TimelineEntry = Metadata['stats']['timeline'][number];

export function ContextPanel({ metadata }: Props) {
  if (!metadata) {
    return (
      <aside className="glass-panel p-4 text-sm text-slate-600 dark:text-slate-200">Loading context…</aside>
    );
  }

  return (
    <aside className="flex h-full flex-col gap-4">
      <ContextCard title="Skills cloud">
        <div className="flex flex-wrap gap-2 text-xs">
          {metadata.stats.topSkills.map((skill: string) => (
            <span
              key={skill}
              className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </ContextCard>

      <ContextCard title="Top projects">
        <div className="flex flex-col gap-3 text-sm">
          {metadata.stats.topProjects.map((project: ProjectStat) => (
            <div
              key={project.name}
              className="rounded-2xl border border-white/60 bg-white/75 p-3 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{project.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{project.summary}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Impact: {project.impact}</p>
            </div>
          ))}
        </div>
      </ContextCard>

      <ContextCard title="Timeline">
        <ol className="relative space-y-3 border-l border-white/60 pl-4 text-xs dark:border-white/10">
          {metadata.stats.timeline.map((entry: TimelineEntry) => (
            <li key={entry.label} className="pl-3">
              <span className="absolute -left-1.5 mt-0.5 h-3 w-3 rounded-full bg-primary-500" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.label}</p>
              <p className="text-slate-500 dark:text-slate-300">{entry.detail}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{entry.year}</p>
            </li>
          ))}
        </ol>
      </ContextCard>
    </aside>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};

function ContextCard({ title, children }: CardProps) {
  return (
    <section className="glass-panel border border-white/60 bg-white/70 p-5 text-slate-900 shadow-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">
          {title}
        </p>
        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
      </div>
      {children}
    </section>
  );
}
