import axios from 'axios'
import * as cheerio from 'cheerio'
import { ParserResult } from '@/types/player'

/**
 * Parser for Source 3 (example: streamtape-based sites)
 * Replace with actual target site
 */
export async function parseSource3(imdbId: string): Promise<ParserResult> {
  const source = 'Source3'
  
  try {
    // Example: API-style endpoint
    // Replace URL with actual target
    const apiUrl = `https://example-source3.com/api/embed?imdb=${imdbId}`
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000,
    })

    let iframeUrl: string | null = null

    // Check if response is JSON
    if (response.headers['content-type']?.includes('application/json')) {
      const data = response.data
      if (data.embed_url || data.iframe || data.player_url) {
        iframeUrl = data.embed_url || data.iframe || data.player_url
      }
    } else {
      // HTML response
      const $ = cheerio.load(response.data)
      
      // Look for meta tags with video URL
      $('meta').each((_, el) => {
        const property = $(el).attr('property') || $(el).attr('name')
        const content = $(el).attr('content')
        if (property && content && (property.includes('video') || property.includes('player'))) {
          iframeUrl = content
          return false
        }
      })
      
      // Look for iframes
      if (!iframeUrl) {
        $('iframe').each((_, el) => {
          const src = $(el).attr('src')
          if (src && src.length > 10) {
            iframeUrl = src.startsWith('//') ? `https:${src}` : src
            return false
          }
        })
      }
      
      // Look for video URLs in script tags
      if (!iframeUrl) {
        const scriptContent = $('body').html()
        if (scriptContent) {
          const urlMatch = scriptContent.match(/https?:\/\/[^\s"']*\.(m3u8|mp4|embed)[^\s"']*/i)
          if (urlMatch) {
            iframeUrl = urlMatch[0]
          }
        }
      }
    }

    if (!iframeUrl) {
      return { source, iframe: null, error: 'No iframe found' }
    }

    return {
      source,
      iframe: iframeUrl,
      quality: 'HD',
    }
  } catch (error) {
    console.error(`Parser Source3 error for ${imdbId}:`, error)
    return {
      source,
      iframe: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
