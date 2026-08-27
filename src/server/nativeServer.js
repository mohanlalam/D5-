/**
 * Zero-Dependency Native HTTP Server for D5 IPL Fantasy Platform
 * Runs out of the box on any Node.js installation without needing npm install.
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storageService } from "./services/storageService.js";
import { computeStandings } from "../core/differentialStandings.js";
import { liveScoreService } from "./services/liveScoreService.js";
import { D5_2025 } from "../core/data2025.js";
import { IPL_SCHEDULE, IPL_TEAMS, IPL_SQUADS } from "../core/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  // ── API Routes ─────────────────────────────────────────────────────────────
  if (pathname === "/api/v1/health" || pathname === "/api/health") {
    return sendJson(res, 200, {
      status: "healthy",
      service: "D5 IPL Fantasy API (Native Engine)",
      version: "2.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === "/api/v1/season/2026/teams" || pathname === "/api/teams") {
    if (method === "GET") {
      return sendJson(res, 200, { success: true, data: storageService.getTeams() });
    }
    if (method === "PUT") {
      const body = await parseBody(req);
      const updated = storageService.saveTeams(body.teams || []);
      return sendJson(res, 200, { success: true, data: updated });
    }
  }

  if (pathname === "/api/v1/season/2026/standings" || pathname === "/api/standings") {
    const teams = storageService.getTeams();
    const entries = storageService.getEntries();
    const standings = computeStandings(teams, entries);
    return sendJson(res, 200, { success: true, data: standings });
  }

  if (pathname === "/api/v1/season/2026/entries" || pathname === "/api/entries") {
    if (method === "GET") {
      return sendJson(res, 200, { success: true, data: storageService.getEntries() });
    }
    if (method === "POST") {
      const entry = await parseBody(req);
      const saved = storageService.saveEntry(entry);
      return sendJson(res, 201, { success: true, data: saved });
    }
  }

  if (pathname.startsWith("/api/v1/season/2026/entries/") || pathname.startsWith("/api/entries/")) {
    const id = pathname.split("/").pop();
    if (method === "PUT") {
      const entry = await parseBody(req);
      entry.id = id;
      const saved = storageService.saveEntry(entry);
      return sendJson(res, 200, { success: true, data: saved });
    }
    if (method === "DELETE") {
      const deleted = storageService.deleteEntry(id);
      return sendJson(res, deleted ? 200 : 404, { success: deleted });
    }
  }

  if (pathname === "/api/v1/season/2025/archive" || pathname === "/api/archive") {
    return sendJson(res, 200, {
      success: true,
      data: {
        matches: D5_2025.matches,
        grandTotals: D5_2025.grand,
        wins: D5_2025.wins,
        totalMatches: D5_2025.matches.length,
      },
    });
  }

  if (pathname === "/api/v1/live/scores" || pathname === "/api/live") {
    const liveData = await liveScoreService.getLiveScores();
    return sendJson(res, 200, { success: true, ...liveData });
  }

  if (pathname === "/api/v1/auth/login" || pathname === "/api/auth/login") {
    const body = await parseBody(req);
    const isValid = body.password === storageService.getEditorPassword();
    return sendJson(res, isValid ? 200 : 401, {
      success: isValid,
      isEditor: isValid,
      message: isValid ? "Authenticated" : "Invalid PIN",
    });
  }

  // ── Static Asset Serving ───────────────────────────────────────────────────
  let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading file");
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content, "utf-8");
  });
});

server.listen(PORT, () => {
  console.log(`
  🏏 =============================================== 🏏
     D5 IPL Fantasy Native Server Running!
     Local URL:         http://localhost:${PORT}
     API Health:        http://localhost:${PORT}/api/v1/health
     Standings:         http://localhost:${PORT}/api/v1/season/2026/standings
     Live Scores:       http://localhost:${PORT}/api/v1/live/scores
  🏏 =============================================== 🏏
  `);
});

export default server;
