import axios from 'axios'
import * as cheerio from 'cheerio'
import { ParserResult } from '@/types/player'

/**
 * Parser for Source 1 (example: vidhide-based sites)
 * Replace with actual target site
 */
export async function parseSource1(imdbId: string): Promise<ParserResult> {
  const source = 'Source1'
  
  try {
    // Example: Search for the movie on the source site
    // Replace URL with actual target
    const searchUrl = `https://example-source1.com/search/${imdbId}`
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)
    
    // Find iframe - adjust selectors based on actual site structure
    let iframeUrl: string | null = null
    
    // Try common iframe selectors
    $('iframe').each((_, el) => {
      const src = $(el).attr('src')
      if (src && (src.includes('player') || src.includes('embed') || src.includes('video'))) {
        iframeUrl = src.startsWith('//') ? `https:${src}` : src
        return false // break
      }
    })
    
    // If not found in iframe tags, look for URLs in script tags
    if (!iframeUrl) {
      $('script').each((_, el) => {
        const scriptContent = $(el).html()
        if (scriptContent) {
          // Look for common player URL patterns
          const matches = scriptContent.match(/["'](https?:\/\/[^"']*player[^"']*)["']/gi)
          if (matches && matches.length > 0) {
            iframeUrl = matches[0].replace(/["']/g, '')
            return false
          }
        }
      })
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
    console.error(`Parser Source1 error for ${imdbId}:`, error)
    return {
      source,
      iframe: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
