import { Github, Mail, FileDown, Linkedin, Phone } from 'lucide-react';
import type { Metadata } from '@/types/data';

type Props = {
  metadata?: Metadata['candidate'];
};

export function ProfileCard({ metadata }: Props) {
  if (!metadata) {
    return (
      <section className="glass-panel p-6 text-sm text-slate-600 dark:text-slate-200">
        <p>Loading profile…</p>
      </section>
    );
  }

  return (
    <section className="glass-panel flex flex-col gap-3 p-4 text-slate-900 sm:gap-4 sm:p-6 dark:text-slate-100">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/60 text-xl font-semibold text-primary-700 shadow-inner backdrop-blur-sm sm:h-16 sm:w-16 sm:text-2xl dark:bg-white/10 dark:text-white">
          {metadata.name
            .split(' ')
            .map((part) => part[0])
            .join('')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900 sm:text-lg dark:text-white">{metadata.name}</p>
          <p className="truncate text-xs text-primary-600 sm:text-sm dark:text-primary-300">{metadata.role}</p>
          <p className="line-clamp-2 text-[11px] text-slate-500 sm:text-xs dark:text-slate-300">{metadata.headline}</p>
        </div>
      </div>

      <p className="text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">{metadata.location}</p>

      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <ActionLink href={`mailto:${metadata.email}`} label="Email" icon={<Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
        <ActionLink href={metadata.github} label="GitHub" icon={<Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
        <ActionLink href={metadata.resumeUrl} label="Resume" icon={<FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
        <ActionLink href={metadata.linkedin} label="LinkedIn" icon={<Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
        {metadata.phone && <ActionLink href={`tel:${metadata.phone}`} label="Phone" icon={<Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />}
      </div>
    </section>
  );
}

type ActionLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function ActionLink({ href, label, icon }: ActionLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="no-select inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/70 px-2.5 py-2 text-slate-800 shadow-sm transition active:scale-95 sm:gap-2 sm:rounded-xl sm:px-3 sm:hover:-translate-y-0.5 sm:hover:border-primary-300 sm:hover:text-primary-600 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm"
      aria-label={label}
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}
