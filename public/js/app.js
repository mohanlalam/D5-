/**
 * iOS Human Interface Component Architecture & Application Core
 * D5 IPL Fantasy Platform (v2.0)
 * 
 * Production-ready, accessible, and responsive React 18 UI
 */

const { useState, useEffect, useRef, useMemo, createElement: h } = React;

// ─── 1. REUSABLE ACCESSIBLE iOS UI COMPONENTS ─────────────────────────────────

/**
 * iOS Tactile Push Button
 * @param {Object} props
 * @param {('primary'|'tinted'|'destructive'|'ghost'|'plain')} [props.variant='primary']
 * @param {boolean} [props.small=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]
 * @param {Function} props.onClick
 */
function IOSButton({ onClick, children, variant = "primary", disabled = false, small = false, loading = false, style = {}, ariaLabel }) {
  const variantClass = `ios-btn ios-btn-${variant}`;
  return h("button", {
    onClick,
    disabled: disabled || loading,
    className: variantClass,
    "aria-label": ariaLabel,
    "aria-busy": loading,
    style: {
      padding: small ? "6px 14px" : "10px 20px",
      fontSize: small ? "13px" : "15px",
      ...style,
    }
  },
    loading && h("span", {
      style: {
        width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block"
      }
    }),
    children
  );
}

/**
 * iOS Accessible Segmented Control
 * @param {Object} props
 * @param {Array<{ id: string, label: string, icon?: string }>} props.items
 * @param {string} props.selectedId
 * @param {Function} props.onChange
 */
function IOSSegmentedControl({ items, selectedId, onChange, ariaLabel = "View Navigation" }) {
  return h("div", {
    className: "ios-segmented-control",
    role: "tablist",
    "aria-label": ariaLabel,
  },
    items.map((item) => {
      const isSelected = item.id === selectedId;
      return h("button", {
        key: item.id,
        role: "tab",
        "aria-selected": isSelected,
        className: `ios-segmented-btn ${isSelected ? "active" : ""}`,
        onClick: () => onChange(item.id),
      },
        item.icon && h("span", { style: { fontSize: "14px" } }, item.icon),
        item.label
      );
    })
  );
}

/**
 * iOS Frosted Glass Card
 */
function IOSCard({ children, style = {}, className = "", onClick, ariaRole }) {
  return h("div", {
    className: `ios-glass ${className}`,
    role: ariaRole,
    onClick,
    style: {
      borderRadius: "var(--ios-radius-lg)",
      padding: "18px",
      transition: "all 0.2s var(--ios-ease-smooth)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }
  }, children);
}

/**
 * iOS Inset Grouped Container & Cells (Apple Settings Style)
 */
function IOSGroupedList({ children, title, footer, style = {} }) {
  return h("div", { style: { marginBottom: "20px", ...style } },
    title && h("div", {
      style: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        color: "var(--ios-text-secondary)",
        padding: "0 14px 6px",
      }
    }, title),
    h("div", { className: "ios-inset-group" }, children),
    footer && h("div", {
      style: {
        fontSize: "12px",
        color: "var(--ios-text-tertiary)",
        padding: "6px 14px 0",
      }
    }, footer)
  );
}

function IOSCell({ label, value, sublabel, icon, onClick, trailingArrow = false, style = {} }) {
  return h("div", {
    className: "ios-cell",
    onClick,
    style: { cursor: onClick ? "pointer" : "default", ...style },
  },
    h("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
      icon && h("div", {
        style: {
          width: "28px", height: "28px", borderRadius: "7px",
          background: "var(--ios-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
        }
      }, icon),
      h("div", null,
        h("div", { style: { fontWeight: "500", color: "var(--ios-text-primary)" } }, label),
        sublabel && h("div", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, sublabel)
      )
    ),
    h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
      value && h("span", { style: { color: "var(--ios-text-secondary)", fontSize: "14px" } }, value),
      trailingArrow && h("span", { style: { color: "var(--ios-text-tertiary)", fontSize: "14px" } }, "›")
    )
  );
}

/**
 * iOS Pill Badges & Live Status Indicator
 */
function IOSLiveBadge() {
  return h("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "3px 10px",
      borderRadius: "var(--ios-radius-full)",
      background: "rgba(255, 69, 58, 0.15)",
      border: "0.5px solid rgba(255, 69, 58, 0.4)",
      color: "var(--ios-red)",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.6px",
    }
  },
    h("span", { className: "ios-pulse-dot" }),
    "LIVE"
  );
}

