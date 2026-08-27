/**
 * Scoring Engine Unit Tests
 * D5 IPL Fantasy Platform
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculatePlayerScore, calcPts } from "./scoringEngine.js";
import { computeStandings } from "./differentialStandings.js";

describe("D5 Scoring Engine Unit Tests", () => {
  it("calculates base runs and wickets correctly", () => {
    const player = { runs: 24, wkts: 2 };
    // Base: 24*5 = 120, 2*100 = 200. Bonus for 2 wkts = 50. Total = 370
    const result = calculatePlayerScore(player);
    assert.equal(result.basePoints, 320);
    assert.equal(result.totalBonus, 50);
    assert.equal(result.totalPoints, 370);
  });

  it("applies captain 2x multiplier properly", () => {
    const player = { runs: 50, wkts: 0, isCaptain: true };
    // Base: 50*5 = 250. Bonus 50-99 runs = +150. Raw = 400. Captain 2x = 800
    const score = calcPts(player);
    assert.equal(score, 800);
  });

  it("deducts points for a duck", () => {
    const player = { runs: 0, duck: 1 };
    // Duck = -50
    const score = calcPts(player);
    assert.equal(score, -50);
  });

  it("computes century and 3-wicket milestones", () => {
    const player = { runs: 105, wkts: 3, catch: 1 };
    // Base: 105*5 (525) + 3*100 (300) + 1*50 (50) = 875
    // Bonus: 100+ runs (+250) + 3 wkts (+150) = 400
    // Raw = 1275
    const result = calculatePlayerScore(player);
    assert.equal(result.basePoints, 875);
    assert.equal(result.totalBonus, 400);
    assert.equal(result.totalPoints, 1275);
  });
});

describe("Differential Standings Engine Tests", () => {
  it("correctly awards differential points to the match winner", () => {
    const teams = [
      { id: "T1", name: "Mvrcks" },
      { id: "T2", name: "Sharks" },
      { id: "T3", name: "Sixers" },
    ];

    const mockEntry = {
      id: "e1",
      teamData: {
        T1: [{ runs: 100 }], // 500 + 250 = 750
        T2: [{ runs: 40 }],  // 200 + 50 = 250
        T3: [{ runs: 20 }],  // 100 + 0 = 100
      },
    };

    const { leaderboard, matchScores } = computeStandings(teams, [mockEntry]);
    const m = matchScores[0];

    // Winner is T1 (750 pts)
    assert.equal(m.winnerId, "T1");
    // T1 net: (750-250) + (750-100) = 500 + 650 = 1150
    assert.equal(m.net["T1"], 1150);
    // T2 net: -(750-250) = -500
    assert.equal(m.net["T2"], -500);
    // T3 net: -(750-100) = -650
    assert.equal(m.net["T3"], -650);

    // Leaderboard top should be T1
    assert.equal(leaderboard[0].teamId, "T1");
    assert.equal(leaderboard[0].grandPoints, 1150);
  });
});
