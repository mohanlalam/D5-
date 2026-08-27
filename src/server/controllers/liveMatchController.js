/**
 * Live Match & Schedule Controller
 * D5 IPL Fantasy Platform
 */

import { liveScoreService } from "../services/liveScoreService.js";
import { IPL_SQUADS, IPL_TEAMS } from "../../core/constants.js";

export const liveMatchController = {
  async getLiveScores(req, res) {
    try {
      const liveData = await liveScoreService.getLiveScores();
      return res.json({ success: true, ...liveData });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getSchedule(req, res) {
    const fixtures = liveScoreService.getUpcomingFixtures();
    return res.json({
      success: true,
      data: fixtures,
      total: fixtures.length,
    });
  },

  getSquads(req, res) {
    return res.json({
      success: true,
      data: IPL_SQUADS,
      teams: IPL_TEAMS,
    });
  },
};
