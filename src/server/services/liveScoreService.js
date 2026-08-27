/**
 * Live Cricket Score Service — ESPNCricinfo Public Feed (Unlimited & Zero-Key)
 * D5 IPL Fantasy Platform
 */

class LiveScoreService {
  constructor() {
    this.cache = null;
    this.lastFetchTime = 0;
    this.CACHE_TTL_MS = 30000; // 30-second in-memory cache
    this.espnFeedUrl = "https://static.cricinfo.com/rss/livescores.xml";
  }

  parseEspnXml(xmlText) {
    const matches = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i.exec(itemContent);
      const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i.exec(itemContent);
      const linkMatch = /<link>(.*?)<\/link>/i.exec(itemContent);

      const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
      const description = (descMatch?.[1] || descMatch?.[2] || "").trim();
      const link = (linkMatch?.[1] || "").trim();

      if (title) {
        matches.push({
          title,
          description,
          link,
          parsedAt: new Date().toISOString(),
        });
      }
    }

    return matches;
  }

  async getLiveScores() {
    const now = Date.now();
    if (this.cache && (now - this.lastFetchTime < this.CACHE_TTL_MS)) {
      return {
        source: "ESPNCricinfo Public RSS (Cached)",
        cached: true,
        ttlRemaining: Math.round((this.CACHE_TTL_MS - (now - this.lastFetchTime)) / 1000),
        data: this.cache,
      };
    }

    try {
      const response = await fetch(this.espnFeedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) D5IPL/2.0",
        },
      });

      if (!response.ok) {
        throw new Error(`ESPNCricinfo returned HTTP ${response.status}`);
      }

      const xmlText = await response.text();
      const parsedMatches = this.parseEspnXml(xmlText);

      this.cache = parsedMatches;
      this.lastFetchTime = now;

      return {
        source: "ESPNCricinfo Public Live Feed (Unlimited / Zero-Key)",
        cached: false,
        count: parsedMatches.length,
        data: parsedMatches,
      };
    } catch (error) {
      console.warn("ESPNCricinfo live feed warning:", error.message);
      return {
        source: "ESPNCricinfo Fallback",
        error: error.message,
        data: this.cache || [],
      };
    }
  }
}

export const liveScoreService = new LiveScoreService();
