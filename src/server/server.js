/**
 * Server Bootstrap & Entry Point
 * D5 IPL Fantasy Platform
 */

import app from "./app.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`
  🏏 =============================================== 🏏
     D5 IPL Fantasy Production Server Active!
     Local Access:      http://localhost:${PORT}
     API Health:        http://localhost:${PORT}/api/v1/health
     Standings Endpoint:http://localhost:${PORT}/api/v1/season/2026/standings
     Live Scores:       http://localhost:${PORT}/api/v1/live/scores
  🏏 =============================================== 🏏
  `);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("[Server] Process terminated.");
  });
});
