# 🎬 SpaceFeel Player Parsing System

## Overview

A backend parsing system that extracts video players from external sources for movies, TV shows, and cartoons.

---

## 📁 File Structure

```
spacefeel/
├── prisma/
│   ├── schema.prisma                      ← Added PlayerCache model
│   └── migrations/
│       └── 20260311000000_add_player_cache/
│           ├── migration.sql              ← SQL migration
│           └── migration-lock.toml
├── types/
│   └── player.ts                          ← TypeScript types
├── lib/
│   ├── tmdb.ts                            ← Added getImdbId() function
│   └── playerService.ts                   ← Player aggregator
├── services/
│   └── parsers/
│       ├── source1.ts                     ← Parser 1
│       ├── source2.ts                     ← Parser 2
│       └── source3.ts                     ← Parser 3
├── app/
│   └── api/
│       └── player/
│           └── [tmdbId]/
│               └── route.ts               ← API endpoint
├── components/
│   └── detail/
│       └── ParsedPlayer.tsx               ← Frontend player component
└── examples/
    └── movie-page-example.tsx             ← Usage example
```

---

## 🗄️ Database Schema

### PlayerCache Model

```prisma
model PlayerCache {
  id        Int      @id @default(autoincrement())
  tmdbId    Int
  type      String   // movie, tv, cartoon
  source    String   // parser source name
  iframe    String   // iframe URL
  quality   String?  // quality info (optional)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tmdbId, source, type])
  @@map("player_cache")
}
```

**Caching Strategy:**
- Cache valid for **24 hours**
- Unique constraint on `(tmdbId, source, type)`
- Automatic cache invalidation after TTL

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install axios cheerio
```

### 2. Run Migration

```bash
# Option 1: Using Prisma Migrate (if DIRECT_URL available)
npx prisma migrate dev --name add_player_cache

# Option 2: Manual SQL (if only DATABASE_URL available)
# Copy migration.sql content and run manually on your database
psql $DATABASE_URL < prisma/migrations/20260311000000_add_player_cache/migration.sql