function IOSStatusBadge({ status, daysUntil }) {
  if (status === "live") return h(IOSLiveBadge);
  if (status === "completed") {
    return h("span", {
      style: {
        padding: "3px 10px", borderRadius: "var(--ios-radius-full)",
        background: "rgba(48, 209, 88, 0.12)", color: "var(--ios-green)",
        fontSize: "11px", fontWeight: "600", border: "0.5px solid rgba(48, 209, 88, 0.3)"
      }
    }, "✓ Done");
  }
  if (daysUntil === 0) {
    return h("span", {
      style: {
        padding: "3px 10px", borderRadius: "var(--ios-radius-full)",
        background: "rgba(255, 159, 10, 0.15)", color: "var(--ios-orange)",
        fontSize: "11px", fontWeight: "600", border: "0.5px solid rgba(255, 159, 10, 0.35)"
      }
    }, "Today");
  }
  if (daysUntil === 1) {
    return h("span", {
      style: {
        padding: "3px 10px", borderRadius: "var(--ios-radius-full)",
        background: "rgba(10, 132, 255, 0.15)", color: "var(--ios-blue)",
        fontSize: "11px", fontWeight: "600", border: "0.5px solid rgba(10, 132, 255, 0.35)"
      }
    }, "Tomorrow");
  }
  return h("span", {
    style: {
      padding: "3px 10px", borderRadius: "var(--ios-radius-full)",
      background: "var(--ios-bg-secondary)", color: "var(--ios-text-secondary)",
      fontSize: "11px", border: "0.5px solid var(--ios-separator)"
    }
  }, `In ${daysUntil}d`);
}

/**
 * iOS Bottom Sheet / Modal Dialog with Grabber Handle
 */
function IOSModalSheet({ isOpen, onClose, title, children, maxWidth = "820px" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return h("div", {
    className: "ios-sheet-backdrop",
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": "ios-modal-title",
  },
    h("div", {
      className: "ios-sheet-card",
      style: { maxWidth },
    },
      h("div", { className: "ios-grabber" }),
      h("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "0.5px solid var(--ios-separator)",
        }
      },
        h("h2", { id: "ios-modal-title", style: { fontSize: "17px", fontWeight: "600", color: "var(--ios-text-primary)" } }, title),
        h("button", {
          onClick: onClose,
          "aria-label": "Close Modal",
          style: {
            background: "rgba(118, 118, 128, 0.24)",
            border: "none",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            color: "var(--ios-text-secondary)",
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
        }, "✕")
      ),
      h("div", { style: { padding: "20px", overflowY: "auto", flex: 1 } }, children)
    )
  );
}

/**
 * iOS Team Avatar with Halo Ring
 */
function IOSTeamAvatar({ code, color, size = 42, large = false }) {
  const finalSize = large ? 56 : size;
  return h("div", {
    style: {
      width: `${finalSize}px`,
      height: `${finalSize}px`,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}28, ${color}12)`,
      border: `2px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: large ? "17px" : "13px",
      color: color,
      boxShadow: `0 4px 14px ${color}33`,
      flexShrink: 0,
    }
  }, code);
}

/**
 * iOS Stepper / Score Input Component
 */
function IOSNumberInput({ label, value, onChange, min = 0, max = 999, step = 1 }) {
  return h("div", { style: { display: "flex", flexDirection: "column", gap: "3px" } },
    label && h("span", { style: { fontSize: "10px", fontWeight: "600", color: "var(--ios-text-secondary)", textTransform: "uppercase" } }, label),
    h("div", { style: { display: "flex", alignItems: "center", background: "var(--ios-bg-tertiary)", borderRadius: "var(--ios-radius-sm)", border: "0.5px solid var(--ios-separator)" } },
      h("input", {
        type: "number",
        min,
        max,
        value,
        onChange: (e) => onChange(Number(e.target.value)),
        style: {
          width: "100%",
          background: "transparent",
          border: "none",
          color: "var(--ios-text-primary)",
          padding: "6px 8px",
          fontSize: "13px",
          textAlign: "center",
          outline: "none",
          fontWeight: "600",
        }
      })
    )
  );
}

// ─── 2. MAIN APPLICATION WORKFLOW & SCREENS ───────────────────────────────────

