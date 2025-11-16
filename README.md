# AI Engineer Chat Portfolio

A chat-first, dual-theme portfolio (Vite + React + TypeScript + Tailwind) that showcases an AI engineer using retrieval over resume + LinkedIn exports. Visitors land on a pre-seeded conversation, immediately see first-person answers, and the app automatically calls OpenRouter (with a repo-level key) or falls back to the local summarizer. All heavy processing happens offline via `npm run ingest`.

## ✨ Highlights

- High-contrast default light theme with tasteful dark mode toggle, refreshed chat bubbles, and contextual side panels.
- Retrieval engine with hybrid dense (optional embeddings) + TF-IDF fallback plus seeded Q&A generated during ingest.
- Automatic OpenRouter integration that uses a deployer-provided API key (no UI prompts) with deterministic first-person answers, plus a local summarizer fallback for offline use.
- Privacy-first: data stays inside the repo; runtime only fetches `public/data/*.json` generated via `npm run ingest`.
- Totally hands-free onboarding: ingest creates `seeds.json` so the chat already has a convincing conversation and updated prompt chips before a visitor types anything.

## 🗂 Project structure

```
├── ingest/ingest.js        # Offline chunker + optional embeddings
├── data/                   # Generated datasets (mirrored to public/data)
├── public/                 # Static assets (favicons, resume, data files)
├── src/                    # React app (components, lib, types)
└── README.md
```

## 🚀 Getting started

```bash
npm install
npm run ingest   # preprocess resume/linkedin + generate seeds
npm run dev      # start Vite on http://localhost:5173
```

Set an OpenRouter key once via env (no runtime prompt):

```bash
# PowerShell
$env:VITE_OPENROUTER_KEY="sk-or-..."
npm run dev
```

> Omit the env var to stay in local-summarizer-only mode.

Or drop the key into a `.env.local` file (not checked in):

```
VITE_OPENROUTER_KEY=sk-or-...
### If you get CORS errors

OpenRouter's public endpoints might block cross-origin requests — browsers require the server to opt in to CORS. If you see 404 or CORS errors in the console (common when the provider blocks direct browser calls), run a server-side proxy locally that forwards the request securely and keeps your API key out of the browser.

1. Install dependencies for the local proxy:

```powershell
npm install --save-dev express cors node-fetch
```

2. Set your openrouter key in the server process (not the browser env):

```powershell
$env:OPENROUTER_KEY="sk-or-..."
npm run proxy
```

3. (Optional) Set your client to call the proxy by adding the env var to point to the local proxy

```
VITE_OPENROUTER_URL=http://localhost:3000/openrouter/chat
```

This prevents CORS issues and keeps the deployer key secret.

If you find the client returns an HTTP 404 for the OpenRouter call, the host path may differ for your deployment or the provider changed the default API path. You can override the endpoint with:

```
VITE_OPENROUTER_URL=https://api.openrouter.ai/v1/chat/completions
```

This will try the specified endpoint first; `https://api.openrouter.ai/v1/chat/completions` and `https://openrouter.ai/v1/chat/completions` are also attempted as fallbacks.
```

### Preprocessing (`npm run ingest`)

1. Export your resume (`resume.pdf` or `resume.txt`) and LinkedIn data (`linkedin.html` or `linkedin.json`).
2. Place them at the repo root or pass custom paths:
   ```bash
   npm run ingest -- --resume=path/to/resume.pdf --linkedin=path/to/linkedin.html
   ```
3. Update `data/profile.json` (copy from `data/profile.sample.json`) with contact links, top skills/projects, and timeline info.
4. Run `npm run ingest`. The script will:
   - Parse the resume/LinkedIn files.
   - Chunk text into 250–500 token segments with 50-token overlaps.
   - Build `data/chunks.json`, `data/metadata.json`, and a `data/seeds.json` transcript (all mirrored to `public/data`).
   - Attempt to generate dense embeddings using `@xenova/transformers` if that package is installed locally. Otherwise it falls back to keyword/Tf-idf search. Install tip:
     ```bash
     npm install @xenova/transformers
     ```
   - Leave `data/embeddings.json` untouched if embeddings are unavailable.

> **Note:** The ingest script includes only offline-safe libraries (`pdf-parse`, `cheerio`). No API keys are required.

### Development scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Type-check + production bundle |
| `npm run preview` | Preview built assets |
| `npm run ingest` | Run preprocessing pipeline |
| `npm run deploy` | Publish `dist/` to GitHub Pages via `gh-pages` |
| `npm run clean` | Remove `dist` + `.vite` |

## 📦 Deployment to GitHub Pages

1. Set `VITE_BASE_PATH` if your repo uses a project subpath (e.g., `/your-repo/`):
   ```bash
   $env:VITE_BASE_PATH="/your-repo/"
   npm run build
   ```
2. Deploy:
   ```bash
   npm run deploy
   ```
3. Ensure `public/data` contains the processed dataset before pushing; GitHub Pages hosts the static JSON.

## 🔐 Privacy & security

- All resume/LinkedIn processing happens locally. Only the generated JSON lives in the repo.
- No third-party analytics or trackers are loaded.
- OpenRouter calls use the deployer's `VITE_OPENROUTER_KEY` env var at build/runtime; visitors never see or paste keys. Leave the env unset to force the deterministic local summarizer.
- To rotate personal data, delete/replace files in `data/` and rerun `npm run ingest` before committing.

## 🧠 Runtime behavior

- The client fetches `data/chunks.json` / `metadata.json` / `seeds.json` (and `embeddings.json` if present).
- Retrieval: tries hybrid dense+tf-idf search. If embeddings or the browser embedder fail, it falls back to TF-IDF only.
- Answering:
   - **API mode**: The app automatically sends the question + retrieved context to `https://openrouter.ai/api/v1/chat/completions` using the `VITE_OPENROUTER_KEY` env var and a first-person system prompt.
   - **Local mode**: Uses a deterministic summarizer with evidence bullets and a confidence label.
- Seed data: ingest generates an initial Q&A transcript + prompt chips so the chat looks alive before visitors interact.

## ♿ Accessibility & UX

- Keyboard-friendly chat input (Enter to send, Shift+Enter for newline).
- Light theme by default plus a single-click dark mode toggle.
- Chips preload recruiter-style questions from ingest + fallbacks.
- Responsive layout switches to stacked panels on mobile; chat input pins to the bottom area.

## 🔧 Troubleshooting

- **“Failed to load data files” banner**: Ensure `npm run ingest` was executed and `public/data/*.json` exists.
- **Embedding generation skipped**: Install `@xenova/transformers` (optional) or rely on TF-IDF fallback.
- **GitHub Pages blank screen**: Set `VITE_BASE_PATH` to your repo subpath before `npm run build`/`npm run deploy`.

Happy showcasing! ✨
