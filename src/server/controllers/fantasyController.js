/**
 * Fantasy League Controller
 * D5 IPL Fantasy Platform
 */

import { storageService } from "../services/storageService.js";
import { computeStandings } from "../../core/differentialStandings.js";
import { validateTeam, validateMatchEntry } from "../../core/validation.js";
import { D5_2025 } from "../../core/data2025.js";

export const fantasyController = {
  getTeams(req, res) {
    const teams = storageService.getTeams();
    return res.json({ success: true, data: teams });
  },

  updateTeams(req, res) {
    const { teams } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ success: false, message: "Teams list is required" });
    }

    for (const team of teams) {
      const { valid, errors } = validateTeam(team);
      if (!valid) {
        return res.status(400).json({ success: false, errors });
      }
    }

    const updated = storageService.saveTeams(teams);
    return res.json({ success: true, data: updated });
  },

  getEntries(req, res) {
    const entries = storageService.getEntries();
    return res.json({ success: true, data: entries });
  },

  getStandings(req, res) {
    const teams = storageService.getTeams();
    const entries = storageService.getEntries();
    const result = computeStandings(teams, entries);
    return res.json({ success: true, data: result });
  },

  createEntry(req, res) {
    const entry = req.body;
    const teams = storageService.getTeams();
    const { valid, errors } = validateMatchEntry(entry, teams);

    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const saved = storageService.saveEntry(entry);
    return res.status(201).json({ success: true, data: saved });
  },

  updateEntry(req, res) {
    const { id } = req.params;
    const entry = req.body;
    const teams = storageService.getTeams();
    const existing = storageService.getEntryById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Entry ${id} not found` });
    }

    const { valid, errors } = validateMatchEntry(entry, teams);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    entry.id = id;
    const saved = storageService.saveEntry(entry);
    return res.json({ success: true, data: saved });
  },

  deleteEntry(req, res) {
    const { id } = req.params;
    const deleted = storageService.deleteEntry(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Entry ${id} not found` });
    }
    return res.json({ success: true, message: "Entry successfully removed" });
  },

  getArchive2025(req, res) {
    return res.json({
      success: true,
      data: {
        matches: D5_2025.matches,
        grandTotals: D5_2025.grand,
        wins: D5_2025.wins,
        totalMatches: D5_2025.matches.length,
      },
    });
  },
};
