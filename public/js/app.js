/**
 * D5 IPL Fantasy Platform — 2027 Season Edition
 * High-End iOS Design System & Manual Match/Player Selection Suite
 */

const { useState, useEffect, useRef, useMemo, createElement: h } = React;

// ─── HAPTIC FEEDBACK HELPER ──────────────────────────────────────────────────
const hapticFeedback = (pattern = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

// ─── REUSABLE ACCESSIBLE iOS COMPONENTS ──────────────────────────────────────

function IOSButton({ onClick, children, variant = "primary", disabled = false, small = false, loading = false, style = {}, ariaLabel }) {
  const handleClick = (e) => {
    hapticFeedback(12);
    if (onClick) onClick(e);
  };
  return h("button", {
    onClick: handleClick,
    disabled: disabled || loading,
    className: `ios-btn ios-btn-${variant}`,
    "aria-label": ariaLabel,
    "aria-busy": loading,
    style: {
      padding: small ? "7px 16px" : "11px 22px",
      fontSize: small ? "13px" : "15px",
      fontWeight: "700",
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

function IOSCard({ children, style = {}, className = "", onClick }) {
  return h("div", {
    className: `ios-glass ${className}`,
    onClick: onClick ? (e) => { hapticFeedback(8); onClick(e); } : undefined,
    style: {
      borderRadius: "var(--ios-radius-lg)",
      padding: "18px",
      transition: "all 0.2s var(--ios-ease-smooth)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }
  }, children);
}

function IOSLiveBadge({ text = "LIVE 2027" }) {
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
    text
  );
}

function IOSTeamAvatar({ code, color, size = 40, large = false }) {
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

function IOSModalSheet({ isOpen, onClose, title, children, maxWidth = "920px" }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return h("div", {
    className: "ios-sheet-backdrop",
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
    role: "dialog",
    "aria-modal": true,
  },
    h("div", { className: "ios-sheet-card", style: { maxWidth } },
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
        h("h2", { style: { fontSize: "18px", fontWeight: "700", color: "var(--ios-text-primary)" } }, title),
        h("button", {
          onClick: onClose,
          style: {
            background: "rgba(118, 118, 128, 0.24)",
            border: "none",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            color: "var(--ios-text-secondary)",
            fontSize: "16px",
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

function IOSNumberInput({ label, value, onChange, min = 0, max = 999 }) {
  return h("div", { style: { display: "flex", flexDirection: "column", gap: "3px" } },
    label && h("span", { style: { fontSize: "10px", fontWeight: "600", color: "var(--ios-text-secondary)", textTransform: "uppercase" } }, label),
    h("input", {
      className: "ios-input",
      type: "number",
      min,
      max,
      value,
      onChange: (e) => onChange(Number(e.target.value)),
      style: { textAlign: "center", padding: "6px 4px", fontSize: "13px", fontWeight: "700" }
    })
  );
}

// ─── MAIN APPLICATION COMPONENT ───────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState("matches");
  const [teams, setTeams] = useState(DEFAULT_2027_TEAMS);
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);

  // Live Simulator Engine
  const [simActive, setSimActive] = useState(false);
  const [simScore, setSimScore] = useState({ r: 172, w: 4, o: "18.1", target: 188, team1: "CSK", team2: "MI" });

  // Squads Explorer
  const [selSquadTeam, setSelSquadTeam] = useState("CSK");
  const [squadRoleFilter, setSquadRoleFilter] = useState("ALL");

  // 2025 Archive
  const [histFilter, setHistFilter] = useState("ALL");
  const [selHistMatch, setSelHistMatch] = useState(null);

  // ── Firebase Realtime Sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (window.db) {
      const teamsRef = window.db.ref("d5_2027_teams");
      const entriesRef = window.db.ref("d5_2027_entries");

      teamsRef.on("value", (snap) => {
        const val = snap.val();
        if (val) setTeams(val);
      });
      entriesRef.on("value", (snap) => {
        const val = snap.val();
        setEntries(val ? Object.values(val) : []);
      });

      return () => {
        teamsRef.off();
        entriesRef.off();
      };
    }
  }, []);

  // ── Live Game Simulator Loop ───────────────────────────────────────────────
  useEffect(() => {
    if (!simActive) return;
    const t = setInterval(() => {
      setSimScore((prev) => {
        const runsAdd = Math.floor(Math.random() * 4);
        const isWicket = Math.random() < 0.12 && prev.w < 10;
        const currentBalls = Math.floor(parseFloat(prev.o)) * 6 + Math.round((parseFloat(prev.o) % 1) * 10) + 1;
        const newOvers = `${Math.floor(currentBalls / 6)}.${currentBalls % 6}`;
        return {
          ...prev,
          r: prev.r + runsAdd,
          w: isWicket ? prev.w + 1 : prev.w,
          o: newOvers,
        };
      });
    }, 2800);
    return () => clearInterval(t);
  }, [simActive]);

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

  const handleSaveScorecard = (entry) => {
    if (window.db) {
      window.db.ref(`d5_2027_entries/${entry.id}`).set(entry);
    } else {
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === entry.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
        return [...prev, entry];
      });
    }
    setEditingEntry(null);
  };

  const handleDeleteScorecard = (id) => {
    if (confirm("Are you sure you want to delete this match scorecard?")) {
      if (window.db) {
        window.db.ref(`d5_2027_entries/${id}`).remove();
      } else {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", paddingBottom: "90px" } },
    // ── 1. Top Navigation & Dynamic Island ────────────────────────────────────
    h("header", {
      className: "ios-glass-nav",
      style: { position: "sticky", top: 0, zIndex: 100, padding: "10px 18px" }
    },
      h("div", {
        style: {
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }
      },
        // Brand Title
        h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
          h("div", {
            style: {
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, var(--ios-red), #ff2d55)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
              boxShadow: "0 3px 10px rgba(255, 59, 48, 0.35)",
            }
          }, "🏏"),
          h("div", null,
            h("div", { style: { fontSize: "18px", fontWeight: "800", letterSpacing: "-0.4px" } }, "D5 IPL Fantasy"),
            h("div", { style: { fontSize: "11px", color: "var(--ios-green)", fontWeight: "700" } }, "IPL 2027 • Manual Control Suite")
          )
        ),

        // Apple Dynamic Island Live Activity Widget
        h("div", {
          className: "dynamic-island",
          onClick: () => setTab("live"),
          title: "Click to open Live Tracker"
        },
          h("span", { className: "ios-pulse-dot" }),
          h("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" } },
            simActive ? h("span", null,
              h("strong", { style: { color: "var(--ios-teal)" } }, `${simScore.team1} ${simScore.r}/${simScore.w}`),
              h("span", { style: { color: "var(--ios-text-secondary)", fontSize: "11px", marginLeft: "4px" } }, `(${simScore.o} ov) vs ${simScore.team2}`)
            ) : h("span", { style: { color: "var(--ios-text-primary)", fontWeight: "600" } },
              "IPL 2027 Manual Match Entry Active"
            )
          )
        ),

        // Prominent Header Button
        h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
          h(IOSButton, {
            variant: "primary",
            onClick: () => setEditingEntry(blankEntry(teams)),
            style: { background: "linear-gradient(135deg, #0a84ff, #0066cc)", boxShadow: "0 3px 12px rgba(10,132,255,0.4)" }
          }, "➕ Add / Enter Match")
        )
      )
    ),

    // ── 2. Main App Views ─────────────────────────────────────────────────────
    h("main", { style: { flex: 1, maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "20px" } },

      // 📋 View 1: Matches / Scorecards (DEFAULT VIEW)
      tab === "matches" && h("div", null,
        h("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
            background: "rgba(255,255,255,0.04)",
            padding: "16px 20px",
            borderRadius: "var(--ios-radius-lg)",
            border: "0.5px solid var(--ios-separator)"
          }
        },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "Match Scorecards & Player Selections"),
            h("p", { style: { fontSize: "13.5px", color: "var(--ios-text-secondary)", marginTop: "2px" } },
              "Create new matches, select 5-player team rosters, set captains, and enter individual scores."
            )
          ),
          h(IOSButton, {
            variant: "primary",
            onClick: () => setEditingEntry(blankEntry(teams)),
            style: { background: "var(--ios-blue)", fontSize: "15px", padding: "12px 24px" }
          }, "➕ Create Match Entry")
        ),

        // Grid of Matches
        entries.length > 0 ? h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" } },
          entries.map((entry) => {
            const mScore = standingsData.matchScores.find((m) => m.id === entry.id);
            const winner = teams.find((t) => t.id === mScore?.winnerId);
            return h(IOSCard, {
              key: entry.id,
              onClick: () => setEditingEntry(entry),
              style: { cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)" }
            },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" } },
                h("div", null,
                  h("div", { style: { fontWeight: "800", fontSize: "17px", color: "#fff" } }, entry.matchLabel || "Match Scorecard"),
                  h("div", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, fmtDate(entry.date))
                ),
                winner && h("span", {
                  style: {
                    padding: "3px 10px", borderRadius: "var(--ios-radius-full)",
                    background: `${winner.color}20`, border: `0.5px solid ${winner.color}`,
                    color: winner.color, fontSize: "11px", fontWeight: "700"
                  }
                }, `🏆 Winner: ${winner.name}`)
              ),
              // Teams breakdown
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
                      h("span", { style: { color: t.color, fontWeight: "700", fontSize: "13px" } }, t.name),
                      h("span", { style: { fontWeight: "800", fontSize: "16px", color: "#fff" } }, pts)
                    ),
                    h("div", { style: { fontSize: "11px", color: netPts >= 0 ? "var(--ios-green)" : "var(--ios-red)", marginTop: "4px" } },
                      `Net: ${netPts >= 0 ? "+" : ""}${netPts}`
                    )
                  );
                })
              ),
              // Action Buttons on Card
              h("div", {
                style: { display: "flex", gap: "8px", justifyContent: "space-between", borderTop: "0.5px solid var(--ios-separator)", paddingTop: "10px" },
                onClick: (e) => e.stopPropagation()
              },
                h(IOSButton, {
                  variant: "tinted", small: true,
                  onClick: () => setEditingEntry(entry)
                }, "✏️ Edit Players / Stats"),
                h(IOSButton, {
                  variant: "destructive", small: true,
                  onClick: () => handleDeleteScorecard(entry.id)
                }, "🗑️ Delete")
              )
            );
          })
        ) : h(IOSCard, { style: { textAlign: "center", padding: "48px 20px" } },
          h("div", { style: { fontSize: "44px", marginBottom: "12px" } }, "🏏"),
          h("h3", { style: { fontSize: "20px", fontWeight: "700", marginBottom: "6px" } }, "No Matches Recorded Yet for IPL 2027"),
          h("p", { style: { fontSize: "14px", color: "var(--ios-text-secondary)", marginBottom: "20px" } },
            "Click the button below to manually enter match details and select players for all 4 fantasy teams."
          ),
          h(IOSButton, {
            variant: "primary",
            onClick: () => setEditingEntry(blankEntry(teams)),
            style: { padding: "14px 28px", fontSize: "16px" }
          }, "➕ Enter Match #1 Now")
        )
      ),

      // 🏆 View 2: Standings
      tab === "standings" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "IPL 2027 Leaderboard"),
            h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "Dynamic net differential ranking for the 2027 tournament")
          ),
          h(IOSButton, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "➕ Enter Match Scorecard")
        ),
        // Standings Table
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
                  h("td", { style: { textAlign: "center" } }, team.played),
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
        )
      ),

      // 📡 View 3: Live Simulator
      tab === "live" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "Live Match Tracker & Simulator"),
            h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "Interactive live game engine & IPL 2027 schedule")
          ),
          h("div", { style: { display: "flex", gap: "8px" } },
            h(IOSButton, {
              variant: simActive ? "destructive" : "green",
              small: true,
              onClick: () => setSimActive(!simActive)
            }, simActive ? "⏹ Stop Simulator" : "▶ Start Live Game Sim")
          )
        ),
        simActive && h(IOSCard, { style: { borderColor: "var(--ios-green)", marginBottom: "20px", background: "rgba(48,209,88,0.06)" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } },
            h(IOSLiveBadge, { text: "LIVE GAME SIMULATOR" }),
            h("span", { style: { fontSize: "12px", color: "var(--ios-green)", fontWeight: "600" } }, "Simulating ball-by-ball (3s)")
          ),
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0" } },
            h(IOSTeamAvatar, { code: simScore.team1, color: IPL_TEAMS[simScore.team1]?.color || "#888", large: true }),
            h("div", { style: { textAlign: "center" } },
              h("div", { style: { fontSize: "32px", fontWeight: "800", color: "var(--ios-teal)" } }, `${simScore.r}/${simScore.w}`),
              h("div", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, `Overs: ${simScore.o} • Target: ${simScore.target}`)
            ),
            h(IOSTeamAvatar, { code: simScore.team2, color: IPL_TEAMS[simScore.team2]?.color || "#888", large: true })
          )
        ),
        h("h2", { style: { fontSize: "20px", fontWeight: "700", marginBottom: "12px" } }, "IPL 2027 Fixture Schedule"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" } },
          IPL_SCHEDULE_2027.map((m) => h(IOSCard, { key: m.id },
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
              h("span", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } }, `${fmtDate(m.date)} • ${m.time}`),
              h("span", { style: { fontSize: "11px", padding: "2px 8px", borderRadius: "var(--ios-radius-full)", background: "var(--ios-bg-secondary)", color: "var(--ios-text-secondary)" } }, "Scheduled")
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
          ))
        )
      ),

      // 👥 View 4: Squads
      tab === "squads" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" } }, "IPL 2027 Player Directory"),
            h("p", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } }, "Player profiles & rosters across all 10 franchises")
          ),
          h("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
            ["ALL", "BAT", "BOWL", "ALL-ROUND", "WK"].map((r) => h("button", {
              key: r,
              onClick: () => setSquadRoleFilter(r),
              style: {
                padding: "5px 12px", borderRadius: "var(--ios-radius-full)",
                border: "none",
                background: squadRoleFilter === r ? "rgba(255,255,255,0.2)" : "var(--ios-bg-secondary)",
                color: squadRoleFilter === r ? "#fff" : "var(--ios-text-secondary)",
                fontSize: "12px", fontWeight: "600", cursor: "pointer"
              }
            }, r))
          )
        ),
        h("div", { style: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" } },
          Object.entries(IPL_TEAMS).map(([code, t]) => {
            const isSel = selSquadTeam === code;
            return h("button", {
              key: code,
              onClick: () => setSelSquadTeam(code),
              style: {
                padding: "8px 14px",
                borderRadius: "var(--ios-radius-md)",
                border: isSel ? `1.5px solid ${t.color}` : "0.5px solid var(--ios-separator)",
                background: isSel ? `${t.color}22` : "var(--ios-bg-secondary)",
                color: isSel ? t.color : "var(--ios-text-secondary)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }
            },
              h(IOSTeamAvatar, { code, color: t.color, size: 24 }),
              code
            );
          })
        ),
        h(IOSCard, null,
          h("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" } },
            h(IOSTeamAvatar, { code: selSquadTeam, color: IPL_TEAMS[selSquadTeam]?.color || "#888", large: true }),
            h("div", null,
              h("h2", { style: { fontSize: "20px", fontWeight: "700" } }, IPL_TEAMS[selSquadTeam]?.name),
              h("div", { style: { fontSize: "12px", color: "var(--ios-text-secondary)" } },
                `City: ${IPL_TEAMS[selSquadTeam]?.city || ""} • IPL Trophies: ${IPL_TEAMS[selSquadTeam]?.titleWins || 0} 🏆`
              )
            )
          ),
          h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" } },
            (IPL_SQUADS[selSquadTeam] || [])
              .filter((p) => {
                if (squadRoleFilter === "ALL") return true;
                if (squadRoleFilter === "BAT") return p.role === "BAT";
                if (squadRoleFilter === "BOWL") return p.role === "BOWL";
                if (squadRoleFilter === "ALL-ROUND") return p.role === "ALL";
                if (squadRoleFilter === "WK") return p.role === "WK";
                return true;
              })
              .map((player, idx) => h("div", {
                key: idx,
                style: {
                  background: "var(--ios-bg-secondary)",
                  border: "0.5px solid var(--ios-separator)",
                  borderRadius: "var(--ios-radius-md)",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }
              },
                h("div", null,
                  h("div", { style: { fontWeight: "600", fontSize: "14px" } }, player.name),
                  player.overseas && h("span", { style: { fontSize: "10px", color: "var(--ios-text-tertiary)" } }, "✈ Overseas")
                ),
                h("span", {
                  className: `role-badge ${player.role === "BAT" ? "role-bat" : player.role === "BOWL" ? "role-bowl" : player.role === "ALL" ? "role-all" : "role-wk"}`
                }, player.role)
              ))
          )
        )
      ),

      // 📜 View 5: 2025 Archive
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

      // 🎯 View 6: Rules
      tab === "rules" && h("div", null,
        h("h1", { style: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "18px" } }, "IPL 2027 Scoring Rules"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "20px" } },
          h(IOSCard, null,
            h("h3", { style: { color: "var(--ios-teal)", fontSize: "17px", fontWeight: "700", marginBottom: "12px" } }, "⚡ Base Points"),
            [
              ["Run", "+5 pts / run", "⚡"],
              ["Wicket", "+100 pts / wkt", "🎯"],
              ["Catch", "+50 pts / catch", "🧤"],
              ["Stumping", "+50 pts / st", "⚡"],
              ["Run Out", "+50 / +100 pts", "🏃"],
              ["Duck Penalty", "−50 pts", "🦆"],
            ].map(([k, v, icon]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--ios-separator)" } },
              h("span", { style: { color: "var(--ios-text-secondary)" } }, `${icon} ${k}`),
              h("span", { style: { fontWeight: "700", color: k.includes("Duck") ? "var(--ios-red)" : "#fff" } }, v)
            ))
          ),
          h(IOSCard, null,
            h("h3", { style: { color: "var(--ios-orange)", fontSize: "17px", fontWeight: "700", marginBottom: "12px" } }, "⭐ Milestone Bonuses"),
            [
              ["Runs 30 – 49", "+50 pts"],
              ["Runs 50 – 99 (Half-Century)", "+150 pts"],
              ["Runs 100+ (Century)", "+250 pts"],
              ["2 Wickets / 3-4 Wickets", "+50 / +150 pts"],
              ["5+ Wickets (Fifer)", "+200 pts"],
              ["3 Catches / 5 Catches", "+100 / +200 pts"],
              ["5 – 9 Sixes / 10+ Sixes", "+150 / +300 pts"],
              ["Maiden Over / Hat-trick", "+200 / +400 pts"],
            ].map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--ios-separator)" } },
              h("span", { style: { color: "var(--ios-text-secondary)" } }, k),
              h("span", { style: { fontWeight: "700", color: "var(--ios-orange)" } }, v)
            ))
          )
        ),
        h(IOSCard, { style: { borderColor: "rgba(48,209,88,0.3)" } },
          h("h3", { style: { color: "var(--ios-green)", fontSize: "17px", fontWeight: "700", marginBottom: "8px" } }, "🌟 Captain & Differential Scoring"),
          h("p", { style: { fontSize: "13.5px", color: "var(--ios-text-secondary)", lineHeight: "1.7", marginBottom: "10px" } },
            "1. ", h("strong", { style: { color: "#fff" } }, "Captain 2× Multiplier: "),
            "Designated captain receives double (2×) all base points and bonuses."
          ),
          h("p", { style: { fontSize: "13.5px", color: "var(--ios-text-secondary)", lineHeight: "1.7" } },
            "2. ", h("strong", { style: { color: "#fff" } }, "Differential Net Points: "),
            "Winner gains the sum of differences between their total score and all losing teams. Losers lose the exact point difference against the winner."
          )
        )
      )
    ),

    // ── 3. Floating Bottom Tab Bar ────────────────────────────────────────────
    h("nav", {
      className: "ios-bottom-tabbar",
      role: "navigation"
    },
      [
        { id: "matches", label: "Matches", icon: "📋" },
        { id: "standings", label: "Standings", icon: "🏆" },
        { id: "live", label: "Live Sim", icon: "📡" },
        { id: "squads", label: "Players", icon: "👥" },
        { id: "archive", label: "2025", icon: "📜" },
        { id: "rules", label: "Rules", icon: "🎯" },
      ].map((item) => {
        const isSel = tab === item.id;
        return h("button", {
          key: item.id,
          onClick: () => { hapticFeedback(10); setTab(item.id); },
          className: `ios-tab-item ${isSel ? "active" : ""}`,
        },
          h("span", { style: { fontSize: "16px" } }, item.icon),
          h("span", null, item.label)
        );
      })
    ),

    // ── 4. 🌟 Manual Match & Player Selection Modal Suite ────────────────────
    editingEntry && h(IOSModalSheet, {
      isOpen: Boolean(editingEntry),
      onClose: () => setEditingEntry(null),
      title: "IPL 2027 Manual Match Creator & Scorecard",
      maxWidth: "960px",
    },
      h(IOSManualMatchEditor, {
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

// ─── MANUAL MATCH & PLAYER SELECTION SUITE ────────────────────────────────────

function IOSManualMatchEditor({ entry, teams, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(entry)));
  const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id || "T1");

  // Flattened player list across all IPL squads for easy selection
  const allIplPlayers = useMemo(() => {
    const list = [];
    Object.entries(IPL_SQUADS).forEach(([teamCode, squad]) => {
      squad.forEach((p) => {
        list.push({ name: p.name, role: p.role, teamCode });
      });
    });
    return list;
  }, []);

  const updatePlayerField = (teamId, playerIdx, field, val) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId][playerIdx][field] = val;
      return next;
    });
  };

  const toggleCaptain = (teamId, playerIdx) => {
    hapticFeedback(15);
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId].forEach((p, idx) => {
        p.isCaptain = idx === playerIdx;
      });
      return next;
    });
  };

  // Compute live preview of points in modal
  const teamTotals = useMemo(() => {
    return teams.reduce((acc, t) => {
      const roster = draft.teamData[t.id] || [];
      acc[t.id] = roster.reduce((sum, p) => sum + calcPts(p), 0);
      return acc;
    }, {});
  }, [draft, teams]);

  return h("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } },
    // Step 1: Match Setup Header
    h("div", { style: { background: "var(--ios-bg-secondary)", borderRadius: "var(--ios-radius-lg)", padding: "14px", border: "0.5px solid var(--ios-separator)" } },
      h("div", { style: { fontSize: "12px", fontWeight: "700", color: "var(--ios-teal)", textTransform: "uppercase", marginBottom: "8px" } }, "1. Match Details"),
      h("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" } },
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", fontWeight: "600", display: "block", marginBottom: "4px" } }, "MATCH TITLE / FIXTURE"),
          h("input", {
            className: "ios-input",
            type: "text",
            value: draft.matchLabel || "",
            onChange: (e) => setDraft({ ...draft, matchLabel: e.target.value }),
            placeholder: "e.g. Match 1 - CSK vs MI",
            style: { width: "100%" }
          })
        ),
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", fontWeight: "600", display: "block", marginBottom: "4px" } }, "DATE"),
          h("input", {
            className: "ios-input",
            type: "date",
            value: draft.date || "",
            onChange: (e) => setDraft({ ...draft, date: e.target.value }),
            style: { width: "100%" }
          })
        ),
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--ios-text-secondary)", fontWeight: "600", display: "block", marginBottom: "4px" } }, "QUICK PRESET"),
          h("select", {
            className: "ios-input",
            style: { width: "100%" },
            onChange: (e) => {
              const fix = IPL_SCHEDULE_2027.find((m) => m.id === e.target.value);
              if (fix) {
                setDraft({
                  ...draft,
                  matchLabel: `${fix.team1} vs ${fix.team2}`,
                  date: fix.date,
                });
              }
            }
          },
            h("option", { value: "" }, "Select Fixture..."),
            IPL_SCHEDULE_2027.map((m) => h("option", { key: m.id, value: m.id }, `${m.team1} vs ${m.team2} (${m.date})`))
          )
        )
      )
    ),

    // Step 2: Fantasy Team Switcher Tabs with Live Totals
    h("div", { style: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" } },
      teams.map((t) => {
        const isSel = activeTeamId === t.id;
        const total = teamTotals[t.id] || 0;
        return h("button", {
          key: t.id,
          onClick: () => setActiveTeamId(t.id),
          style: {
            padding: "9px 16px",
            borderRadius: "var(--ios-radius-md)",
            border: isSel ? `1.5px solid ${t.color}` : "0.5px solid var(--ios-separator)",
            background: isSel ? `${t.color}22` : "var(--ios-bg-secondary)",
            color: isSel ? t.color : "var(--ios-text-secondary)",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }
        },
          h("span", { style: { width: "8px", height: "8px", borderRadius: "50%", background: t.color } }),
          `${t.name}: `,
          h("span", { style: { color: "#fff", fontWeight: "800" } }, `${total} pts`)
        );
      })
    ),

    // Step 3: Player Selection Roster & Stats Grid for Active Team
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        h("div", { style: { fontSize: "12px", fontWeight: "700", color: "var(--ios-orange)", textTransform: "uppercase" } },
          `2. ${teams.find((t) => t.id === activeTeamId)?.name} 5-Player Roster & Match Stats`
        ),
        h("span", { style: { fontSize: "11px", color: "var(--ios-text-secondary)" } },
          "💡 Type player name or pick from dropdown • Click ★ to set Captain (2×)"
        )
      ),

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
            gridTemplateColumns: "180px 1fr 1fr 1fr 1fr 1fr 50px 75px",
            gap: "8px",
            alignItems: "center",
          }
        },
          // Player Name & Captain Picker
          h("div", null,
            h("input", {
              className: "ios-input",
              list: `ipl-players-${activeTeamId}-${pIdx}`,
              type: "text",
              value: player.name || "",
              onChange: (e) => updatePlayerField(activeTeamId, pIdx, "name", e.target.value),
              placeholder: `Player ${pIdx + 1}`,
              style: { width: "100%", padding: "6px 8px", fontSize: "13px", fontWeight: "600" }
            }),
            h("datalist", { id: `ipl-players-${activeTeamId}-${pIdx}` },
              allIplPlayers.map((p, idx) => h("option", { key: idx, value: p.name }, `${p.teamCode} - ${p.role}`))
            ),
            h("button", {
              onClick: () => toggleCaptain(activeTeamId, pIdx),
              style: {
                background: "none", border: "none",
                color: player.isCaptain ? "var(--ios-yellow)" : "var(--ios-text-tertiary)",
                fontSize: "11px", fontWeight: "700", cursor: "pointer", marginTop: "4px", display: "block"
              }
            }, player.isCaptain ? "★ Captain (2× Multiplier)" : "☆ Set as Captain")
          ),
          h(IOSNumberInput, { label: "Runs (+5)", value: player.runs || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "runs", v) }),
          h(IOSNumberInput, { label: "Wkts (+100)", value: player.wkts || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "wkts", v) }),
          h(IOSNumberInput, { label: "Catches (+50)", value: player.catch || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "catch", v) }),
          h(IOSNumberInput, { label: "RO/St (+50)", value: (player.ro || 0) + (player.stmp || 0), onChange: (v) => updatePlayerField(activeTeamId, pIdx, "ro", v) }),
          h(IOSNumberInput, { label: "Sixes (Bonus)", value: player.b6s || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "b6s", v) }),
          h(IOSNumberInput, { label: "Duck (-50)", value: player.duck || 0, min: 0, max: 1, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "duck", v) }),
          h("div", { style: { textAlign: "right", fontWeight: "800", fontSize: "17px", color: player.isCaptain ? "var(--ios-yellow)" : "var(--ios-green)" } },
            `${pts} pts`
          )
        );
      })
    ),

    // Footer actions & Live Winner Preview
    h("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "0.5px solid var(--ios-separator)",
        paddingTop: "14px",
        marginTop: "10px",
      }
    },
      h("div", { style: { fontSize: "13px", color: "var(--ios-text-secondary)" } },
        "Match Total Points: ",
        Object.entries(teamTotals).map(([tId, pts]) => {
          const t = teams.find((tm) => tm.id === tId);
          return h("span", { key: tId, style: { color: t?.color || "#fff", fontWeight: "700", marginRight: "10px" } },
            `${t?.name}: ${pts}`
          );
        })
      ),
      h("div", { style: { display: "flex", gap: "10px" } },
        h(IOSButton, { variant: "ghost", onClick: onCancel }, "Cancel"),
        h(IOSButton, { variant: "primary", onClick: () => onSave(draft) }, "💾 Save Match Scorecard")
      )
    )
  );
}

// ─── REGISTER SERVICE WORKER & BOOTSTRAP ─────────────────────────────────────
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
const loadingEl = document.getElementById("loading");
if (loadingEl) loadingEl.style.display = "none";
