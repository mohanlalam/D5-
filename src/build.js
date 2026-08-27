/**
 * Production Bundle Generator for Standalone & Web Distribution
 * D5 IPL Fantasy Platform
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { D5_2025 } from "./core/data2025.js";
import { IPL_SCHEDULE, IPL_TEAMS, IPL_SQUADS, DEFAULT_2026_TEAMS, D5_TEAM_CONFIG, MAIN_TEAMS, SCORING_RULES } from "./core/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.resolve(ROOT_DIR, "public");

const cssContent = fs.readFileSync(path.join(PUBLIC_DIR, "css/app.css"), "utf8");
const appJsContent = fs.readFileSync(path.join(PUBLIC_DIR, "js/app.js"), "utf8");

const createHtml = (isStandalone = false) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>D5 IPL Fantasy 2026</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>
  ${isStandalone ? `<style>\n${cssContent}\n</style>` : `<link rel="stylesheet" href="css/app.css"/>`}
  <style>
    #loading { position: fixed; inset: 0; background: #0b0d12; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; z-index: 9999; }
    .spinner-red { width: 44px; height: 44px; border: 3px solid #22080a; border-top-color: #d11a2a; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
<div id="loading">
  <div class="spinner-red"></div>
  <div style="font-family:'Bebas Neue',cursive;font-size:18px;color:#888;letter-spacing:2px;">LOADING D5 IPL FANTASY...</div>
</div>
<div id="root"></div>

<script>
// ─── DOMAIN CONSTANTS & HISTORICAL DATA ──────────────────────────────────────
const D5_2025 = ${JSON.stringify(D5_2025)};
const IPL_SCHEDULE = ${JSON.stringify(IPL_SCHEDULE)};
const IPL_TEAMS = ${JSON.stringify(IPL_TEAMS)};
const IPL_SQUADS = ${JSON.stringify(IPL_SQUADS)};
const DEFAULT_2026_TEAMS = ${JSON.stringify(DEFAULT_2026_TEAMS)};
const D5_TEAM_CONFIG = ${JSON.stringify(D5_TEAM_CONFIG)};
const MAIN_TEAMS = ${JSON.stringify(MAIN_TEAMS)};
const SCORING_RULES = ${JSON.stringify(SCORING_RULES)};

// ─── PURE SCORING ENGINE ──────────────────────────────────────────────────────
function calcPts(player, mults = {}) {
  const r = mults.r ?? SCORING_RULES.multipliers.run;
  const w = mults.w ?? SCORING_RULES.multipliers.wicket;
  const ro = mults.ro ?? SCORING_RULES.multipliers.runOut;
  const st = mults.st ?? SCORING_RULES.multipliers.stumping;
  const c = mults.c ?? SCORING_RULES.multipliers.catch;
  const d = mults.d ?? SCORING_RULES.multipliers.duck;

  const runs = Number(player.runs || player.r || 0);
  const wkts = Number(player.wkts || player.w || 0);
  const runOut = Number(player.ro || 0);
  const stmp = Number(player.stmp || player.st || 0);
  const catches = Number(player.catch || player.c || 0);
  const duck = Number(player.duck || player.d || 0);

  const sixes = Number(player.b6s || player.bs || 0);
  const bW6 = Number(player.bW6 || player.bw6 || 0);
  const bHtkW = Number(player.bHtkW || player.bh || 0);
  const bHtk6s = Number(player.bHtk6s || player.bh6 || 0);
  const bMdn = Number(player.bMdn || player.bm || 0);

  const base = (runs * r) + (wkts * w) + (runOut * ro) + (stmp * st) + (catches * c) + (duck * d);

  const br = runs >= 100 ? 250 : runs >= 50 ? 150 : runs >= 30 ? 50 : 0;
  const bw = wkts >= 5 ? 200 : wkts >= 3 ? 150 : wkts >= 2 ? 50 : 0;
  const bc = catches >= 5 ? 200 : catches >= 3 ? 100 : 0;
  const bro = (runOut + stmp) >= 3 ? 100 : 0;
  const bSix = sixes >= 10 ? 300 : sixes >= 5 ? 150 : 0;
  const bw6 = bW6 * 100;
  const bHtk = (bHtkW * 400) + (bHtk6s * 100);
  const bMaiden = bMdn * 200;

  const bonus = br + bw + bc + bro + bSix + bw6 + bHtk + bMaiden;
  const raw = base + bonus;
  return (player.isCaptain || player.cap) ? raw * 2 : raw;
}

const uid = () => "id_" + Math.random().toString(36).slice(2, 9);
const blankPlayer = (isCaptain = false) => ({
  id: uid(), name: "", isCaptain, runs: 0, wkts: 0, ro: 0, stmp: 0, catch: 0, duck: 0, b6s: 0, bHtkW: 0, bHtk6s: 0, bMdn: 0
});
const blankEntry = (teams) => ({
  id: "entry_" + Date.now(),
  matchId: "",
  matchLabel: "",
  date: new Date().toISOString().slice(0, 10),
  locked: false,
  teamData: teams.reduce((acc, t) => {
    acc[t.id] = [blankPlayer(true), blankPlayer(false), blankPlayer(false), blankPlayer(false), blankPlayer(false)];
    return acc;
  }, {})
});

function getDaysUntil(ds) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(ds); d.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
}
function fmtDate(ds) {
  return new Date(ds).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ─── FIREBASE REALTIME DB INITIALIZATION ─────────────────────────────────────
try {
  const firebaseConfig = {
    apiKey: "AIzaSyB2Hgj5Zedz6SYXipgEIKkcxUn0oywX7CA",
    authDomain: "d5iplfant.firebaseapp.com",
    databaseURL: "https://d5iplfant-default-rtdb.firebaseio.com",
    projectId: "d5iplfant",
    storageBucket: "d5iplfant.firebasestorage.app",
    messagingSenderId: "990920103930",
    appId: "1:990920103930:web:3d6c8eb58f9e7fe7463643"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
} catch(e) {
  console.warn("Firebase not initialized:", e);
}
window.EDITOR_PASSWORD = "ipl";
</script>

${isStandalone ? `<script>\n${appJsContent}\n</script>` : `<script src="js/app.js"></script>`}
</body>
</html>`;

export function build() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // 1. Web app bundle for Express static serving
  fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), createHtml(false), "utf8");
  console.log("✓ Generated public/index.html (Modular Web App)");

  // 2. Standalone zero-dependency distribution file for instant double-click running
  fs.writeFileSync(path.join(ROOT_DIR, "index.html"), createHtml(true), "utf8");
  console.log("✓ Generated root index.html (Standalone Production App)");
}

build();
