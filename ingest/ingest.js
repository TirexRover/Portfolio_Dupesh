#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import cheerio from 'cheerio';

const ROOT = path.resolve(process.cwd());

const defaultInputs = {
  resume: pickExisting(['resume.txt', 'resume.pdf']),
  linkedin: pickExisting(['linkedin.html', 'linkedin.json', 'linkedin.txt']),
  profile: path.join(ROOT, 'data', 'profile.json')
};

function pickExisting(options) {
  for (const option of options) {
    const target = path.join(ROOT, option);
    if (existsSync(target)) return target;
  }
  return path.join(ROOT, options[0]);
}

const args = parseArgs(process.argv.slice(2));
const flagEnabled = (key) => {
  const v = args[key] ?? args[key.replace(/-(.)/g, (_, c) => c.toUpperCase())];
  if (v === undefined) return false;
  if (v === 'false') return false;
  if (v === 'true') return true;
  return true;
};
const withChunks = flagEnabled('with-chunks');
const withEmbeddings = flagEnabled('with-embeddings');
const resumeInput = resolveInput(args.resume || defaultInputs.resume);
const linkedinInput = resolveInput(args.linkedin || defaultInputs.linkedin);
const profileInput = resolveInput(args.profile || defaultInputs.profile);

async function main() {
  console.log('▶︎ ingest >> reading resume and LinkedIn exports');
  const [resumeText, linkedinText, profile] = await Promise.all([
    readDocument(resumeInput),
    readLinkedIn(linkedinInput),
    readProfile(profileInput)
  ]);

  const resumeSections = splitIntoSections(resumeText, 'resume');
  const linkedinSections = splitIntoSections(linkedinText, 'linkedin');
  const sections = [...resumeSections, ...linkedinSections];

  const chunks = createChunks(sections);
  console.log(`✔ created ${chunks.length} section-aware chunks`);

  const metadata = buildMetadata(profile, chunks);
  const seeds = buildSeedPayload(metadata);

  let embeddings = null;
  if (withEmbeddings) {
    embeddings = await maybeCreateEmbeddings(chunks);
    if (embeddings) {
      console.log(`✔ generated dense embeddings with model ${embeddings.model}`);
    } else {
      console.log('ℹ embeddings requested but generation failed (install @xenova/transformers for offline vectors)');
    }
  } else {
    console.log('ℹ embeddings generation skipped (not requested)');
  }

  await writeDataset({ chunks, metadata, embeddings, seeds, writeChunks: withChunks, writeEmbeddings: withEmbeddings });
  console.log('✅ ingest complete. Files saved to data/ and public/data/.');
}

main().catch((error) => {
  console.error('Ingest failed:', error);
  process.exitCode = 1;
});

function parseArgs(argv) {
  const named = {};
  argv.forEach((part) => {
    const [key, value] = part.split('=');
    if (key.startsWith('--')) {
      named[key.replace(/^--/, '')] = value ?? 'true';
    }
  });
  return named;
}

function resolveInput(target) {
  if (!target) return undefined;
  return path.isAbsolute(target) ? target : path.join(process.cwd(), target);
}

async function readDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const buffer = await fs.readFile(filePath);
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }
  if (ext === '.txt') {
    return fs.readFile(filePath, 'utf8');
  }
  throw new Error(`Unsupported resume format for ${filePath}`);
}

async function readLinkedIn(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') {
    const json = JSON.parse(await fs.readFile(filePath, 'utf8'));
    return JSON.stringify(json);
  }
  if (ext === '.html' || ext === '.htm') {
    const html = await fs.readFile(filePath, 'utf8');
    const $ = cheerio.load(html);
    return $('body').text();
  }
  throw new Error(`Unsupported LinkedIn format for ${filePath}`);
}

async function readProfile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`⚠ profile file missing at ${filePath}. Using minimal defaults.`);
    return {
      candidate: {
        name: 'Candidate',
        role: 'AI Engineer',
        headline: 'Generated profile',
        email: 'candidate@example.com',
        github: '#',
        location: 'Remote',
        resumeUrl: '/resume.pdf',
        linkedin: '#'
      },
      stats: {
        topSkills: [],
        topProjects: [],
        timeline: []
      }
    };
  }
}

