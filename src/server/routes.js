/**
 * REST API Routes Definition
 * D5 IPL Fantasy Platform
 */

import { Router } from "express";
import { fantasyController } from "./controllers/fantasyController.js";
import { liveMatchController } from "./controllers/liveMatchController.js";
import { authController } from "./controllers/authController.js";

const router = Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "D5 IPL Fantasy API",
    version: "2.0.0",
  });
});

// Authentication
router.post("/auth/login", authController.login);
router.post("/auth/change-password", authController.changePassword);

// 2026 Fantasy League Endpoints
router.get("/season/2026/teams", fantasyController.getTeams);
router.put("/season/2026/teams", fantasyController.updateTeams);
router.get("/season/2026/entries", fantasyController.getEntries);
router.post("/season/2026/entries", fantasyController.createEntry);
router.put("/season/2026/entries/:id", fantasyController.updateEntry);
router.delete("/season/2026/entries/:id", fantasyController.deleteEntry);
router.get("/season/2026/standings", fantasyController.getStandings);

// 2025 Historical Archive Endpoints
router.get("/season/2025/archive", fantasyController.getArchive2025);

// Live Cricket & IPL 2026 Data Endpoints
router.get("/live/scores", liveMatchController.getLiveScores);
router.get("/ipl/schedule", liveMatchController.getSchedule);
router.get("/ipl/squads", liveMatchController.getSquads);

export default router;
