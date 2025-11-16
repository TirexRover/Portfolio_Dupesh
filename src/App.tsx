import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ContextPanel } from '@/components/Context/ContextPanel';
import { ChatPane } from '@/components/Chat/ChatPane';
import { ThemeToggle } from '@/components/ThemeToggle';
import { loadMetadata, loadSeedPayload } from '@/lib/dataClient';
import { generateAnswer } from '@/lib/answerer';
import { exampleQuestions } from '@/lib/seeds';
import type { ChatMessage, SeedPayload } from '@/types/chat';
import type { Metadata } from '@/types/data';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metadata, setMetadata] = useState<Metadata | undefined>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('Loading data…');
  const [suggestions, setSuggestions] = useState<string[]>(exampleQuestions);
  const [statusLine, setStatusLine] = useState<string>('Enter to send · Shift+Enter for newline');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('portfolio-theme') as 'light' | 'dark') || 'light';
  });
  const welcomePlayed = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [meta, seedPayload] = await Promise.all([loadMetadata(), loadSeedPayload()]);
        setMetadata(meta);
        hydrateSeedMessages(seedPayload);
        setStatus('');
      } catch (error) {
        console.error(error);
        setStatus('Failed to load metadata or seed files.');
      }
    })();
  }, []);

  // Local retrieval removed; OpenRouter will handle Q&A

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    document.body.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const ownerName = (import.meta.env.VITE_OWNER_NAME as string | undefined) ?? metadata?.candidate?.name ?? 'Dupesh';
  const candidateName = ownerName;
  const profileSummary = metadata ? buildProfileSummary(metadata) : undefined;

  const hydrateSeedMessages = (seedPayload: SeedPayload | null) => {
    if (seedPayload?.prompts?.length) {
      setSuggestions(seedPayload.prompts);
    }
  };

  useEffect(() => {
    if (welcomePlayed.current) return;
    const timer = setTimeout(() => {
      setMessages((prev: ChatMessage[]) => {
        if (prev.length) return prev;
        welcomePlayed.current = true;
      return [
          {
            id: 'welcome-message',
            role: 'assistant',
            content:
              `Hi, I'm ${ownerName}'s OpenRouter-powered assistant. I can answer questions about ${ownerName}'s profile and experience. Just ask what you'd like to know.`,
            createdAt: Date.now()
          }
        ];
      });
      playNotification();
    }, 1000);
    return () => clearTimeout(timer);
  }, [ownerName]);

  const playNotification = () => {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.value = 0.05;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.warn('Notification sound unavailable', error);
    }
  };

  const handleSend = async (prompt: string, variant: ChatMessage['variant'] = 'default') => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
      variant
    };
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);

    // No local retrieval required; we call OpenRouter directly

    const friendlyName = candidateName === 'I' ? 'my' : candidateName.split(' ')[0] ?? candidateName;
    setStatusLine(randomLoadingLine(friendlyName));
    setLoading(true);
    try {
      const answer = await generateAnswer(trimmed, [], {
        personaName: candidateName,
        profileSummary
      });
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: answer.content,
          createdAt: Date.now(),
          variant
        }
      ]);
      setStatusLine('Ready for the next question.');
    } catch (error) {
      console.error(error);
      setStatusLine('Hit a snag generating the answer. Try again.');
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong while generating the answer. Please try again.',
          createdAt: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusLine('Enter to send · Shift+Enter for newline');
      }, 400);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--page-bg)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-10 xl:px-16">
        <header className="mb-4 flex items-center justify-end lg:mb-6">
          <ThemeToggle theme={theme} onToggle={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))} />
        </header>
        <div className="grid flex-1 gap-4 pb-8 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,2.2fr)_minmax(220px,0.8fr)] lg:gap-6 xl:gap-8">
          <Sidebar metadata={metadata} />
          <div className="min-h-[60vh] lg:min-h-0">
            <ChatPane
              messages={messages}
              onSend={handleSend}
              loading={loading}
              exampleQuestions={suggestions}
              statusLine={statusLine}
              ownerName={ownerName}
            />
          </div>
          <ContextPanel metadata={metadata} />
        </div>
      </div>
      {status && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--glass-bg)] px-4 py-2 text-xs text-[var(--text-secondary)] shadow-lg ring-1 ring-black/10 dark:ring-white/10">
          {status}
        </div>
      )}
    </div>
  );
}

function buildProfileSummary(metadata?: Metadata): string | undefined {
  if (!metadata?.candidate) return undefined;
  const { candidate, stats } = metadata;
  const lines = [
    `${candidate.name} — ${candidate.role}`,
    candidate.headline,
    candidate.location ? `Based in ${candidate.location}` : undefined,
    stats?.yearsExperience ? `${stats.yearsExperience}+ years of shipped AI systems` : undefined,
    stats?.topSkills?.length ? `Top skills: ${stats.topSkills.slice(0, 6).join(', ')}` : undefined,
    stats?.topProjects?.length
    ? `Projects: ${stats.topProjects
      .slice(0, 2)
      .map((project: Metadata['stats']['topProjects'][number]) => `${project.name} (${project.impact})`)
      .join(' | ')}`
      : undefined
  ].filter(Boolean);
  return lines.join('\n');
}

function randomLoadingLine(name: string): string {
  const friendly = name || 'my';
  const templates = [
    `🌐 Querying OpenRouter for ${friendly}…`,
    `🤖 Generating an answer about ${friendly}…`,
    `📡 Checking profile details for ${friendly}…`,
    `� Formatting the answer for you…`,
    `🔎 Looking up public profile notes for ${friendly}…`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
