import type { Chunk, EmbeddingFile, RankedChunk } from '@/types/data';
import { tokenize } from './text';
import { embedQuery } from './embedder';

export type RetrievalIndex = {
  search: (query: string, opts?: { topK?: number; forceMode?: 'dense' | 'sparse' | 'hybrid' }) => Promise<{
    strategy: 'dense' | 'sparse' | 'hybrid';
    results: RankedChunk[];
  }>;
};

type SparseVector = Map<string, number>;

type PreparedChunk = Chunk & { vector: SparseVector };

const MIN_TOKEN_LENGTH = 2;

export function createRetrievalIndex(chunks: Chunk[], embeddings?: EmbeddingFile | null): RetrievalIndex {
  const prepared = prepareSparseVectors(chunks);
  const denseMap = buildDenseMap(embeddings);

  return {
    async search(query, opts) {
      const { results: sparseResults } = scoreSparse(query, prepared, opts?.topK);
      if (!denseMap || opts?.forceMode === 'sparse') {
        return { strategy: 'sparse', results: sparseResults };
      }

      const queryEmbedding = await embedQuery(query);
      if (!queryEmbedding) {
        return { strategy: 'sparse', results: sparseResults };
      }

      const denseResults = scoreDense(queryEmbedding, chunks, denseMap, opts?.topK);
      if (opts?.forceMode === 'dense') {
        return { strategy: 'dense', results: denseResults };
      }

      const hybrid = mergeRankings(sparseResults, denseResults, opts?.topK);
      return { strategy: 'hybrid', results: hybrid };
    }
  };
}

function prepareSparseVectors(chunks: Chunk[]): PreparedChunk[] {
  const documentFrequencies = new Map<string, number>();
  const vectorized: PreparedChunk[] = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text).filter((token) => token.length > MIN_TOKEN_LENGTH);
    const tf = new Map<string, number>();
    for (const term of tokens) {
      tf.set(term, (tf.get(term) ?? 0) + 1);
    }
    for (const term of new Set(tokens)) {
      documentFrequencies.set(term, (documentFrequencies.get(term) ?? 0) + 1);
    }
    return { ...chunk, vector: tf };
  });

  const totalDocs = chunks.length;

  return vectorized.map((chunk) => {
    const vector: SparseVector = new Map();
    let norm = 0;
    chunk.vector.forEach((count, term) => {
      const idf = Math.log((totalDocs + 1) / ((documentFrequencies.get(term) ?? 0) + 1)) + 1;
      const weight = (count / chunk.vector.size) * idf;
      vector.set(term, weight);
      norm += weight * weight;
    });
    const magnitude = Math.sqrt(norm) || 1;
    const normalized: SparseVector = new Map();
    vector.forEach((value, key) => normalized.set(key, value / magnitude));
    return { ...chunk, vector: normalized };
  });
}

function scoreSparse(query: string, chunks: PreparedChunk[], topK = 5) {
  const tokens = tokenize(query).filter((token) => token.length > MIN_TOKEN_LENGTH);
  if (!tokens.length) {
    return { strategy: 'sparse', results: chunks.slice(0, topK).map((chunk) => ({ ...chunk, score: 0 })) };
  }
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  const magnitude = Math.sqrt(Array.from(tf.values()).reduce((sum, value) => sum + value * value, 0)) || 1;
  const normalizedQuery = new Map<string, number>();
  tf.forEach((value, key) => normalizedQuery.set(key, value / magnitude));

  const scored = chunks
    .map((chunk) => {
      let score = 0;
      normalizedQuery.forEach((weight, term) => {
        const docWeight = chunk.vector.get(term) ?? 0;
        score += weight * docWeight;
      });
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return { strategy: 'sparse', results: scored };
}

function buildDenseMap(embeddings?: EmbeddingFile | null) {
  if (!embeddings || !embeddings.embeddings?.length) return null;
  const map = new Map<string, number[]>();
  for (const record of embeddings.embeddings) {
    map.set(record.id, record.embedding);
  }
  return map;
}

function scoreDense(
  queryEmbedding: number[],
  chunks: Chunk[],
  denseMap: Map<string, number[]>,
  topK = 5
): RankedChunk[] {
  const queryNorm = Math.sqrt(queryEmbedding.reduce((sum, value) => sum + value * value, 0)) || 1;
  const normalizedQuery = queryEmbedding.map((value) => value / queryNorm);

  return chunks
    .map((chunk) => {
      const embedding = denseMap.get(chunk.id);
      if (!embedding) return { ...chunk, score: 0 };
      const docNorm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0)) || 1;
      let score = 0;
      for (let i = 0; i < Math.min(embedding.length, normalizedQuery.length); i += 1) {
        score += (embedding[i] / docNorm) * normalizedQuery[i];
      }
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function mergeRankings(a: RankedChunk[], b: RankedChunk[], topK = 5): RankedChunk[] {
  const combined = new Map<string, RankedChunk>();
  const boost = (list: RankedChunk[], weight: number) => {
    list.forEach((chunk, index) => {
      const current = combined.get(chunk.id) ?? { ...chunk, score: 0 };
      const score = current.score + chunk.score * weight + 1 / (index + 1);
      combined.set(chunk.id, { ...chunk, score });
    });
  };
  boost(a, 0.55);
  boost(b, 0.45);
  return Array.from(combined.values())
    .sort((x, y) => y.score - x.score)
    .slice(0, topK);
}
