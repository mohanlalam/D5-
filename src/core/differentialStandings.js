/**
 * Differential Standings & Leaderboard Computation Engine
 * D5 IPL Fantasy Platform
 */

import { calcPts } from "./scoringEngine.js";

/**
 * Computes full standings and per-match differential breakdown
 * @param {Array} teams List of fantasy team objects [{ id, name, color, emoji }]
 * @param {Array} entries List of match entries
 * @returns {Object} Standings table and match-by-match score records
 */
export function computeStandings(teams = [], entries = []) {
  const matchScores = entries.map((entry) => {
    // Calculate total score for each team in this match
    const scores = teams.reduce((acc, t) => {
      const roster = entry.teamData?.[t.id] || [];
      acc[t.id] = roster.reduce((sum, p) => sum + calcPts(p), 0);
      return acc;
    }, {});

    const scoreValues = Object.values(scores);
    const maxPts = scoreValues.length ? Math.max(...scoreValues) : 0;
    const winnerId = maxPts > 0 ? (teams.find((t) => scores[t.id] === maxPts)?.id || null) : null;

    const net = {};
    teams.forEach((t) => {
      if (t.id === winnerId) {
        // Winner gains sum of differences against all losers
        let diffSum = 0;
        teams.forEach((other) => {
          if (other.id !== winnerId) {
            diffSum += (scores[winnerId] || 0) - (scores[other.id] || 0);
          }
        });
        net[t.id] = diffSum;
      } else {
        // Losers lose the difference between the winner and themselves
        net[t.id] = winnerId ? -((scores[winnerId] || 0) - (scores[t.id] || 0)) : 0;
      }
    });

    return {
      entryId: entry.id,
      matchId: entry.matchId,
      matchLabel: entry.matchLabel,
      date: entry.date,
      scores,
      maxPts,
      winnerId,
      net,
    };
  });

  // Aggregate grand totals and statistics per team
  const teamAggregates = teams.map((team) => {
    let grandPoints = 0;
    let rawPointsTotal = 0;
    let winsCount = 0;
    let matchesPlayed = 0;
    let bestMatchScore = 0;
    const formTrend = []; // Last 5 match net points

    matchScores.forEach((m) => {
      const rawScore = m.scores[team.id] || 0;
      const netPoints = m.net[team.id] || 0;

      if (rawScore > 0 || netPoints !== 0) {
        matchesPlayed += 1;
      }

      if (m.winnerId === team.id) {
        winsCount += 1;
      }

      if (rawScore > bestMatchScore) {
        bestMatchScore = rawScore;
      }

      rawPointsTotal += rawScore;
      grandPoints += netPoints;
      formTrend.push(netPoints);
    });

    return {
      teamId: team.id,
      name: team.name,
      color: team.color,
      emoji: team.emoji,
      matchesPlayed,
      wins: winsCount,
      grandPoints,
      rawPointsTotal,
      bestMatchScore,
      avgRawScore: matchesPlayed ? Math.round(rawPointsTotal / matchesPlayed) : 0,
      recentForm: formTrend.slice(-5),
    };
  });

  // Sort descending by net grand points, tiebreaker by wins, then raw points
  const leaderboard = [...teamAggregates].sort((a, b) => {
    if (b.grandPoints !== a.grandPoints) return b.grandPoints - a.grandPoints;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.rawPointsTotal - a.rawPointsTotal;
  });

  return {
    leaderboard,
    matchScores,
    totalEntries: entries.length,
    lastUpdated: new Date().toISOString(),
  };
}
