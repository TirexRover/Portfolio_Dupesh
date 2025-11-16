/*
  Local retrieval implementation has been disabled in favor of using OpenRouter for Q&A.
  If you import createRetrievalIndex, it will now throw a helpful error directing you to the OpenRouter path.
*/
export type RetrievalIndex = {
  search: (query: string, opts?: { topK?: number }) => Promise<{ strategy: 'none'; results: [] }>;
};

export function createRetrievalIndex(): RetrievalIndex {
  throw new Error('Local retrieval index has been disabled. Use OpenRouter-based Q&A instead.');
}
