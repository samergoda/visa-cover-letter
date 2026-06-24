# Visa Cover Letter Generator

Production-ready web application for visa agencies to generate professional embassy cover letters using AI.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components
- OpenRouter API
- React Hook Form + Zod
- DOCX and PDF export

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables and add your API key:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/generate` — Client form and AI letter generation
- `/history` — Locally stored letter history
- `/settings` — Model preference and API key status

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Server-side OpenRouter API key |
| `NEXT_PUBLIC_OPENROUTER_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1` |

The API key is read on the server only and is never exposed to the browser.

## Models

Default: `deepseek/deepseek-chat-v3`

Also supported:

- `openai/gpt-4o-mini`
- `qwen/qwen-3-235b-a22b`
- `google/gemini-2.5-flash`

## Security Note

Do not commit `.env.local` or share API keys publicly.
