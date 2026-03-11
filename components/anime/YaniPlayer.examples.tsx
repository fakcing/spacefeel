// Example: How to use YaniPlayer in your anime detail page
// Copy this pattern to your app/anime/[id]/page.tsx or create a new page

'use client'

import YaniPlayer from '@/components/anime/YaniPlayer'

// Example 1: Simple usage with Shikimori ID
export function SimpleExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Anime Player</h2>
      <YaniPlayer shikimoriId="52991" /> {/* Example: Solo Leveling */}
    </div>
  )
}

// Example 2: With TMDB ID and title
export function WithTmdbExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <YaniPlayer 
        tmdbId="92783" 
        title="Attack on Titan"
      />
    </div>
  )
}

// Example 3: Dynamic usage with state
export function DynamicExample() {
  const shikimoriId = "52991" // This could come from props, URL, etc.
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <YaniPlayer 
        shikimoriId={shikimoriId}
        title="Solo Leveling"
      />
    </div>
  )
}

// Example 4: Multiple players on one page
export function MultiplePlayersExample() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-2">Season 1</h3>
        <YaniPlayer shikimoriId="52991" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Season 2</h3>
        <YaniPlayer shikimoriId="51707" />
      </div>
    </div>
  )
}
