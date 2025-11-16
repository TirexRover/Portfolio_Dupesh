import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ContextPanel } from '@/components/Context/ContextPanel';
import { ChatPane } from '@/components/Chat/ChatPane';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileNav } from '@/components/MobileNav';
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
  const [mobileTab, setMobileTab] = useState<'profile' | 'chat'>('chat');
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

  // AI handles Q&A via API

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
              `Hi, I'm ${ownerName}'s AI assistant. I can answer questions about ${ownerName}'s profile, experience, skills, and projects. Just ask what you'd like to know.`,
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

    // Call AI API directly for answers

    const friendlyName = candidateName === 'I' ? 'my' : candidateName.split(' ')[0] ?? candidateName;
    const loadingText = randomLoadingLine(friendlyName);
    setStatusLine(loadingText);
    setLoading(true);

    // Add temporary loading message bubble
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        content: loadingText,
        createdAt: Date.now(),
        variant
      }
    ]);

    try {
      const answer = await generateAnswer(trimmed, [], {
        personaName: candidateName,
        profileSummary,
        llmContext: metadata?.llmContext
      });
      
      // Replace loading message with actual response
      setMessages((prev: ChatMessage[]) => 
        prev.map(msg => 
          msg.id === loadingId 
            ? {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: answer.content,
                createdAt: Date.now(),
                variant
              }
            : msg
        )
      );
      setStatusLine('Ready for the next question.');
    } catch (error) {
      console.error(error);
      setStatusLine('Hit a snag generating the answer. Try again.');
      
      // Replace loading message with error
      setMessages((prev: ChatMessage[]) =>
        prev.map(msg =>
          msg.id === loadingId
            ? {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: 'Something went wrong while generating the answer. Please try again.',
                createdAt: Date.now()
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusLine('Enter to send · Shift+Enter for newline');
      }, 400);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--page-bg)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col px-4 py-4 pb-20 sm:px-6 sm:py-6 lg:px-10 lg:pb-8 xl:px-16">
        <header className="mb-4 flex items-center justify-end lg:mb-6">
          <ThemeToggle theme={theme} onToggle={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))} />
        </header>
        
        {/* Desktop Layout - 3 Column Grid */}
        <div className="hidden flex-1 gap-4 lg:grid lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,2.2fr)_minmax(220px,0.8fr)] lg:gap-6 xl:gap-8">
          <Sidebar metadata={metadata} />
          <div className="flex min-h-0 flex-col">
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

        {/* Mobile Layout - Tabbed Interface */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          {/* Profile Tab */}
          <div className={`flex h-full flex-col gap-4 overflow-y-auto pb-4 ${mobileTab === 'profile' ? 'block' : 'hidden'}`}>
            <Sidebar metadata={metadata} />
            <ContextPanel metadata={metadata} />
          </div>

          {/* Chat Tab */}
          <div className={`flex h-full flex-col ${mobileTab === 'chat' ? 'flex' : 'hidden'}`}>
            <ChatPane
              messages={messages}
              onSend={handleSend}
              loading={loading}
              exampleQuestions={suggestions}
              statusLine={statusLine}
              ownerName={ownerName}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {status && (
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[var(--glass-bg)] px-4 py-2 text-xs text-[var(--text-secondary)] shadow-lg ring-1 ring-black/10 dark:ring-white/10 lg:bottom-4">
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
    candidate.email || candidate.phone ? `Contact: ${candidate.email ?? ''}${candidate.email && candidate.phone ? ' · ' : ''}${candidate.phone ?? ''}` : undefined,
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
    `Analyzing ${friendly}'s profile data...`,
    `Generating a detailed response about ${friendly}...`,
    `Retrieving relevant information for ${friendly}...`,
    `Processing your query...`,
    `Searching through ${friendly}'s experience and projects...`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
