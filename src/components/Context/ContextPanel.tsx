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
    <aside className="flex h-full flex-col gap-3 sm:gap-4">
      <ContextCard title="Skills cloud">
        <div className="flex flex-wrap gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
          {metadata.stats.topSkills.map((skill: string) => (
            <span
              key={skill}
              className="rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-slate-700 shadow-sm sm:px-3 dark:border-slate-600/50 dark:bg-slate-700/60 dark:text-slate-100 backdrop-blur-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </ContextCard>

      <ContextCard title="Top projects">
        <div className="flex flex-col gap-2.5 text-xs sm:gap-3 sm:text-sm">
          {metadata.stats.topProjects.map((project: ProjectStat) => (
            <div
              key={project.name}
              className="rounded-xl border border-white/60 bg-white/75 p-2.5 text-slate-800 shadow-sm sm:rounded-2xl sm:p-3 dark:border-slate-600/50 dark:bg-slate-700/70 dark:text-slate-100 backdrop-blur-sm"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{project.name}</p>
              <p className="mt-1 text-[11px] text-slate-500 sm:text-sm dark:text-slate-300">{project.summary}</p>
              <p className="mt-1 text-[10px] text-slate-500 sm:text-xs dark:text-slate-400">Impact: {project.impact}</p>
            </div>
          ))}
        </div>
      </ContextCard>

      {/* Timeline moved to the left column under Snapshot for better context */}
    </aside>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};

function ContextCard({ title, children }: CardProps) {
  return (
    <section className="glass-panel border border-white/60 bg-white/70 p-4 text-slate-900 shadow-xl sm:p-5 dark:border-slate-600/50 dark:bg-slate-800/60 dark:text-slate-100">
      <div className="mb-2.5 flex items-center justify-between sm:mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 sm:text-xs dark:text-slate-300">
          {title}
        </p>
        <span className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 sm:h-1 sm:w-10" />
      </div>
      {children}
    </section>
  );
}
