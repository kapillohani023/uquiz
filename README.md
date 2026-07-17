This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

Copy `.env.example` to `.env` (or create `.env`) and fill in the values:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/uquiz

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

- `DATABASE_URL` — connection string for the database from step 2.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from a [Google Cloud OAuth client](https://console.cloud.google.com/apis/credentials) with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
- `NEXTAUTH_SECRET` — any random string (generate one with `openssl rand -base64 32`).

### 4. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