function App() {
  const [tab, setTab] = useState("standings");
  const [teams, setTeams] = useState(DEFAULT_2026_TEAMS);
  const [entries, setEntries] = useState([]);
  const [isEditor, setIsEditor] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminError, setAdminError] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);

  // Live Scores
  const [liveScores, setLiveScores] = useState({});
  const [liveLoading, setLiveLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // Historical 2025
  const [histFilter, setHistFilter] = useState("ALL");
  const [selHistMatch, setSelHistMatch] = useState(null);

  // ── Firebase Realtime Synchronization ──────────────────────────────────────
  useEffect(() => {
    if (window.db) {
      const teamsRef = window.db.ref("d5_2026_teams");
      const entriesRef = window.db.ref("d5_2026_entries");
      const pwRef = window.db.ref("d5_editor_pw");

      teamsRef.on("value", (snap) => {
        const val = snap.val();
        if (val) setTeams(val);
      });
      entriesRef.on("value", (snap) => {
        const val = snap.val();
        setEntries(val ? Object.values(val) : []);
      });
      pwRef.on("value", (snap) => {
        const val = snap.val();
        if (val) window.EDITOR_PASSWORD = val;
      });

      return () => {
        teamsRef.off();
        entriesRef.off();
        pwRef.off();
      };
    }
  }, []);

  // ── Live Match Fetching ───────────────────────────────────────────────────
  const fetchLiveScores = async () => {
    setLiveLoading(true);
    try {
      const res = await fetch("https://api.cricapi.com/v1/currentMatches?apikey=895f5fdc-d1a2-4aeb-98ff-3c5825227bf7&offset=0");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        const matchMap = {};
        data.data.forEach((m) => {
          const matchFix = IPL_SCHEDULE.find((sch) => {
            const t1 = IPL_TEAMS[sch.team1]?.name?.toLowerCase() || "";
            const t2 = IPL_TEAMS[sch.team2]?.name?.toLowerCase() || "";
            const mName = (m.name || "").toLowerCase();
            return (mName.includes(sch.team1.toLowerCase()) || mName.includes(t1)) &&
                   (mName.includes(sch.team2.toLowerCase()) || mName.includes(t2));
          });
          if (matchFix) {
            matchMap[matchFix.id] = {
              status: m.status,
              score: (m.score || []).map((s) => ({ inning: s.inning, r: s.r, w: s.w, o: s.o })),
            };
          }
        });
        setLiveScores(matchMap);
      }
    } catch (err) {
      console.warn("Live score proxy:", err.message);
    } finally {
      setLiveLoading(false);
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  };

  useEffect(() => {
    fetchLiveScores();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLiveScores, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // ── Standings Computation ──────────────────────────────────────────────────
  const standingsData = useMemo(() => {
    const matchScores = entries.map((entry) => {
      const scores = teams.reduce((acc, t) => {
        const roster = entry.teamData?.[t.id] || [];
        acc[t.id] = roster.reduce((sum, p) => sum + calcPts(p), 0);
        return acc;
      }, {});

      const scoreVals = Object.values(scores);
      const maxPts = scoreVals.length ? Math.max(...scoreVals) : 0;
      const winnerId = maxPts > 0 ? (teams.find((t) => scores[t.id] === maxPts)?.id || null) : null;

      const net = {};
      teams.forEach((t) => {
        if (t.id === winnerId) {
          let diffSum = 0;
          teams.forEach((other) => {
            if (other.id !== winnerId) diffSum += (scores[winnerId] || 0) - (scores[other.id] || 0);
          });
          net[t.id] = diffSum;
        } else {
          net[t.id] = winnerId ? -((scores[winnerId] || 0) - (scores[t.id] || 0)) : 0;
        }
      });

      return {
        id: entry.id,
        date: entry.date,
        matchLabel: entry.matchLabel,
        scores,
        maxPts,
        winnerId,
        net,
      };
    });

    const leaderboard = teams.map((team) => {
      let grandPoints = 0;
      let rawPointsTotal = 0;
      let wins = 0;
      let played = 0;
      let bestMatch = 0;

      matchScores.forEach((m) => {
        const raw = m.scores[team.id] || 0;
        const netPts = m.net[team.id] || 0;
        if (raw > 0 || netPts !== 0) played += 1;
        if (m.winnerId === team.id) wins += 1;
        if (raw > bestMatch) bestMatch = raw;
        rawPointsTotal += raw;
        grandPoints += netPts;
      });

      return {
        ...team,
        played,
        wins,
        grandPoints,
        rawPointsTotal,
        bestMatch,
        avgScore: played ? Math.round(rawPointsTotal / played) : 0,
      };
    }).sort((a, b) => b.grandPoints - a.grandPoints || b.wins - a.wins || b.rawPointsTotal - a.rawPointsTotal);

    return { matchScores, leaderboard };
  }, [teams, entries]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveScorecard = (entry) => {
    if (window.db) {
      window.db.ref(`d5_2026_entries/${entry.id}`).set(entry);
    } else {
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === entry.id);
        if (idx >= 0) {
          const next = [...prev]; next[idx] = entry; return next;
        }
        return [...prev, entry];
      });
    }
    setEditingEntry(null);
  };

  const handleDeleteScorecard = (id) => {
    if (confirm("Are you sure you want to remove this match scorecard?")) {
      if (window.db) {
        window.db.ref(`d5_2026_entries/${id}`).remove();
      } else {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  // ── Render Views ───────────────────────────────────────────────────────────
  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", paddingBottom: "80px" } },
    // iOS Frosted Navigation Bar
    h("header", {
      className: "ios-glass-nav",
      style: { position: "sticky", top: 0, zIndex: 100, padding: "14px 20px" }
    },
      h("div", {
        style: {
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }
      },
        // Apple Brand Header
        h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
          h("div", {
            style: {
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, var(--ios-red), #ff2d55)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
              boxShadow: "0 3px 10px rgba(255, 59, 48, 0.35)",
            }
          }, "🏏"),
          h("div", null,
            h("div", { style: { fontSize: "17px", fontWeight: "700", letterSpacing: "-0.4px" } }, "D5 IPL Fantasy"),
            h("div", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", fontWeight: "500" } }, "Season 2026 • Live League")
          )
        ),
        // iOS Segmented Navigation Control
        h(IOSSegmentedControl, {
          selectedId: tab,
          onChange: setTab,
          items: [
            { id: "standings", label: "Standings", icon: "🏆" },
            { id: "matches", label: "Scorecards", icon: "📋" },
            { id: "live", label: "Live & Matches", icon: "📡" },
            { id: "archive", label: "2025 Archive", icon: "📜" },
            { id: "rules", label: "Rules", icon: "🎯" },
          ]
        }),
        // Admin Auth Action
        h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
          isEditor
            ? h(IOSButton, { variant: "destructive", small: true, onClick: () => setIsEditor(false) }, "🔓 Lock Editor")
            : h(IOSButton, { variant: "ghost", small: true, onClick: () => setShowAdminModal(true) }, "🔒 Admin")
        )
      )
    ),

    // Main App View Content
    h("main", { style: { flex: 1, maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "20px" } },
      // 🏆 View 1: Standings
      tab === "standings" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "Leaderboard"),
            h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "Standings calculated using the D5 differential net scoring system")
          ),
          isEditor && h(IOSButton, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "+ Add Scorecard")
        ),
        // Standings Inset Table
        h(IOSCard, { style: { padding: 0, overflow: "hidden", marginBottom: "20px" } },
          h("div", { style: { overflowX: "auto" } },
            h("table", { className: "ios-table" },
              h("thead", null,
                h("tr", null,
                  h("th", { style: { width: "60px", textAlign: "center" } }, "POS"),
                  h("th", null, "TEAM"),
                  h("th", { style: { textAlign: "center" } }, "MATCHES"),
                  h("th", { style: { textAlign: "center" } }, "WINS"),
                  h("th", { style: { textAlign: "center" } }, "BEST"),
                  h("th", { style: { textAlign: "center" } }, "RAW PTS"),
                  h("th", { style: { textAlign: "right", paddingRight: "20px" } }, "NET GRAND PTS")
                )
              ),
              h("tbody", null,
                standingsData.leaderboard.map((team, idx) => h("tr", { key: team.id },
                  h("td", { style: { textAlign: "center", fontWeight: "700", color: idx === 0 ? "var(--ios-yellow)" : "var(--ios-text-secondary)" } },
                    idx === 0 ? "👑 1" : `${idx + 1}`
                  ),
                  h("td", null,
                    h("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
                      h(IOSTeamAvatar, { code: team.name.slice(0, 3).toUpperCase(), color: team.color, size: 34 }),
                      h("div", null,
                        h("div", { style: { fontWeight: "600", color: "#fff" } }, team.name),
                        h("div", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, `Avg: ${team.avgScore} pts`)
                      )
                    )
                  ),
                  h("td", { style: { textAlign: "center", fontWeight: "500" } }, team.played),
                  h("td", { style: { textAlign: "center", fontWeight: "600", color: "var(--ios-green)" } }, team.wins),
                  h("td", { style: { textAlign: "center", color: "var(--ios-teal)" } }, team.bestMatch),
                  h("td", { style: { textAlign: "center", color: "var(--ios-text-secondary)" } }, team.rawPointsTotal),
                  h("td", {
                    style: {
                      textAlign: "right",
                      paddingRight: "20px",
                      fontWeight: "700",
                      fontSize: "17px",
                      color: team.grandPoints >= 0 ? "var(--ios-green)" : "var(--ios-red)",
                    }
                  }, `${team.grandPoints >= 0 ? "+" : ""}${team.grandPoints}`)
                ))
              )
            )
          )
        ),
        // Empty State Banner
        entries.length === 0 && h(IOSCard, { style: { textAlign: "center", padding: "40px 20px" } },
          h("div", { style: { fontSize: "40px", marginBottom: "10px" } }, "🏏"),
          h("h3", { style: { fontSize: "18px", fontWeight: "600", marginBottom: "4px" } }, "No 2026 Matches Recorded Yet"),
          h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)", marginBottom: "16px" } }, "Unlock Admin mode to start logging fantasy match scorecards for the season."),
          isEditor && h(IOSButton, { variant: "tinted", onClick: () => setEditingEntry(blankEntry(teams)) }, "+ Submit First Match")
        )
      ),

      // 📋 View 2: Scorecards
      tab === "matches" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" } },
          h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "Match Scorecards"),
          isEditor && h(IOSButton, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "+ New Scorecard")
        ),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" } },
          entries.map((entry) => {
            const mScore = standingsData.matchScores.find((m) => m.id === entry.id);
            const winner = teams.find((t) => t.id === mScore?.winnerId);
            return h(IOSCard, { key: entry.id },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" } },
                h("div", null,
                  h("div", { style: { fontWeight: "700", fontSize: "16px" } }, entry.matchLabel || "Match Scorecard"),
                  h("div", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, fmtDate(entry.date))
                ),
                winner && h("span", {
                  style: {
                    padding: "3px 10px", borderRadius: "var(--ios-radius-full)",
                    background: `${winner.color}20`, border: `0.5px solid ${winner.color}`,
                    color: winner.color, fontSize: "11px", fontWeight: "600"
                  }
                }, `🏆 Winner: ${winner.name}`)
              ),
              // Matchup Team Cells
              h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "14px 0" } },
                teams.map((t) => {
                  const pts = mScore?.scores[t.id] || 0;
                  const netPts = mScore?.net[t.id] || 0;
                  const isWinner = t.id === winner?.id;
                  return h("div", {
                    key: t.id,
                    style: {
                      background: "var(--ios-bg-secondary)",
                      border: `0.5px solid ${isWinner ? t.color : "var(--ios-separator)"}`,
                      borderRadius: "var(--ios-radius-md)",
                      padding: "10px 12px",
                    }
                  },
                    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                      h("span", { style: { color: t.color, fontWeight: "600", fontSize: "13px" } }, t.name),
                      h("span", { style: { fontWeight: "700", fontSize: "16px", color: "#fff" } }, pts)
                    ),
                    h("div", { style: { fontSize: "11px", color: netPts >= 0 ? "var(--ios-green)" : "var(--ios-red)", marginTop: "4px" } },
                      `Net: ${netPts >= 0 ? "+" : ""}${netPts}`
                    )
                  );
                })
              ),
              // Action buttons
              isEditor && h("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "0.5px solid var(--ios-separator)", paddingTop: "10px" } },
                h(IOSButton, { variant: "ghost", small: true, onClick: () => setEditingEntry(entry) }, "Edit"),
                h(IOSButton, { variant: "destructive", small: true, onClick: () => handleDeleteScorecard(entry.id) }, "Delete")
              )
            );
          })
        )
      ),

      // 📡 View 3: Live & Fixtures
      tab === "live" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "Live Scores & Schedule"),
            lastRefreshedAt && h("div", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, `Updated ${lastRefreshedAt}`)
          ),
          h("div", { style: { display: "flex", gap: "8px" } },
            h(IOSButton, { variant: "tinted", small: true, onClick: fetchLiveScores, loading: liveLoading }, "🔄 Refresh"),
            h(IOSButton, { variant: autoRefresh ? "destructive" : "ghost", small: true, onClick: () => setAutoRefresh(!autoRefresh) }, autoRefresh ? "⏹ Stop Auto" : "▶ Auto 30s")
          )
        ),
        // Live match container
        Object.keys(liveScores).length > 0 ? h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px", marginBottom: "24px" } },
          IPL_SCHEDULE.filter((m) => liveScores[m.id]).map((m) => {
            const sd = liveScores[m.id];
            return h(IOSCard, { key: m.id, style: { borderColor: "var(--ios-red)" } },
              h(IOSLiveBadge),
              h("div", { style: { display: "flex", justifyContent: "space-between", margin: "14px 0" } },
                h(IOSTeamAvatar, { code: m.team1, color: IPL_TEAMS[m.team1]?.color || "#888", large: true }),
                h("div", { style: { alignSelf: "center", fontWeight: "700", color: "var(--ios-text-tertiary)" } }, "VS"),
                h(IOSTeamAvatar, { code: m.team2, color: IPL_TEAMS[m.team2]?.color || "#888", large: true })
              ),
              (sd.score || []).map((s, i) => h("div", { key: i, style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid var(--ios-separator)" } },
                h("span", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, s.inning),
                h("span", { style: { fontWeight: "700", color: "var(--ios-teal)" } }, `${s.r}/${s.w} (${s.o} ov)`)
              )),
              sd.status && h("div", { style: { fontSize: "12px", color: "var(--ios-orange)", marginTop: "8px" } }, sd.status)
            );
          })
        ) : h(IOSCard, { style: { textAlign: "center", padding: "30px 20px", marginBottom: "24px" } },
          h("div", { style: { fontSize: "36px", marginBottom: "6px" } }, "🏏"),
          h("h3", { style: { fontSize: "17px", fontWeight: "600" } }, "No Live Match Active Right Now"),
          h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "Real-time match scores will automatically update here when matches begin.")
        ),
        // Fixture List
        h("h2", { style: { fontSize: "20px", fontWeight: "700", marginBottom: "12px" } }, "Upcoming Fixtures"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" } },
          IPL_SCHEDULE.map((m) => {
            const d = getDaysUntil(m.date);
            return h(IOSCard, { key: m.id },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
                h("span", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, `${fmtDate(m.date)} • ${m.time}`),
                h(IOSStatusBadge, { status: d < 0 ? "completed" : "upcoming", daysUntil: d })
              ),
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" } },
                h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                  h(IOSTeamAvatar, { code: m.team1, color: IPL_TEAMS[m.team1]?.color || "#888", size: 30 }),
                  h("span", { style: { fontWeight: "600", fontSize: "14px" } }, m.team1)
                ),
                h("span", { style: { color: "var(--ios-text-tertiary)", fontSize: "13px" } }, "vs"),
                h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                  h("span", { style: { fontWeight: "600", fontSize: "14px" } }, m.team2),
                  h(IOSTeamAvatar, { code: m.team2, color: IPL_TEAMS[m.team2]?.color || "#888", size: 30 })
                )
              ),
              h("div", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", borderTop: "0.5px solid var(--ios-separator)", paddingTop: "8px", marginTop: "6px" } },
                `📍 ${m.venue}`
              )
            );
          })
        )
      ),

      // 📜 View 4: 2025 Archive
      tab === "archive" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "2025 Historical Archive"),
            h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "47 historical match records from the 2025 tournament")
          ),
          h("select", {
            className: "ios-input",
            value: histFilter,
            onChange: (e) => setHistFilter(e.target.value),
            style: { width: "160px" }
          },
            h("option", { value: "ALL" }, "All Teams"),
            Object.keys(D5_2025.grand || {}).map((t) => h("option", { key: t, value: t }, t))
          )
        ),
        // 2025 Standings Table
        h(IOSCard, { style: { padding: 0, overflow: "hidden", marginBottom: "20px" } },
          h("div", { style: { overflowX: "auto" } },
            h("table", { className: "ios-table" },
              h("thead", null,
                h("tr", null,
                  h("th", { style: { width: "60px", textAlign: "center" } }, "RANK"),
                  h("th", null, "HISTORICAL TEAM"),
                  h("th", { style: { textAlign: "center" } }, "MATCHES"),
                  h("th", { style: { textAlign: "center" } }, "WINS"),
                  h("th", { style: { textAlign: "center" } }, "WIN RATE"),
                  h("th", { style: { textAlign: "right", paddingRight: "20px" } }, "TOTAL POINTS")
                )
              ),
              h("tbody", null,
                Object.entries(D5_2025.grand || {}).sort((a, b) => b[1] - a[1]).map(([t, pts], i) => {
                  const wins = D5_2025.wins?.[t] || 0;
                  const matchCount = D5_2025.matches.filter((m) => m.teams[t]).length;
                  const winRate = matchCount ? Math.round((wins / matchCount) * 100) : 0;
                  const cfg = D5_TEAM_CONFIG[t] || { color: "#888" };
                  return h("tr", { key: t },
                    h("td", { style: { textAlign: "center", fontWeight: "700", color: i === 0 ? "var(--ios-yellow)" : "var(--ios-text-secondary)" } },
                      i === 0 ? "🏆 1" : `${i + 1}`
                    ),
                    h("td", null,
                      h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                        h("span", { style: { width: "10px", height: "10px", borderRadius: "50%", background: cfg.color } }),
                        h("span", { style: { fontWeight: "600", color: cfg.color } }, t)
                      )
                    ),
                    h("td", { style: { textAlign: "center" } }, matchCount),
                    h("td", { style: { textAlign: "center", fontWeight: "600", color: "var(--ios-green)" } }, wins),
                    h("td", { style: { textAlign: "center", color: "var(--ios-teal)" } }, `${winRate}%`),
                    h("td", { style: { textAlign: "right", paddingRight: "20px", fontWeight: "700", fontSize: "16px", color: "var(--ios-yellow)" } }, pts)
                  );
                })
              )
            )
          )
        ),
        // Match Cards Grid
        h("h2", { style: { fontSize: "20px", fontWeight: "700", marginBottom: "12px" } }, "Match Scorecards"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" } },
          D5_2025.matches
            .filter((m) => histFilter === "ALL" || m.teams[histFilter])
            .map((m) => {
              const sorted = Object.entries(m.totals).sort((a, b) => b[1] - a[1]);
              const top = sorted[0];
              const topCfg = D5_TEAM_CONFIG[top?.[0]] || { color: "#888" };
              return h(IOSCard, {
                key: m.id,
                onClick: () => setSelHistMatch(m),
                style: { cursor: "pointer" }
              },
                h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } },
                  h("span", { style: { fontWeight: "600", fontSize: "15px" } }, m.sheet),
                  top && h("span", {
                    style: { padding: "2px 8px", borderRadius: "var(--ios-radius-full)", background: `${topCfg.color}20`, color: topCfg.color, fontSize: "11px", fontWeight: "600" }
                  }, `🏆 ${top[0]}`)
                ),
                h("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" } },
                  sorted.map(([t, pts]) => {
                    const cfg = D5_TEAM_CONFIG[t] || { color: "#888" };
                    return h("span", {
                      key: t,
                      style: { padding: "3px 8px", borderRadius: "8px", background: `${cfg.color}15`, color: cfg.color, fontSize: "12px", fontWeight: "500" }
                    }, `${t}: ${pts}`);
                  })
                )
              );
            })
        )
      ),

      // 🎯 View 5: Rules & Scoring
      tab === "rules" && h("div", null,
        h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "18px" } }, "Scoring Rules"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "20px" } },
          h(IOSGroupedList, { title: "Base Points" },
            [
              ["Run", "+5 pts / run", "⚡"],
              ["Wicket", "+100 pts / wkt", "🎯"],
              ["Catch", "+50 pts / catch", "🧤"],
              ["Stumping", "+50 pts / st", "⚡"],
              ["Run Out", "+50 / +100 pts", "🏃"],
              ["Duck Penalty", "−50 pts", "🦆"],
            ].map(([k, v, icon]) => h(IOSCell, { key: k, label: k, value: v, icon }))
          ),
          h(IOSGroupedList, { title: "Milestone Bonuses" },
            [
              ["Runs 30 – 49", "+50 pts", "🏏"],
              ["Runs 50 – 99 (Half-Century)", "+150 pts", "🔥"],
              ["Runs 100+ (Century)", "+250 pts", "💯"],
              ["2 Wickets", "+50 pts", "🎳"],
              ["3 – 4 Wickets", "+150 pts", "🎳"],
              ["5+ Wickets (Fifer)", "+200 pts", "🌟"],
              ["3 Catches / 5 Catches", "+100 / +200 pts", "🧤"],
              ["5 – 9 Sixes / 10+ Sixes", "+150 / +300 pts", "🚀"],
              ["Maiden Over / Hat-trick", "+200 / +400 pts", "🎩"],
            ].map(([k, v, icon]) => h(IOSCell, { key: k, label: k, value: v, icon }))
          )
        ),
        h(IOSCard, null,
          h("h3", { style: { color: "var(--ios-green)", fontSize: "16px", fontWeight: "600", marginBottom: "6px" } }, "🌟 Captain & Differential Scoring"),
          h("p", { style: { fontSize: "13.5px", color: "var(--ios-text-secondary)", lineHeight: "1.7", marginBottom: "8px" } },
            "• Captain 2× Multiplier: Each team designates 1 Captain who scores double points for all actions and bonuses."
          ),
          h("p", { style: { fontSize: "13.5px", color: "var(--ios-text-secondary)", lineHeight: "1.7" } },
            "• Differential Net League Points: In every match, the winning team earns the total point difference against all losing teams combined. Losers lose the exact point difference against the winner."
          )
        )
      )
    ),

    // Modal: Admin PIN Unlock
    h(IOSModalSheet, {
      isOpen: showAdminModal,
      onClose: () => { setShowAdminModal(false); setAdminPin(""); setAdminError(""); },
      title: "Admin Authentication",
      maxWidth: "400px",
    },
      h("div", { style: { display: "flex", flexDirection: "column", gap: "14px" } },
        h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "Enter the League Editor PIN to manage match scorecards and team settings."),
        h("input", {
          className: "ios-input",
          type: "password",
          value: adminPin,
          onChange: (e) => { setAdminPin(e.target.value); setAdminError(""); },
          placeholder: "Enter PIN (default: ipl)",
          autoFocus: true,
        }),
        adminError && h("div", { style: { color: "var(--ios-red)", fontSize: "12px" } }, adminError),
        h("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" } },
          h(IOSButton, { variant: "ghost", small: true, onClick: () => { setShowAdminModal(false); setAdminPin(""); setAdminError(""); } }, "Cancel"),
          h(IOSButton, {
            variant: "primary", small: true,
            onClick: () => {
              if (adminPin === (window.EDITOR_PASSWORD || "ipl")) {
                setIsEditor(true);
                setShowAdminModal(false);
                setAdminPin("");
              } else {
                setAdminError("Incorrect PIN");
              }
            }
          }, "Unlock")
        )
      )
    ),

    // Modal: Match Scorecard Editor
    editingEntry && h(IOSModalSheet, {
      isOpen: Boolean(editingEntry),
      onClose: () => setEditingEntry(null),
      title: "Match Scorecard Editor",
      maxWidth: "880px",
    },
      h(IOSMatchEditorContent, {
        entry: editingEntry,
        teams,
        onSave: handleSaveScorecard,
        onCancel: () => setEditingEntry(null),
      })
    ),

    // Modal: 2025 Match Scorecard
    selHistMatch && h(IOSModalSheet, {
      isOpen: Boolean(selHistMatch),
      onClose: () => setSelHistMatch(null),
      title: `Scorecard: ${selHistMatch.sheet}`,
      maxWidth: "760px",
    },
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" } },
        Object.entries(selHistMatch.totals).sort((a, b) => b[1] - a[1]).map(([tName, pts]) => {
          const cfg = D5_TEAM_CONFIG[tName] || { color: "#888" };
          const roster = selHistMatch.teams[tName] || [];
          return h("div", {
            key: tName,
            style: { background: "var(--ios-bg-secondary)", borderRadius: "var(--ios-radius-md)", padding: "14px", border: `0.5px solid ${cfg.color}44` }
          },
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
              h("span", { style: { fontWeight: "700", color: cfg.color } }, tName),
              h("span", { style: { fontWeight: "700", fontSize: "16px", color: "#fff" } }, `${pts} pts`)
            ),
            roster.map((p, idx) => h("div", {
              key: idx,
              style: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px", borderBottom: "0.5px solid var(--ios-separator)" }
            },
              h("span", { style: { color: p.cap ? "var(--ios-yellow)" : "var(--ios-text-secondary)" } }, p.cap ? `★ ${p.n}` : p.n),
              h("span", { style: { color: "var(--ios-teal)", fontWeight: "600" } }, p.pts)
            ))
          );
        })
      )
    )
  );
}

