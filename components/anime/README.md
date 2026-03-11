# Yani TV Player Component

A client-side React component for playing anime videos using the Yani TV API. This component fetches video data directly from the browser (client-side), which solves the Vercel deployment issue where server-side requests fail due to IP mismatch.

## Features

- ✅ Client-side API requests (works on Vercel)
- ✅ Support for both TMDB and Shikimori IDs
- ✅ Episode selection
- ✅ Multiple dubbing support
- ✅ Loading state with skeleton
- ✅ Error handling
- ✅ Responsive 16:9 aspect ratio
- ✅ Tailwind CSS styling

## Setup

### 1. Add Environment Variable

Add your Yani TV API token to your `.env.local` file:

```bash
NEXT_PUBLIC_YANI_TV_TOKEN=your_yani_tv_token_here
```

**Important:** The `NEXT_PUBLIC_` prefix is required because the component makes client-side requests.

### 2. Usage Examples

#### Basic usage with Shikimori ID

```tsx
import YaniPlayer from '@/components/anime/YaniPlayer'

export default function AnimePage() {
  return (
    <div>
      <YaniPlayer shikimoriId="12345" />
    </div>
  )
}
```

#### With TMDB ID

```tsx
<YaniPlayer tmdbId="92783" />
```

#### With title display

```tsx
<YaniPlayer 
  shikimoriId="12345" 
  title="Attack on Titan" 
/>
```

#### With both IDs (Shikimori takes priority)

```tsx
<YaniPlayer 
  tmdbId="92783"
  shikimoriId="12345" 
  title="Attack on Titan" 
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tmdbId` | `string \| number` | ❌ | TMDB ID of the anime |
| `shikimoriId` | `string \| number` | ❌ | Shikimori ID of the anime (takes priority if both provided) |
| `title` | `string` | ❌ | Optional title to display in the player header |

**Note:** At least one of `tmdbId` or `shikimoriId` must be provided.

## States

### Loading
Shows a spinner while fetching video data from Yani TV API.

### Error
Displays an error message with a retry button if:
- API token is not configured
- No ID is provided
- Anime is not found
- Network error occurs

### Ready
Shows the video player with:
- Episode selector dropdown
- Dubbing selector (if multiple available)
- Optional title display

## How It Works

1. **Client-side fetch**: The component uses `useEffect` to fetch data from Yani TV API when the component mounts
2. **API flow**:
   - First requests the anime ID using Shikimori/TMDB ID via `/anileak/shikimori/:id` or `/anileak/tmdb/:id`
   - Then fetches all videos using `/anime/:animeId/videos`
3. **Iframe rendering**: The video is displayed in a protected iframe with the Yani TV player URL

## Why Client-Side?

The original issue with Vercel deployment was:
- Server-side requests come from Vercel's IP address
- Client-side playback is from the user's IP address
- Kodik blocks requests when IPs don't match

By making all API requests from the client (browser), the IP addresses match and the player works correctly.

## Troubleshooting

### "API token not configured"
Make sure you've set `NEXT_PUBLIC_YANI_TV_TOKEN` in your `.env.local` file and restarted the dev server.

### "Anime not found"
The anime might not be available on Yani TV. Try searching for it on their platform first.

### "Failed to fetch videos"
Check your internet connection and ensure the Yani TV API is accessible from your region.
