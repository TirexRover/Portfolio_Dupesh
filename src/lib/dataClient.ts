import type { Metadata, ChunkFile, EmbeddingFile } from '@/types/data';
import type { SeedPayload } from '@/types/chat';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

type SitePayload = {
  metadata: Metadata;
  seeds?: SeedPayload;
  chunks?: ChunkFile;
  embeddings?: EmbeddingFile;
};

async function loadSite(): Promise<SitePayload> {
  return fetchJson<SitePayload>('/data/site.json');
}

export async function loadMetadata(): Promise<Metadata> {
  const site = await loadSite();
  if (!site?.metadata) throw new Error('Metadata not found in site.json');
  return site.metadata;
}

export async function loadSeedPayload(): Promise<SeedPayload | null> {
  try {
    const site = await loadSite();
    return site.seeds ?? null;
  } catch (error) {
    console.warn('Seed conversation unavailable, using fallback');
    return null;
  }
}
