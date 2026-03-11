'use client'

import { useState } from 'react'
import AnimePlayer from './AnimePlayer'

export default function AnimePlayerTest() {
  const [shikimoriId, setShikimoriId] = useState('52991') // Solo Leveling

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Anime Player Test</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={shikimoriId}
          onChange={(e) => setShikimoriId(e.target.value)}
          className="px-4 py-2 bg-white/10 rounded-lg border border-white/20"
          placeholder="Shikimori ID"
        />
      </div>

      <AnimePlayer
        shikimoriId={parseInt(shikimoriId)}
        title="Test Anime"
        initialEpisode={1}
      />

      <div className="mt-8 p-4 bg-white/5 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2 text-white/70">
          <li>Open browser console (F12)</li>
          <li>Check logs for &quot;Fetching servers&quot; and &quot;Received servers&quot;</li>
          <li>Click on server buttons to switch</li>
          <li>Check if server URLs are valid</li>
        </ol>
      </div>
    </div>
  )
}
