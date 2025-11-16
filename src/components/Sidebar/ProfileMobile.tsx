import { Github, Mail, FileDown, Linkedin, Phone } from 'lucide-react';
import type { Metadata } from '@/types/data';

export function ProfileMobile({ metadata }: { metadata?: Metadata }) {
  if (!metadata) {
    return (
      <section className="glass-panel p-4 text-sm text-slate-600 dark:text-slate-200">
        <p>Loading profile…</p>
      </section>
    );
  }

  const candidate = metadata.candidate;
  const stats = metadata.stats;

  return (
    <section className="glass-panel p-4 text-slate-900 dark:text-slate-100">
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-xl font-semibold text-primary-700 shadow-inner dark:bg-white/10 dark:text-white backdrop-blur-sm">
          {candidate?.name
            .split(' ')
            .map((p) => p[0])
            .join('')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900 dark:text-white">{candidate?.name}</p>
          <p className="text-xs text-primary-600 dark:text-primary-300">{candidate?.role}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-300 line-clamp-2">{candidate?.headline}</p>
        </div>
      </div>

      {/* Contact / CTA buttons */}
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        {candidate?.email && (
          <a href={`mailto:${candidate.email}`} className="no-select inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 text-slate-800 shadow-sm transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm">
            <Mail size={16} />
            <span className="truncate">Email</span>
          </a>
        )}
        {candidate?.github && (
          <a href={candidate.github} target="_blank" rel="noreferrer" className="no-select inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 text-slate-800 shadow-sm transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm">
            <Github size={16} />
            <span className="truncate">GitHub</span>
          </a>
        )}
        {candidate?.linkedin && (
          <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="no-select inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 text-slate-800 shadow-sm transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm">
            <Linkedin size={16} />
            <span className="truncate">LinkedIn</span>
          </a>
        )}
        {candidate?.phone && (
          <a href={`tel:${candidate.phone}`} className="no-select inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 text-slate-800 shadow-sm transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm">
            <Phone size={16} />
            <span className="truncate">Call</span>
          </a>
        )}
        {candidate?.resumeUrl && (
          <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="no-select inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 text-slate-800 shadow-sm transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm">
            <FileDown size={16} />
            <span className="truncate">Resume</span>
          </a>
        )}
      </div>

      {/* Snapshot */}
      {stats && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Snapshot</p>
            <span className="h-0.5 w-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-300">{stats.yearsExperience}+ yrs</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">Building AI systems end-to-end</p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-300">
              <p className="font-medium">Top skills</p>
              <p className="mt-1 line-clamp-2">{stats.topSkills.slice(0, 4).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {stats?.topSkills?.length && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Skills</p>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Projects */}
      {stats?.topProjects?.length && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Top projects</p>
          <div className="flex flex-col gap-3">
            {stats.topProjects.map((project) => (
              <div key={project.name} className="rounded-xl border border-white/60 bg-white/75 p-3 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                <p className="font-semibold text-slate-900 dark:text-white">{project.name}</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-300">{project.summary}</p>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Impact: {project.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {stats?.timeline?.length && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Timeline</p>
          <ol className="relative space-y-2 pl-3 text-xs dark:text-slate-300">
            {stats.timeline.map((entry) => (
              <li key={entry.label} className="pl-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{entry.label}</p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-300">{entry.detail}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{entry.year}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
