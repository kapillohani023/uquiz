# uquiz

uquiz turns YouTube videos into study material. Paste a link into a course,
and uquiz pulls the transcript, then an LLM generates a multiple-choice quiz
from it — pick the question count, difficulty, and time limit, take the quiz,
and get scored instantly.

## Features

- **Courses** — group YouTube resources by subject and toggle which ones feed
  into quiz generation.
- **AI-generated quizzes** — transcripts are sent to an LLM (via Google ADK
  and Gemini) to produce multiple-choice questions at a configurable
  difficulty.
- **Timed quiz-taking** — take a generated quiz against a countdown timer and
  see a scored results screen.
- **Google sign-in** — authentication via NextAuth (Auth.js) with Google
  OAuth.

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Prisma ·
PostgreSQL · NextAuth (Auth.js) · Google ADK / Gemini · Bun

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

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Connection string for the database from step 2. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From a [Google Cloud OAuth client](https://console.cloud.google.com/apis/credentials) with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI. |
| `YOUTUBE_API_KEY` | [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key, used to fetch video titles/thumbnails for resources. |
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/apikey), used by the Google ADK / Gemini pipeline to fetch transcripts and generate quiz questions. |
| `NEXTAUTH_SECRET` | Any random string (generate one with `openssl rand -base64 32`), used to sign NextAuth session tokens. |
| `NEXTAUTH_URL` | Base URL of the app, e.g. `http://localhost:3000`. |
| `AUTH_TRUST_HOST` | Set to `true` to trust the host header (needed in dev/behind proxies). |

### 4. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database migrations

Whenever you change `prisma/schema.prisma`, create and apply a migration:

```bash
bunx prisma migrate dev --name "message"
```

Replace `"message"` with a short description of the change (e.g. `"add-quiz-attempt-table"`). This writes a new migration under `prisma/migrations`, applies it to your dev database, and regenerates the Prisma Client. Do this after every schema change, and commit the generated migration folder.

In production/CI, apply already-committed migrations without generating new ones or prompting:

```bash
bunx prisma migrate deploy
```

Other useful commands:

```bash
bunx prisma generate       # regenerate the Prisma Client without migrating
bunx prisma migrate status # check for pending/unapplied migrations
bunx prisma studio         # browse the database in a local UI
```
