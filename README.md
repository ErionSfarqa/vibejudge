# VibeJudge

VibeJudge is a Next.js app that reviews how a social profile comes across. The live product now uses a guided onboarding flow instead of a plain form: users answer a few quick questions about their lifestyle, confidence, goals, and desired vibe, then add bio text and screenshots before getting a dedicated result page.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Official `ollama` npm package
- Server-side AI integration through `/api/judge`

## Guided Review Flow

The judge page now walks through:

1. Intro screen
2. Name
3. Age
4. Gender
5. Gym routine
6. Training frequency when relevant
7. Current goal
8. Lifestyle
9. Main improvement focus
10. Social confidence
11. Desired vibe
12. Bio / current profile text
13. Extra context
14. Screenshot upload
15. Loading transition
16. Dedicated result page

The richer questionnaire answers are included in the AI prompt so the result can comment on profile clarity, confidence, lifestyle signals, and what habits help or hurt the overall impression.

## Ollama Production Setup

VibeJudge uses the official JavaScript Ollama client on the server side.

Production and Netlify deployments must use Ollama Cloud directly.

Required for deployed environments:

1. Create an Ollama API key at `https://ollama.com/settings/keys`.
2. Add `OLLAMA_API_KEY` to your production environment variables.

When `OLLAMA_API_KEY` is present, the server route calls Ollama Cloud at `https://ollama.com` and sends:

- `host: "https://ollama.com"`
- `Authorization: Bearer ${process.env.OLLAMA_API_KEY}`

If `OLLAMA_API_KEY` is missing in production, VibeJudge does not try `localhost`. It returns a structured API error and the frontend shows a polished message instead of a raw crash.

### Local Development Fallback

Local development can still use a local Ollama instance when `OLLAMA_API_KEY` is not set.

1. Install Ollama on your machine.
2. Sign in:

```bash
ollama signin
```

3. Pull the model:

```bash
ollama pull gpt-oss:120b-cloud
```

If `OLLAMA_API_KEY` is missing locally, the app falls back to `http://127.0.0.1:11434`. That fallback is development-only.

## Environment Variables

Copy `.env.example` to `.env.local` and set the values you need.

```env
OLLAMA_MODEL=gpt-oss:120b-cloud
# OLLAMA_API_KEY=your_ollama_cloud_api_key_here
```

Notes:

- `OLLAMA_API_KEY` is required for Netlify or any deployed production runtime.
- `OLLAMA_MODEL` defaults to `gpt-oss:120b-cloud` if you do not override it.
- `OLLAMA_MODEL` stays configurable in both local and deployed environments.

## Local Run Instructions

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

3. Set `OLLAMA_MODEL` in `.env.local`.
4. Optional for local cloud mode: add `OLLAMA_API_KEY`.
5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

Useful commands:

```bash
npm run build
npm run lint
npm run typecheck
```

## Netlify Deploy Instructions

1. Push the project to your Git provider.
2. Connect the repo to Netlify as a Next.js site.
3. In Netlify environment variables, set:
   - `OLLAMA_API_KEY`
   - `OLLAMA_MODEL` if you want to override the default model
4. Deploy the site with the normal project build command:

```bash
npm run build
```

Important:

- Do not expect Netlify to reach a local Ollama app on your computer.
- Do not rely on `ollama serve` for production.
- The deployed app must use Ollama Cloud directly.

## Troubleshooting

If the live site shows that the AI service is not configured yet:

- Add `OLLAMA_API_KEY` to the deployed environment
- Redeploy the site

If local development cannot reach Ollama:

- Start Ollama locally
- Run `ollama signin`
- Run `ollama pull gpt-oss:120b-cloud`
- Or add `OLLAMA_API_KEY` to use the same cloud path locally

## Main Files

- `app/api/judge/route.ts`
- `lib/ai/ollama.ts`
- `components/judge/judge-workbench.tsx`
- `lib/types.ts`
- `lib/validations.ts`
- `.env.example`
