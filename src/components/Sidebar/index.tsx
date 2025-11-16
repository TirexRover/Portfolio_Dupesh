import type { Metadata } from '@/types/data';
import { ProfileCard } from './ProfileCard';
import { SignalPanel } from './SignalPanel';
import { TimelineCard } from './TimelineCard';

type Props = {
  metadata?: Metadata;
};

export function Sidebar({ metadata }: Props) {
  return (
    <aside className="flex h-full flex-col gap-4">
      <ProfileCard metadata={metadata?.candidate} />
      <SignalPanel stats={metadata?.stats} />
      <TimelineCard stats={metadata?.stats} />
    </aside>
  );
}