function splitIntoSections(text, source) {
  const headings = {
    summary: ['summary', 'objective', 'profile'],
    experience: ['experience', 'work', 'career'],
    projects: ['projects', 'portfolio'],
    skills: ['skills', 'competencies'],
    education: ['education', 'academic'],
    publications: ['publications', 'talks'],
    timeline: ['timeline']
  };
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let current = 'summary';
  const sections = [];
  let buffer = [];

  const flush = () => {
    if (!buffer.length) return;
    sections.push({ section: current, text: buffer.join(' '), source });
    buffer = [];
  };

  for (const line of lines) {
    const normalized = line.toLowerCase();
    const headingMatch = Object.entries(headings).find(([, patterns]) =>
      patterns.some((pattern) => normalized.startsWith(pattern))
    );
    if (headingMatch) {
      flush();
      current = headingMatch[0];
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function createChunks(sections, chunkSize = 420, overlap = 60) {
  const chunks = [];
  let runningIndex = 0;
  sections.forEach((section, sectionIndex) => {
    const tokens = tokenize(section.text);
    for (let i = 0; i < tokens.length; i += chunkSize - overlap) {
      const slice = tokens.slice(i, i + chunkSize);
      if (!slice.length) continue;
      const text = slice.join(' ');
      const start = runningIndex + i;
      const end = start + text.length;
      chunks.push({
        id: `${section.section}-${sectionIndex}-${i}`,
        text,
        section: section.section,
        source: section.source,
        start,
        end,
        keywords: slice.slice(0, 12)
      });
    }
    runningIndex += section.text.length;
  });
  return chunks;
}

function tokenize(text) {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function buildMetadata(profile, chunks) {
  const yearsExperience = estimateYears(chunks);
  return {
    candidate: profile.candidate,
    stats: {
      yearsExperience,
      topSkills: profile.stats?.topSkills ?? [],
      topProjects: profile.stats?.topProjects ?? [],
      timeline: profile.stats?.timeline ?? []
    },
    generatedAt: new Date().toISOString()
  };
}

function estimateYears(chunks) {
  const years = chunks
    .filter((chunk) => chunk.section === 'experience' || chunk.section === 'timeline')
    .map((chunk) => {
      const match = chunk.text.match(/(20\d{2}|19\d{2})/);
      return match ? Number(match[0]) : null;
    })
    .filter(Boolean);
  if (!years.length) return 0;
  const minYear = Math.min(...years);
  return Math.max(new Date().getFullYear() - minYear, 0);
}

async function maybeCreateEmbeddings(chunks) {
  try {
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddings = [];
    for (const chunk of chunks) {
      const result = await extractor(chunk.text, { pooling: 'mean', normalize: true });
      embeddings.push({ id: chunk.id, embedding: Array.from(result.data) });
    }
    return {
      model: 'Xenova/all-MiniLM-L6-v2',
      dimension: embeddings[0]?.embedding.length ?? 0,
      kind: 'dense',
      embeddings
    };
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') {
      console.warn('Embedding generation failed:', error.message);
    }
    return null;
  }
}

async function writeDataset({ chunks, metadata, embeddings, seeds, writeChunks = false, writeEmbeddings = false }) {
  const payload = { chunks };
  const outDir = path.join(ROOT, 'data');
  const publicDir = path.join(ROOT, 'public', 'data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });
  if (writeChunks) {
    await fs.writeFile(path.join(outDir, 'chunks.json'), JSON.stringify(payload, null, 2));
    await fs.writeFile(path.join(publicDir, 'chunks.json'), JSON.stringify(payload, null, 2));
  }
  await fs.writeFile(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  await fs.writeFile(path.join(publicDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

  if (seeds) {
    await fs.writeFile(path.join(outDir, 'seeds.json'), JSON.stringify(seeds, null, 2));
    await fs.writeFile(path.join(publicDir, 'seeds.json'), JSON.stringify(seeds, null, 2));
  }

  if (writeEmbeddings && embeddings) {
    await fs.writeFile(path.join(outDir, 'embeddings.json'), JSON.stringify(embeddings, null, 2));
    await fs.writeFile(path.join(publicDir, 'embeddings.json'), JSON.stringify(embeddings, null, 2));
  }
}

function buildSeedPayload(metadata) {
  const candidate = metadata.candidate ?? {};
  const stats = metadata.stats ?? {};
  const years = stats.yearsExperience ? `${stats.yearsExperience}+ years` : 'the last few years';
  const topSkills = Array.isArray(stats.topSkills) ? stats.topSkills : [];
  const flagship = Array.isArray(stats.topProjects) ? stats.topProjects[0] : undefined;
  const evalProject = Array.isArray(stats.topProjects)
    ? stats.topProjects.find((project) => /eval/i.test(`${project.name} ${project.summary}`)) ?? flagship
    : undefined;
  const timeline = Array.isArray(stats.timeline) && stats.timeline.length ? stats.timeline[0] : undefined;
  const flagshipSummary = flagship?.summary ? flagship.summary.replace(/\.$/, '') : '';
  const flagshipImpact = flagship?.impact ?? '';

  const skillsLine = buildSkillsLine(topSkills);
  const headlineLine = humanizeHeadline(candidate.headline);
  const flagshipSentence = flagship
    ? `Recently I led ${flagship.name}, ${flagshipSummary || 'a flagship launch'}${flagshipImpact ? ` (${flagshipImpact}).` : '.'}`
    : null;

  const quickStory = [
    candidate.name
      ? `I'm ${candidate.name}, a ${candidate.role || 'Senior AI/ML Engineer'} focused on shipping AI that earns trust.`
      : `I'm an AI engineer focused on shipping trustworthy copilots.`,
    headlineLine,
    stats.yearsExperience ? `Over the past ${years} I've led launches across ${timeline?.label ?? 'fast-moving teams'}.` : null,
    flagshipSentence
  ]
    .filter(Boolean)
    .join(' ');

  const projectStory = flagship
    ? `At ${flagship.name} I owned the retrieval architecture, eval harness, and launch readiness. ${
        flagshipSummary || 'It was an end-to-end build covering research through rollout'
      }.${flagshipImpact ? ` The punchline: ${flagshipImpact}.` : ''}`
    : 'One flagship win was building a regulated-industry copilot with retrieval + eval guardrails that cut latency almost in half.';

  const evalStory = evalProject
    ? `For ${evalProject.name} I treated evaluation like code: curate gold questions, replay them through offline harnesses, and gate launches on precision + UX regressions. That rhythm keeps each copilot trustworthy.`
    : 'I pair every launch with offline eval suites, live shadow traffic, and regression dashboards so copilots stay trustworthy after day one.';

  const qaPairs = [
    { question: 'Give me the quick story.', answer: quickStory },
    {
      question: 'What are your strongest skills?',
      answer: skillsLine ||
        'I live in Python, TypeScript, retrieval stacks, and the MLOps tooling needed to run them in production.'
    },
    {
      question: flagship ? `Tell me about ${flagship.name}.` : 'Tell me about a flagship project.',
      answer: projectStory
    },
    {
      question: 'How do you evaluate or launch LLM copilots?',
      answer: evalStory
    }
  ];

  const messages = qaPairs.flatMap((pair) => [
    { role: 'user', content: pair.question },
    { role: 'assistant', content: pair.answer }
  ]);

  return {
    prompts: qaPairs.map((pair) => pair.question),
    messages,
    generatedAt: new Date().toISOString(),
    source: 'fallback'
  };
}

function buildSkillsLine(skills) {
  if (!skills || !skills.length) return '';
  const primary = skills.slice(0, 3).join(', ');
  const secondary = skills.slice(3, 6);
  if (!secondary.length) {
    return `I work daily with ${primary}.`;
  }
  return `I work daily with ${primary}, and round things out with ${secondary.join(', ')}.`;
}

function humanizeHeadline(headline) {
  if (!headline) return '';
  const replacements = {
    designs: 'designing',
    builds: 'building',
    leads: 'leading',
    drives: 'driving',
    architects: 'architecting',
    creates: 'creating'
  };
  const words = headline.trim().split(/\s+/);
  if (!words.length) return '';
  const first = words[0].toLowerCase();
  if (replacements[first]) {
    words[0] = replacements[first];
  }
  return `I focus on ${words.join(' ')}.`;
}
