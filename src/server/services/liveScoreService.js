/**
 * Live Cricket Score Aggregator Service
 * D5 IPL Fantasy Platform
 */

import { IPL_SCHEDULE, IPL_TEAMS } from "../../core/constants.js";

class LiveScoreService {
  constructor() {
    this.cache = {};
    this.lastFetchedAt = 0;
    this.cacheTTLMs = 30000; // 30 seconds
    this.apiKey = process.env.CRICKET_API_KEY || "895f5fdc-d1a2-4aeb-98ff-3c5825227bf7";
  }

  async getLiveScores() {
    const now = Date.now();
    if (this.cache && (now - this.lastFetchedAt < this.cacheTTLMs)) {
      return {
        scores: this.cache,
        cached: true,
        lastUpdated: new Date(this.lastFetchedAt).toISOString(),
      };
    }

    try {
      // Third-party API call (cricketdata.org)
      const res = await fetch(
        `https://api.cricapi.com/v1/currentMatches?apikey=${this.apiKey}&offset=0`,
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) }
      );

      if (!res.ok) {
        throw new Error(`API responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      const matchMap = {};

      if (data.status === "success" && Array.isArray(data.data)) {
        data.data.forEach((m) => {
          const matchedFixture = IPL_SCHEDULE.find((sch) => {
            const t1 = IPL_TEAMS[sch.team1]?.name?.toLowerCase() || "";
            const t2 = IPL_TEAMS[sch.team2]?.name?.toLowerCase() || "";
            const mName = (m.name || "").toLowerCase();
            return (mName.includes(sch.team1.toLowerCase()) || mName.includes(t1)) &&
                   (mName.includes(sch.team2.toLowerCase()) || mName.includes(t2));
          });

          if (matchedFixture) {
            matchMap[matchedFixture.id] = {
              matchId: matchedFixture.id,
              name: m.name,
              status: m.status,
              matchStarted: m.matchStarted,
              matchEnded: m.matchEnded,
              score: (m.score || []).map((s) => ({
                inning: s.inning,
                r: s.r,
                w: s.w,
                o: s.o,
              })),
            };
          }
        });
      }

      this.cache = matchMap;
      this.lastFetchedAt = now;

      return {
        scores: this.cache,
        cached: false,
        lastUpdated: new Date(this.lastFetchedAt).toISOString(),
      };
    } catch (err) {
      console.warn("[LiveScoreService] Failed to fetch upstream live scores:", err.message);
      // Return cached or empty map on failure
      return {
        scores: this.cache || {},
        cached: true,
        fallback: true,
        error: err.message,
        lastUpdated: new Date(this.lastFetchedAt || Date.now()).toISOString(),
      };
    }
  }

  getUpcomingFixtures() {
    const todayStr = new Date().toISOString().slice(0, 10);
    return IPL_SCHEDULE.map((m) => {
      const matchDate = m.date;
      const isPast = matchDate < todayStr;
      const isToday = matchDate === todayStr;

      let status = "upcoming";
      if (isPast) status = "completed";
      else if (isToday) status = "today";

      return {
        ...m,
        team1Info: IPL_TEAMS[m.team1] || { name: m.team1, color: "#888" },
        team2Info: IPL_TEAMS[m.team2] || { name: m.team2, color: "#888" },
        status,
      };
    });
  }
}

export const liveScoreService = new LiveScoreService();
export default liveScoreService;
