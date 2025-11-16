import { User, MessageSquare } from 'lucide-react';

type MobileNavProps = {
  activeTab: 'profile' | 'chat';
  onTabChange: (tab: 'profile' | 'chat') => void;
};

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
  <nav className="glass-panel fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/60 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 lg:hidden">
      <button
        onClick={() => onTabChange('profile')}
        className={`no-select flex flex-col items-center gap-1 rounded-2xl px-8 py-2 transition-all ${
          activeTab === 'profile'
            ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-400'
        }`}
        aria-label="Profile"
      >
        <User size={22} strokeWidth={2.5} />
        <span className="text-xs font-medium">Profile</span>
      </button>
      <button
        onClick={() => onTabChange('chat')}
        className={`no-select flex flex-col items-center gap-1 rounded-2xl px-8 py-2 transition-all ${
          activeTab === 'chat'
            ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-400'
        }`}
        aria-label="Chat"
      >
        <MessageSquare size={22} strokeWidth={2.5} />
        <span className="text-xs font-medium">Chat</span>
      </button>
    </nav>
  );
}
