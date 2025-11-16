# AI Engineer Chat Portfolio

A chat-first, dual-theme portfolio (Vite + React + TypeScript + Tailwind) that showcases an AI engineer and relies on OpenRouter for Q&A over provided profile metadata and seeded transcript. Visitors land on a pre-seeded conversation, immediately see first-person answers, and the app calls OpenRouter (via a server-side proxy by default). Generating metadata and a seeded transcript via `npm run ingest` is optional but helpful to provide a rich profile context.

## ✨ Highlights

- High-contrast default light theme with tasteful dark mode toggle, refreshed chat bubbles, and contextual side panels.
 - Optional seeded Q&A generated during ingest (seed transcript + metadata).
   - Automatic OpenRouter integration that uses a deployer-provided API key (no UI prompts) and deterministic first-person answers via server-side proxy.
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

> If you omit the env var, the server proxy won't be able to call OpenRouter; set `OPENROUTER_KEY` on the server to enable Q&A.

Or drop the key into a `.env.local` file (not checked in):

```
VITE_OPENROUTER_KEY=sk-or-...
```

## 🌐 Deploying to Netlify

This app is designed to deploy seamlessly to Netlify with built-in serverless function support.

### Required Configuration

**CRITICAL**: You must set the `OPENROUTER_KEY` environment variable in Netlify for the chat to work:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Set:
   - **Key**: `OPENROUTER_KEY`
   - **Value**: Your OpenRouter API key (starts with `sk-or-v1-...`)
   - **Scopes**: Deploy contexts (Production, Deploy Previews, Branch deploys)
5. Click **Save**
6. **Redeploy your site** for the environment variable to take effect

### Get an OpenRouter API Key

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up or log in
3. Go to **Keys** section
4. Create a new API key
5. Copy the key (it starts with `sk-or-v1-...`)

### Deploy Steps

```bash
# Build locally to test
npm run build

# Deploy to Netlify (if using Netlify CLI)
netlify deploy --prod

# Or connect your GitHub repo to Netlify for automatic deployments
```

The `netlify.toml` file is already configured with the correct build settings and serverless function paths.

### Troubleshooting Netlify Deployment

**401 Error: "User not found"**
- This means `OPENROUTER_KEY` is not set in Netlify environment variables
- Follow the configuration steps above and redeploy

**Function not found**
- Ensure `netlify.toml` has `functions = "netlify/functions"`
- Check that `netlify/functions/chat.js` exists in your repo

**CORS errors**
- The function now includes proper CORS headers
- Make sure you're using the latest version of `netlify/functions/chat.js`

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
OpenRouter calls are proxied by the server and use the deployer's `OPENROUTER_KEY` environment variable; visitors never see or paste keys. If the server key is not set, API calls will return 401 and Q&A will be unavailable.
- To rotate personal data, delete/replace files in `data/` and rerun `npm run ingest` before committing.

## 🧠 Runtime behavior

   - The client fetches `data/metadata.json` and `data/seeds.json` (optional `data/chunks.json`/`data/embeddings.json` if you still want local retrieval in custom builds).
   - Answering: The app sends the user's question and any supplied profile/seed data to OpenRouter via the server proxy for answers; there is no local summarizer fallback.
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
