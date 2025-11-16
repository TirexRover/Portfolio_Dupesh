export type SectionTag =
  | 'summary'
  | 'experience'
  | 'skills'
  | 'education'
  | 'projects'
  | 'publications'
  | 'certifications'
  | 'contact'
  | 'timeline';

export type Chunk = {
  id: string;
  text: string;
  source: string;
  section: SectionTag;
  start: number;
  end: number;
  keywords?: string[];
};

export type ChunkFile = {
  chunks: Chunk[];
};

export type Metadata = {
  candidate: {
    name: string;
    role: string;
    avatar?: string;
    headline: string;
    email: string;
    phone?: string;
    github: string;
    location: string;
    resumeUrl: string;
    linkedin: string;
  };
  stats: {
    yearsExperience: number;
    topSkills: string[];
    topProjects: Array<{ name: string; summary: string; impact: string }>;
    timeline: Array<{ label: string; detail: string; year: string }>;
  };
  generatedAt: string;
};

export type EmbeddingRecord = {
  id: string;
  embedding: number[];
};

export type EmbeddingFile = {
  model: string;
  dimension: number;
  kind: 'dense' | 'sparse';
  embeddings: EmbeddingRecord[];
};

export type SourceRef = {
  chunkId: string;
  section: SectionTag;
  label: string;
  snippet: string;
};

export type RankedChunk = Chunk & {
  score: number;
};
