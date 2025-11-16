let embedderPromise: Promise<any> | null = null;

export async function embedQuery(text: string): Promise<number[] | null> {
  const normalized = text.trim();
  if (!normalized) return null;

  try {
    if (!embedderPromise) {
      const remoteUrl = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.1';
      embedderPromise = (import(/* @vite-ignore */ remoteUrl) as Promise<any>).then((mod) =>
        mod.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
      );
    }
    const extractor = await embedderPromise;
    const output = await extractor(normalized, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.warn('Falling back to sparse retrieval (embedder unavailable)', error);
    return null;
  }
}
