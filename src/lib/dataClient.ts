import type { Metadata } from '@/types/data';
import type { SeedPayload } from '@/types/chat';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export async function loadMetadata(): Promise<Metadata> {
  return fetchJson<Metadata>('/data/metadata.json');
}
export async function loadSeedPayload(): Promise<SeedPayload | null> {
  try {
    return await fetchJson<SeedPayload>('/data/seeds.json');
  } catch (error) {
    console.warn('Seed conversation unavailable, using fallback');
    return null;
  }
}
