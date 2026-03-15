# VibeJudge

VibeJudge is a Next.js app that reviews how a social profile comes across. The user enters a few basics, pastes a bio, uploads screenshots, and gets a structured AI review with strengths, weak points, low-aura factors, and practical next steps.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Official `ollama` npm package
- Server-side Ollama integration through `/api/judge`

## Ollama Setup

VibeJudge now uses the official JavaScript Ollama client on the server side.

Production and Netlify deployments must use Ollama Cloud directly.

Required for deployed environments:

1. Create an Ollama API key at `https://ollama.com/settings/keys`.
2. Add `OLLAMA_API_KEY` to your Netlify environment variables.

When `OLLAMA_API_KEY` is set, VibeJudge calls Ollama Cloud at `https://ollama.com` from the Next.js server route.

Optional local development fallback:

1. Install Ollama on your machine.
2. Sign in once:

```bash
ollama signin
```

3. Pull the cloud model:

```bash
ollama pull gpt-oss:120b-cloud
```

If `OLLAMA_API_KEY` is not set, VibeJudge only falls back to your local Ollama instance during local development. Production builds do not attempt `localhost`.

## Environment Variables

Create `.env.local` in the project root.

Required in practice:

```env
OLLAMA_MODEL=gpt-oss:120b-cloud
```

Required for Netlify or any deployed production runtime:

```env
OLLAMA_API_KEY=your_ollama_cloud_api_key_here
```

Notes:

- `OLLAMA_MODEL` defaults to `gpt-oss:120b-cloud` in code, so the app will still boot if you forget to add it.
- If `OLLAMA_API_KEY` is set, the server route uses Ollama Cloud directly at `https://ollama.com`.
- If `OLLAMA_API_KEY` is not set, localhost is only used during local `npm run dev`.
- Netlify and other deployed production runtimes must provide `OLLAMA_API_KEY`; they cannot reach your computer's local Ollama instance.

## Install

1. Install Node dependencies. This includes the official `ollama` JavaScript package:

```bash
npm install
```

2. Copy the env template:

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

3. Set `OLLAMA_MODEL=gpt-oss:120b-cloud` in `.env.local`.

4. Add `OLLAMA_API_KEY` if you want the same Ollama Cloud path locally that production uses.

## Run

```bash
npm run dev
```

Open:

- `http://localhost:3000`

Useful commands:

```bash
npm run dev:web
npm run lint
npm run typecheck
npm run build
```

## Troubleshooting

If the app says Ollama could not be reached:

- In Netlify or any deployed environment, set `OLLAMA_API_KEY`
- For local development without `OLLAMA_API_KEY`, start Ollama locally
- Run `ollama signin`
- Run `ollama pull gpt-oss:120b-cloud`

If you see stale Next.js cache errors:

Windows PowerShell:

```powershell
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item tsconfig.tsbuildinfo -Force -ErrorAction SilentlyContinue
npm run dev
```

macOS/Linux:

```bash
rm -rf .next tsconfig.tsbuildinfo
npm run dev
```

## Main Files

- `app/api/judge/route.ts`
- `lib/ai/ollama.ts`
- `components/judge/judge-workbench.tsx`
- `components/judge/result-card.tsx`
- `lib/validations.ts`
- `.env.example`