// ─── 3. iOS MATCH SCORECARD EDITOR SUBCOMPONENT ───────────────────────────────

function IOSMatchEditorContent({ entry, teams, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(entry)));
  const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id || "T1");

  const updatePlayerField = (teamId, playerIdx, field, val) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId][playerIdx][field] = val;
      return next;
    });
  };

  const toggleCaptain = (teamId, playerIdx) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId].forEach((p, idx) => {
        p.isCaptain = idx === playerIdx;
      });
      return next;
    });
  };

  return h("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } },
    // Header Inputs
    h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } },
      h("div", null,
        h("label", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" } }, "Scorecard Label"),
        h("input", {
          className: "ios-input",
          type: "text",
          value: draft.matchLabel || "",
          onChange: (e) => setDraft({ ...draft, matchLabel: e.target.value }),
          placeholder: "e.g. Match 1 - CSK vs RCB",
          style: { width: "100%" }
        })
      ),
      h("div", null,
        h("label", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" } }, "Match Date"),
        h("input", {
          className: "ios-input",
          type: "date",
          value: draft.date || "",
          onChange: (e) => setDraft({ ...draft, date: e.target.value }),
          style: { width: "100%" }
        })
      )
    ),

    // iOS Team Segment Switcher
    h("div", { style: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" } },
      teams.map((t) => {
        const isSel = activeTeamId === t.id;
        const total = (draft.teamData[t.id] || []).reduce((s, p) => s + calcPts(p), 0);
        return h("button", {
          key: t.id,
          onClick: () => setActiveTeamId(t.id),
          style: {
            padding: "8px 14px",
            borderRadius: "var(--ios-radius-md)",
            border: isSel ? `1px solid ${t.color}` : "0.5px solid var(--ios-separator)",
            background: isSel ? `${t.color}22` : "var(--ios-bg-secondary)",
            color: isSel ? t.color : "var(--ios-text-secondary)",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }
        },
          h("span", { style: { width: "8px", height: "8px", borderRadius: "50%", background: t.color } }),
          `${t.name} (${total} pts)`
        );
      })
    ),

    // Player Rows Inset Group
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      (draft.teamData[activeTeamId] || []).map((player, pIdx) => {
        const pts = calcPts(player);
        return h("div", {
          key: player.id || pIdx,
          style: {
            background: "var(--ios-bg-secondary)",
            border: player.isCaptain ? "1px solid var(--ios-yellow)" : "0.5px solid var(--ios-separator)",
            borderRadius: "var(--ios-radius-md)",
            padding: "12px",
            display: "grid",
            gridTemplateColumns: "150px 1fr 1fr 1fr 1fr 1fr 50px 70px",
            gap: "8px",
            alignItems: "center",
          }
        },
          h("div", null,
            h("input", {
              className: "ios-input",
              type: "text",
              value: player.name || "",
              onChange: (e) => updatePlayerField(activeTeamId, pIdx, "name", e.target.value),
              placeholder: `Player ${pIdx + 1}`,
              style: { width: "100%", padding: "6px 8px", fontSize: "13px" }
            }),
            h("button", {
              onClick: () => toggleCaptain(activeTeamId, pIdx),
              style: {
                background: "none", border: "none",
                color: player.isCaptain ? "var(--ios-yellow)" : "var(--ios-text-tertiary)",
                fontSize: "11px", fontWeight: "600", cursor: "pointer", marginTop: "4px", display: "block"
              }
            }, player.isCaptain ? "★ Captain (2×)" : "☆ Set Captain")
          ),
          h(IOSNumberInput, { label: "Runs", value: player.runs || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "runs", v) }),
          h(IOSNumberInput, { label: "Wkts", value: player.wkts || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "wkts", v) }),
          h(IOSNumberInput, { label: "Catch", value: player.catch || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "catch", v) }),
          h(IOSNumberInput, { label: "RO/St", value: (player.ro || 0) + (player.stmp || 0), onChange: (v) => updatePlayerField(activeTeamId, pIdx, "ro", v) }),
          h(IOSNumberInput, { label: "6s", value: player.b6s || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "b6s", v) }),
          h(IOSNumberInput, { label: "Duck", value: player.duck || 0, min: 0, max: 1, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "duck", v) }),
          h("div", { style: { textAlign: "right", fontWeight: "700", fontSize: "17px", color: "var(--ios-green)" } }, pts)
        );
      })
    ),

    // Footer actions
    h("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" } },
      h(IOSButton, { variant: "ghost", onClick: onCancel }, "Cancel"),
      h(IOSButton, { variant: "primary", onClick: () => onSave(draft) }, "Save Scorecard")
    )
  );
}

// ─── 4. BOOTSTRAP ─────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
const loadingEl = document.getElementById("loading");
if (loadingEl) loadingEl.style.display = "none";
