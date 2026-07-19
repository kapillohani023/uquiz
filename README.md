# uquiz

uquiz turns YouTube videos into study material. Paste a link into a course,
and uquiz pulls the transcript, then an LLM generates a multiple-choice quiz
from it — pick the question count, difficulty, and time limit, take the quiz,
and get scored instantly.

## Features

- **Courses** — group YouTube resources by subject and toggle which ones feed
  into quiz generation.
- **AI-generated quizzes** — transcripts are sent to an LLM (via OpenRouter)
  to produce multiple-choice questions at a configurable difficulty.
- **Timed quiz-taking** — take a generated quiz against a countdown timer and
  see a scored results screen.
- **Google sign-in** — authentication via NextAuth (Auth.js) with Google
  OAuth.

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Prisma ·
PostgreSQL · NextAuth (Auth.js) · OpenRouter · Bun

## Getting Started

### 1. Install Bun

This project uses [Bun](https://bun.sh) as the package manager and runtime.

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify the install with `bun --version`, then install dependencies:

```bash
bun install
```

### 2. Set up a local database

Auth (via Prisma) needs a Postgres database. The easiest way locally is Docker:

```bash
docker run --name uquiz-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=uquiz -p 5432:5432 -d postgres
```

Or point `DATABASE_URL` at any Postgres instance you already have running (local install, Supabase, etc.).

Once the database is reachable, apply the schema:

```bash
bunx prisma migrate dev
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — connection string for the database from step 2.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from a [Google Cloud OAuth client](https://console.cloud.google.com/apis/credentials) with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
- `NEXTAUTH_SECRET` — any random string (generate one with `openssl rand -base64 32`).
- `OPENROUTER_API_KEY` — API key from [OpenRouter](https://openrouter.ai/keys), used to generate quiz questions.

### 4. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
