/**
 * Pure Domain Scoring Engine
 * D5 IPL Fantasy Platform
 */

import { SCORING_RULES } from "./constants.js";

/**
 * Calculates detailed score breakdown for an individual player performance
 * @param {Object} player Player performance record
 * @param {Object} [customMults] Optional overrides for multipliers
 * @returns {Object} Score summary including base, bonus breakdown, raw and final points
 */
export function calculatePlayerScore(player = {}, customMults = {}) {
  const mults = {
    r: customMults.r ?? SCORING_RULES.multipliers.run,
    w: customMults.w ?? SCORING_RULES.multipliers.wicket,
    ro: customMults.ro ?? SCORING_RULES.multipliers.runOut,
    st: customMults.st ?? SCORING_RULES.multipliers.stumping,
    c: customMults.c ?? SCORING_RULES.multipliers.catch,
    d: customMults.d ?? SCORING_RULES.multipliers.duck,
  };

  const runs = Number(player.runs || player.r || 0);
  const wkts = Number(player.wkts || player.w || 0);
  const ro = Number(player.ro || 0);
  const stmp = Number(player.stmp || player.st || 0);
  const catches = Number(player.catch || player.c || 0);
  const duck = Number(player.duck || player.d || 0);

  // Sixes, maidens, hat-tricks
  const sixes = Number(player.b6s || player.bs || 0);
  const bW6 = Number(player.bW6 || player.bw6 || 0);
  const bHtkW = Number(player.bHtkW || player.bh || 0);
  const bHtk6s = Number(player.bHtk6s || player.bh6 || 0);
  const bMdn = Number(player.bMdn || player.bm || 0);

  // Base Points
  const basePoints = (runs * mults.r) +
                     (wkts * mults.w) +
                     (ro * mults.ro) +
                     (stmp * mults.st) +
                     (catches * mults.c) +
                     (duck * mults.d);

  // Milestones & Bonus Calculations
  const bonusRuns = runs >= 100 ? SCORING_RULES.bonuses.runs100 :
                    runs >= 50  ? SCORING_RULES.bonuses.runs50  :
                    runs >= 30  ? SCORING_RULES.bonuses.runs30  : 0;

  const bonusWkts = wkts >= 5 ? SCORING_RULES.bonuses.wkts5 :
                    wkts >= 3 ? SCORING_RULES.bonuses.wkts3 :
                    wkts >= 2 ? SCORING_RULES.bonuses.wkts2 : 0;

  const bonusCatches = catches >= 5 ? SCORING_RULES.bonuses.catches5 :
                       catches >= 3 ? SCORING_RULES.bonuses.catches3 : 0;

  const bonusRoStump = (ro + stmp) >= 3 ? SCORING_RULES.bonuses.roStump3 : 0;

  const bonusSixes = sixes >= 10 ? SCORING_RULES.bonuses.sixes10 :
                     sixes >= 5  ? SCORING_RULES.bonuses.sixes5  : 0;

  const bonusW6 = bW6 * 100;
  const bonusHatTrickW = bHtkW * SCORING_RULES.bonuses.hatTrickWkts;
  const bonusHatTrick6s = bHtk6s * SCORING_RULES.bonuses.hatTrickSixes;
  const bonusMaiden = bMdn * SCORING_RULES.bonuses.maidenOver;

  const totalBonus = bonusRuns +
                     bonusWkts +
                     bonusW6 +
                     bonusCatches +
                     bonusRoStump +
                     bonusSixes +
                     bonusHatTrickW +
                     bonusHatTrick6s +
                     bonusMaiden;

  const rawScore = basePoints + totalBonus;
  const isCaptain = Boolean(player.isCaptain || player.cap);
  const totalPoints = isCaptain ? rawScore * SCORING_RULES.captainMultiplier : rawScore;

  return {
    playerId: player.id || player.n,
    playerName: player.name || player.n || "Unnamed Player",
    isCaptain,
    basePoints,
    bonusBreakdown: {
      runs: bonusRuns,
      wkts: bonusWkts,
      catches: bonusCatches,
      roStump: bonusRoStump,
      sixes: bonusSixes,
      w6: bonusW6,
      hatTrickWkts: bonusHatTrickW,
      hatTrickSixes: bonusHatTrick6s,
      maidens: bonusMaiden,
    },
    totalBonus,
    rawScore,
    totalPoints,
  };
}

/**
 * Convenience helper for fast point calculation
 * @param {Object} player 
 * @param {Object} [mults] 
 * @returns {number}
 */
export function calcPts(player, mults = {}) {
  return calculatePlayerScore(player, mults).totalPoints;
}

/**
 * Creates an empty player template
 * @param {boolean} isCaptain 
 * @returns {Object}
 */
export function createBlankPlayer(isCaptain = false) {
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: "",
    isCaptain,
    runs: 0,
    wkts: 0,
    ro: 0,
    stmp: 0,
    catch: 0,
    duck: 0,
    b6s: 0,
    bHtkW: 0,
    bHtk6s: 0,
    bMdn: 0,
  };
}

/**
 * Creates a blank match entry for the given fantasy teams
 * @param {Array} teams 
 * @returns {Object}
 */
export function createBlankEntry(teams = []) {
  return {
    id: "entry_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    matchId: "",
    matchLabel: "",
    date: new Date().toISOString().slice(0, 10),
    locked: false,
    teamData: teams.reduce((acc, t) => {
      acc[t.id] = [
        createBlankPlayer(true),
        createBlankPlayer(false),
        createBlankPlayer(false),
        createBlankPlayer(false),
        createBlankPlayer(false),
      ];
      return acc;
    }, {}),
  };
}
