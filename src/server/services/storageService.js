/**
 * Storage Abstraction Service
 * D5 IPL Fantasy Platform
 * 
 * Supports local filesystem persistence with atomic writes
 * and fallback initialization from defaults.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_2026_TEAMS } from "../../core/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

class StorageService {
  constructor() {
    this.memoryCache = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        const defaultData = {
          teams: DEFAULT_2026_TEAMS,
          entries: {},
          editorPassword: "ipl",
          config: {
            theme: "dark",
            leagueName: "D5 IPL Fantasy 2026",
          },
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
        this.memoryCache = defaultData;
      } else {
        const content = fs.readFileSync(DB_FILE, "utf8");
        this.memoryCache = JSON.parse(content);
      }
    } catch (err) {
      console.error("[StorageService] Init error, falling back to memory:", err);
      this.memoryCache = {
        teams: DEFAULT_2026_TEAMS,
        entries: {},
        editorPassword: "ipl",
      };
    }
  }

  save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryCache, null, 2), "utf8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error("[StorageService] Save error:", err);
    }
  }

  getTeams() {
    return this.memoryCache.teams || DEFAULT_2026_TEAMS;
  }

  saveTeams(teams) {
    this.memoryCache.teams = teams;
    this.save();
    return this.memoryCache.teams;
  }

  getEntries() {
    return Object.values(this.memoryCache.entries || {});
  }

  getEntryById(id) {
    return this.memoryCache.entries?.[id] || null;
  }

  saveEntry(entry) {
    if (!this.memoryCache.entries) this.memoryCache.entries = {};
    this.memoryCache.entries[entry.id] = {
      ...entry,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.memoryCache.entries[entry.id];
  }

  deleteEntry(id) {
    if (this.memoryCache.entries && this.memoryCache.entries[id]) {
      delete this.memoryCache.entries[id];
      this.save();
      return true;
    }
    return false;
  }

  getEditorPassword() {
    return this.memoryCache.editorPassword || "ipl";
  }

  setEditorPassword(newPw) {
    this.memoryCache.editorPassword = newPw;
    this.save();
    return true;
  }
}

export const storageService = new StorageService();
export default storageService;
