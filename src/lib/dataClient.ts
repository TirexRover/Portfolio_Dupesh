import type { ChunkFile, EmbeddingFile, Metadata } from '@/types/data';
import type { SeedPayload } from '@/types/chat';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export async function loadChunks(): Promise<ChunkFile> {
  return fetchJson<ChunkFile>('/data/chunks.json');
}

export async function loadMetadata(): Promise<Metadata> {
  return fetchJson<Metadata>('/data/metadata.json');
}

export async function loadEmbeddings(): Promise<EmbeddingFile | null> {
  try {
    return await fetchJson<EmbeddingFile>('/data/embeddings.json');
  } catch (error) {
    console.warn('Embeddings unavailable, falling back to sparse search');
    return null;
  }
}

export async function loadSeedPayload(): Promise<SeedPayload | null> {
  try {
    return await fetchJson<SeedPayload>('/data/seeds.json');
  } catch (error) {
    console.warn('Seed conversation unavailable, using fallback');
    return null;
  }
}
