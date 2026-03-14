# SpaceFeel

A modern streaming platform for anime, movies, TV shows and cartoons — built with Next.js 14.

**[spacefeel.vercel.app](https://spacefeel.vercel.app/)**

---

## Features

- Anime catalog with episode player (AniLibria, AnimeVost sources)
- Movies, TV shows & cartoons via TMDB
- Search across all content
- Watchlist & watch history
- User ratings
- Auth (credentials + OAuth)
- Light / dark theme
- Multilingual: EN, RU, UK, DE, ES, FR, JA, KO

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Auth | NextAuth v5 |
| Database | PostgreSQL (Neon) + Prisma |
| Data | TMDB API, AniLibria, AnimeVost |

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for all required variables:

- `NEXTAUTH_SECRET` — auth secret
- `DATABASE_URL` — Neon PostgreSQL connection string
- `TMDB_API_KEY` — [themoviedb.org](https://www.themoviedb.org/)
- OAuth keys (Google, GitHub) — optional
