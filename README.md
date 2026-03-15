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

Recommended local cloud-model workflow:

1. Install Ollama on your machine.
2. Sign in once:

```bash
ollama signin
```

3. Pull the cloud model:

```bash
ollama pull gpt-oss:120b-cloud
```

Optional direct cloud API workflow:

- Create an Ollama API key at `https://ollama.com/settings/keys`
- Add `OLLAMA_API_KEY` to `.env.local`

If `OLLAMA_API_KEY` is set, VibeJudge calls Ollama Cloud directly from the Next.js server route. If it is not set, VibeJudge uses your local Ollama app or daemon.

## Environment Variables

Create `.env.local` in the project root.

Required in practice:

```env
OLLAMA_MODEL=gpt-oss:120b-cloud
```

Optional:

```env
OLLAMA_API_KEY=your_ollama_cloud_api_key_here
```

Notes:

- `OLLAMA_MODEL` defaults to `gpt-oss:120b-cloud` in code, so the app will still boot if you forget to add it.
- If you use `OLLAMA_API_KEY`, the server route uses Ollama Cloud directly.
- If you do not use `OLLAMA_API_KEY`, make sure Ollama is running locally and that you already pulled `gpt-oss:120b-cloud`.

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

4. If you want direct cloud API access from the Next.js server route, also add `OLLAMA_API_KEY`.

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

- Start Ollama locally
- Run `ollama signin`
- Run `ollama pull gpt-oss:120b-cloud`
- Or add `OLLAMA_API_KEY` to use the direct cloud API path

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