# Option 3: Push schema (development only)
npx prisma db push
```

### 3. Configure Environment

No additional environment variables needed. The system uses:
- `NEXT_PUBLIC_TMDB_API_KEY` (already configured)

### 4. Test the System

```bash
npm run dev
```

Visit: `/movies/{id}` to see the player in action.

API Endpoint: `GET /api/player/{tmdbId}?type=movie|tv|cartoon`

---

## 📡 API Reference

### Get Players

**Endpoint:** `GET /api/player/{tmdbId}?type={type}`

**Parameters:**
- `tmdbId` (path) - TMDB ID of the content
- `type` (query) - One of: `movie`, `tv`, `cartoon`

**Response:**
```json
{
  "servers": [
    {
      "name": "Source1",
      "iframe": "https://example.com/player/abc123",
      "quality": "HD",
      "source": "Source1"
    },
    {
      "name": "Source2",
      "iframe": "https://example.com/embed/xyz789",
      "quality": "HD",
      "source": "Source2"
    }
  ],
  "cached": true,
  "cachedAt": "2026-03-11T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `404` - No IMDB ID found or no sources available
- `500` - Server error

---

## 🕷️ Parser Architecture

### Parser Interface

Each parser implements the same pattern:

```typescript
import { ParserResult } from '@/types/player'

export async function parseSource1(imdbId: string): Promise<ParserResult> {
  // 1. Fetch HTML from source
  // 2. Parse with cheerio
  // 3. Extract iframe URL
  // 4. Return result
  return {
    source: 'Source1',
    iframe: 'https://...',
    quality: 'HD',
  }
}
```

### ParserResult Type

```typescript
interface ParserResult {
  source: string
  iframe: string | null
  quality?: string
  error?: string
}
```

---

## ➕ How to Add New Sources

### Step 1: Create Parser File

Create `services/parsers/source4.ts`:

```typescript
import axios from 'axios'
import * as cheerio from 'cheerio'
import { ParserResult } from '@/types/player'

export async function parseSource4(imdbId: string): Promise<ParserResult> {
  const source = 'Source4'
  
  try {
    // 1. Make request to source
    const response = await axios.get(`https://source4.com/embed/${imdbId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 ...',
        'Accept': 'text/html',
      },
      timeout: 10000,
    })

    // 2. Parse HTML
    const $ = cheerio.load(response.data)

    // 3. Extract iframe (adjust selectors)
    let iframeUrl: string | null = null
    
    $('iframe').each((_, el) => {
      const src = $(el).attr('src')
      if (src && src.includes('player')) {
        iframeUrl = src.startsWith('//') ? `https:${src}` : src
        return false
      }
    })

    if (!iframeUrl) {
      return { source, iframe: null, error: 'No iframe found' }
    }

    return {
      source,
      iframe: iframeUrl,
      quality: 'HD',
    }
  } catch (error) {
    return {
      source,
      iframe: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

### Step 2: Register Parser

Update `lib/playerService.ts`:

```typescript
import { parseSource4 } from '@/services/parsers/source4'

async function runAllParsers(imdbId: string): Promise<ParserResult[]> {
  const parsers = [
    { name: 'Source1', fn: () => parseSource1(imdbId) },
    { name: 'Source2', fn: () => parseSource2(imdbId) },
    { name: 'Source3', fn: () => parseSource3(imdbId) },
    { name: 'Source4', fn: () => parseSource4(imdbId) }, // ← Add here
  ]
  // ...
}
```

### Step 3: Test

```bash
curl http://localhost:3000/api/player/634649?type=movie
```

---

## 🎯 Frontend Integration

### Basic Usage

```tsx
import ParsedPlayer from '@/components/detail/ParsedPlayer'

export default function MoviePage() {
  return (
    <ParsedPlayer 
      tmdbId={634649} 
      type="movie" 
    />
  )
}
```

### With Season/Episode (TV Shows)

```tsx
<ParsedPlayer 
  tmdbId={1399} 
  type="tv" 
  season={1}
  episode={1}
/>
```

### Manual Fetch

```tsx
const res = await fetch(`/api/player/${tmdbId}?type=${type}`)
const data = await res.json()

// data.servers = [{ name, iframe, quality, source }, ...]
```

---

## ⚙️ Configuration

### Cache TTL

Default: **24 hours**

Change in `lib/playerService.ts`:

```typescript
const CACHE_TTL_HOURS = 24 // Change this value
```

### Parser Timeout

Default: **10 seconds**

Change in each parser:

```typescript
const response = await axios.get(url, {
  timeout: 10000, // Change this value
})
```

### User-Agent

Update in each parser to match your requirements:

```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
}
```

---

## 🐛 Troubleshooting

### No Sources Found

**Problem:** API returns 404 with "No video sources found"

**Solutions:**
1. Check if IMDB ID exists: `GET /api/player/{tmdbId}?type=movie`
2. Verify parsers are working (check logs)
3. Clear cache: `prisma.playerCache.deleteMany({ where: { tmdbId } })`

### Parser Timeout

**Problem:** Parser returns timeout error

**Solutions:**
1. Increase timeout in parser config
2. Check if source website is accessible
3. Update User-Agent header

### Cache Not Working

**Problem:** Always fetching from parsers, not using cache

**Solutions:**
1. Check database connection
2. Verify PlayerCache table exists
3. Check `createdAt` timestamps

---

## 📝 Legal Considerations

⚠️ **Important:** This system is for educational purposes. Ensure you:

1. Have rights to access the content
2. Comply with source websites' Terms of Service
3. Respect copyright laws in your jurisdiction
4. Consider using official APIs when available

---

## 🚀 Production Checklist

- [ ] Update parser URLs to real sources
- [ ] Configure proper User-Agent strings
- [ ] Set up monitoring for parser failures
- [ ] Implement rate limiting per IP
- [ ] Add error logging (Sentry, LogRocket, etc.)
- [ ] Set up cache warming for popular content
- [ ] Configure CDN for iframe delivery (if applicable)
- [ ] Test with real IMDB IDs

---

## 📚 Additional Resources

- [Cheerio Documentation](https://cheerio.js.org/)
- [Axios Documentation](https://axios-http.com/)
- [Prisma ORM](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)

---

## 🎉 Ready!

The system is now ready to parse video players from external sources. Remember to:

1. Replace example URLs with real sources
2. Test thoroughly before deployment
3. Monitor parser performance
4. Keep parsers updated as sources change
