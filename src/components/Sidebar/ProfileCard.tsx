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
    <section className="glass-panel flex flex-col gap-4 p-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-4">
  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 text-2xl font-semibold text-primary-700 shadow-inner dark:bg-white/10 dark:text-white backdrop-blur-sm">
          {metadata.name
            .split(' ')
            .map((part) => part[0])
            .join('')}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{metadata.name}</p>
          <p className="text-sm text-primary-600 dark:text-primary-300">{metadata.role}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{metadata.headline}</p>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metadata.location}</p>

  <div className="grid grid-cols-2 gap-2 text-sm">
  <ActionLink href={`mailto:${metadata.email}`} label="Email" icon={<Mail size={16} />} />
        <ActionLink href={metadata.github} label="GitHub" icon={<Github size={16} />} />
        <ActionLink href={metadata.resumeUrl} label="Resume" icon={<FileDown size={16} />} />
    <ActionLink href={metadata.linkedin} label="LinkedIn" icon={<Linkedin size={16} />} />
    {metadata.phone && <ActionLink href={`tel:${metadata.phone}`} label="Phone" icon={<Phone size={16} />} />}
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
  className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-sm"
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
