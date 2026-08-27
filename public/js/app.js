/**
 * D5 IPL Fantasy Platform — Titanium Slate Design (v3.0)
 * Clean, High-End Athletic Theme with Focused Harmonious Palette
 */

const { useState, useEffect, useRef, useMemo, createElement: h } = React;

const hapticFeedback = (pattern = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

// ─── REUSABLE CLEAN UI COMPONENTS ──────────────────────────────────────────

function AppButton({ onClick, children, variant = "primary", disabled = false, small = false, loading = false, style = {}, ariaLabel }) {
  const handleClick = (e) => {
    hapticFeedback(10);
    if (onClick) onClick(e);
  };
  return h("button", {
    onClick: handleClick,
    disabled: disabled || loading,
    className: `theme-btn theme-btn-${variant}`,
    "aria-label": ariaLabel,
    "aria-busy": loading,
    style: {
      padding: small ? "6px 14px" : "10px 20px",
      fontSize: small ? "12.5px" : "14px",
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

function AppCard({ children, style = {}, className = "", onClick, interactive = false }) {
  return h("div", {
    className: `theme-card ${interactive ? "theme-card-interactive" : ""} ${className}`,
    onClick: onClick ? (e) => { hapticFeedback(8); onClick(e); } : undefined,
    style: { cursor: onClick ? "pointer" : "default", ...style },
  }, children);
}

function AppModal({ isOpen, onClose, title, children, maxWidth = "900px" }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return h("div", {
    className: "theme-modal-backdrop",
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
    role: "dialog",
    "aria-modal": true,
  },
    h("div", { className: "theme-modal-sheet", style: { maxWidth } },
      h("div", { className: "theme-modal-header" },
        h("h2", { style: { fontSize: "17px", fontWeight: "700", color: "var(--text-primary)" } }, title),
        h("button", {
          onClick: onClose,
          style: {
            background: "rgba(255, 255, 255, 0.06)",
            border: "none",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            color: "var(--text-secondary)",
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

function AppNumberInput({ label, value, onChange, min = 0, max = 999 }) {
  return h("div", { style: { display: "flex", flexDirection: "column", gap: "3px" } },
    label && h("span", { style: { fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" } }, label),
    h("input", {
      className: "theme-input",
      type: "number",
      min,
      max,
      value,
      onChange: (e) => onChange(Number(e.target.value)),
      style: { textAlign: "center", padding: "6px 4px", fontSize: "13.5px", fontWeight: "700" }
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

  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column" } },
    // ── 1. Top Clean Navigation Header ────────────────────────────────────────
    h("header", {
      className: "theme-header-nav",
      style: { position: "sticky", top: 0, zIndex: 100, padding: "12px 20px" }
    },
      h("div", {
        style: {
          maxWidth: "1240px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }
      },
        // Brand Title
        h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
          h("div", {
            style: {
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
            }
          }, "🏏"),
          h("div", null,
            h("div", { style: { fontSize: "16px", fontWeight: "700", letterSpacing: "-0.3px", color: "#fff" } }, "D5 Fantasy League"),
            h("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: "500" } }, "IPL 2027 Season")
          )
        ),

        // Live Indicator Bar
        h("div", {
          onClick: () => setTab("live"),
          style: {
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-full)",
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12.5px",
            cursor: "pointer",
          }
        },
          h("span", { className: "pulse-dot" }),
          simActive
            ? h("span", { style: { color: "var(--accent-primary)", fontWeight: "600" } }, `${simScore.team1} ${simScore.r}/${simScore.w} (${simScore.o} ov)`)
            : h("span", { style: { color: "var(--text-secondary)" } }, "IPL 2027 Manual Match Suite")
        ),

        // Prominent Header Button
        h(AppButton, {
          variant: "primary",
          onClick: () => setEditingEntry(blankEntry(teams)),
        }, "➕ Enter Match Scorecard")
      )
    ),

    // ── 2. Main App Views ─────────────────────────────────────────────────────
    h("main", { style: { flex: 1, maxWidth: "1240px", width: "100%", margin: "0 auto", padding: "24px 20px" } },

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
          }
        },
          h("div", null,
            h("h1", { style: { fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" } }, "Match Scorecards"),
            h("p", { style: { fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "2px" } },
              "Select 5-player team rosters, set captains, and record match statistics."
            )
          ),
          h(AppButton, {
            variant: "primary",
            onClick: () => setEditingEntry(blankEntry(teams)),
          }, "➕ New Match Entry")
        ),

        // Grid of Matches
        entries.length > 0 ? h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" } },
          entries.map((entry) => {
            const mScore = standingsData.matchScores.find((m) => m.id === entry.id);
            const winner = teams.find((t) => t.id === mScore?.winnerId);
            return h(AppCard, {
              key: entry.id,
              interactive: true,
              onClick: () => setEditingEntry(entry),
            },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" } },
                h("div", null,
                  h("div", { style: { fontWeight: "700", fontSize: "16px", color: "#fff" } }, entry.matchLabel || "Match Scorecard"),
                  h("div", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" } }, fmtDate(entry.date))
                ),
                winner && h("span", { className: "badge-pill badge-winner" }, `🏆 ${winner.name}`)
              ),
              // Clean Score Grid
              h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "14px 0" } },
                teams.map((t) => {
                  const pts = mScore?.scores[t.id] || 0;
                  const netPts = mScore?.net[t.id] || 0;
                  const isWinner = t.id === winner?.id;
                  return h("div", {
                    key: t.id,
                    style: {
                      background: isWinner ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${isWinner ? "rgba(16, 185, 129, 0.3)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "10px 12px",
                    }
                  },
                    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                      h("span", { style: { fontWeight: "600", fontSize: "13px", color: isWinner ? "var(--accent-primary)" : "var(--text-secondary)" } }, t.name),
                      h("span", { style: { fontWeight: "700", fontSize: "15px", color: "#fff" } }, pts)
                    ),
                    h("div", { style: { fontSize: "11px", color: netPts >= 0 ? "var(--accent-primary)" : "var(--accent-rose)", marginTop: "3px", fontWeight: "600" } },
                      `Net: ${netPts >= 0 ? "+" : ""}${netPts}`
                    )
                  );
                })
              ),
              // Action Buttons
              h("div", {
                style: { display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" },
                onClick: (e) => e.stopPropagation()
              },
                h(AppButton, {
                  variant: "secondary", small: true,
                  onClick: () => setEditingEntry(entry)
                }, "✏️ Edit"),
                h(AppButton, {
                  variant: "danger", small: true,
                  onClick: () => handleDeleteScorecard(entry.id)
                }, "🗑️ Delete")
              )
            );
          })
        ) : h(AppCard, { style: { textAlign: "center", padding: "48px 20px" } },
          h("div", { style: { fontSize: "40px", marginBottom: "12px" } }, "🏏"),
          h("h3", { style: { fontSize: "18px", fontWeight: "700", marginBottom: "6px" } }, "No Matches Recorded Yet"),
          h("p", { style: { fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "20px" } },
            "Click below to manually set up your first match, select 5 players per team, and record scores."
          ),
          h(AppButton, {
            variant: "primary",
            onClick: () => setEditingEntry(blankEntry(teams)),
          }, "➕ Enter First Match")
        )
      ),

      // 🏆 View 2: Standings
      tab === "standings" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" } }, "League Leaderboard"),
            h("p", { style: { fontSize: "13px", color: "var(--text-secondary)" } }, "Dynamic net differential ranking for the 2027 season")
          ),
          h(AppButton, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "➕ Enter Match Scorecard")
        ),
        h(AppCard, { style: { padding: 0, overflow: "hidden" } },
          h("div", { style: { overflowX: "auto" } },
            h("table", { className: "theme-table" },
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
                  h("td", { style: { textAlign: "center", fontWeight: "700", color: idx === 0 ? "var(--accent-gold)" : "var(--text-muted)" } },
                    idx === 0 ? "👑 1" : `${idx + 1}`
                  ),
                  h("td", null,
                    h("div", { style: { fontWeight: "600", color: "#fff" } }, team.name),
                    h("div", { style: { fontSize: "11.5px", color: "var(--text-muted)" } }, `Avg: ${team.avgScore} pts`)
                  ),
                  h("td", { style: { textAlign: "center" } }, team.played),
                  h("td", { style: { textAlign: "center", fontWeight: "600", color: "var(--accent-primary)" } }, team.wins),
                  h("td", { style: { textAlign: "center", color: "var(--accent-secondary)" } }, team.bestMatch),
                  h("td", { style: { textAlign: "center", color: "var(--text-secondary)" } }, team.rawPointsTotal),
                  h("td", {
                    style: {
                      textAlign: "right",
                      paddingRight: "20px",
                      fontWeight: "700",
                      fontSize: "16px",
                      color: team.grandPoints >= 0 ? "var(--accent-primary)" : "var(--accent-rose)",
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
            h("h1", { style: { fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" } }, "Match Simulator & Schedule"),
            h("p", { style: { fontSize: "13px", color: "var(--text-secondary)" } }, "Interactive live game engine & tournament fixtures")
          ),
          h(AppButton, {
            variant: simActive ? "danger" : "primary",
            small: true,
            onClick: () => setSimActive(!simActive)
          }, simActive ? "⏹ Stop Simulator" : "▶ Start Live Game Sim")
        ),
        simActive && h(AppCard, { style: { marginBottom: "20px", background: "rgba(16, 185, 129, 0.06)", borderColor: "var(--accent-primary-border)" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } },
            h("span", { className: "badge-pill badge-live" }, "SIMULATING BALL-BY-BALL"),
            h("span", { style: { fontSize: "12px", color: "var(--accent-primary)", fontWeight: "600" } }, "Updates every 3s")
          ),
          h("div", { style: { display: "flex", justifyContent: "space-around", alignItems: "center", margin: "14px 0" } },
            h("div", { style: { textAlign: "center" } },
              h("div", { style: { fontSize: "18px", fontWeight: "700" } }, simScore.team1),
              h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, "Batting")
            ),
            h("div", { style: { textAlign: "center" } },
              h("div", { style: { fontSize: "32px", fontWeight: "800", color: "var(--accent-primary)" } }, `${simScore.r}/${simScore.w}`),
              h("div", { style: { fontSize: "12.5px", color: "var(--text-secondary)" } }, `Overs: ${simScore.o} • Target: ${simScore.target}`)
            ),
            h("div", { style: { textAlign: "center" } },
              h("div", { style: { fontSize: "18px", fontWeight: "700" } }, simScore.team2),
              h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, "Bowling")
            )
          )
        ),
        h("h2", { style: { fontSize: "18px", fontWeight: "700", marginBottom: "12px" } }, "IPL 2027 Schedule"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" } },
          IPL_SCHEDULE_2027.map((m) => h(AppCard, { key: m.id },
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } },
              h("span", { style: { fontSize: "12px", color: "var(--text-muted)" } }, `${fmtDate(m.date)} • ${m.time}`),
              h("span", { style: { fontSize: "11px", color: "var(--text-secondary)" } }, "Scheduled")
            ),
            h("div", { style: { fontWeight: "700", fontSize: "15px", margin: "6px 0" } }, `${m.team1} vs ${m.team2}`),
            h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, `📍 ${m.venue}`)
          ))
        )
      ),

      // 👥 View 4: Squads
      tab === "squads" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" } }, "Player Directory"),
            h("p", { style: { fontSize: "13px", color: "var(--text-secondary)" } }, "Official squads across all 10 franchises")
          ),
          h("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
            ["ALL", "BAT", "BOWL", "ALL-ROUND", "WK"].map((r) => h("button", {
              key: r,
              onClick: () => setSquadRoleFilter(r),
              style: {
                padding: "5px 12px", borderRadius: "var(--radius-full)",
                border: "none",
                background: squadRoleFilter === r ? "var(--accent-primary)" : "var(--bg-elevated)",
                color: squadRoleFilter === r ? "var(--text-inverse)" : "var(--text-secondary)",
                fontSize: "12px", fontWeight: "600", cursor: "pointer"
              }
            }, r))
          )
        ),
        h("div", { style: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "16px" } },
          Object.entries(IPL_TEAMS).map(([code, t]) => {
            const isSel = selSquadTeam === code;
            return h("button", {
              key: code,
              onClick: () => setSelSquadTeam(code),
              style: {
                padding: "7px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isSel ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                background: isSel ? "var(--accent-primary-dim)" : "var(--bg-elevated)",
                color: isSel ? "var(--accent-primary)" : "var(--text-secondary)",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                flexShrink: 0,
              }
            }, code);
          })
        ),
        h(AppCard, null,
          h("h2", { style: { fontSize: "18px", fontWeight: "700", marginBottom: "14px" } }, IPL_TEAMS[selSquadTeam]?.name),
          h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" } },
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
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }
              },
                h("div", { style: { fontWeight: "600", fontSize: "13.5px" } }, player.name),
                h("span", { style: { fontSize: "11px", color: "var(--accent-primary)", fontWeight: "700" } }, player.role)
              ))
          )
        )
      ),

      // 📜 View 5: 2025 Archive
      tab === "archive" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" } },
          h("div", null,
            h("h1", { style: { fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" } }, "2025 Season Archive"),
            h("p", { style: { fontSize: "13px", color: "var(--text-secondary)" } }, "47 historical match records")
          ),
          h("select", {
            className: "theme-input",
            value: histFilter,
            onChange: (e) => setHistFilter(e.target.value),
            style: { width: "160px" }
          },
            h("option", { value: "ALL" }, "All Teams"),
            Object.keys(D5_2025.grand || {}).map((t) => h("option", { key: t, value: t }, t))
          )
        ),
        h(AppCard, { style: { padding: 0, overflow: "hidden", marginBottom: "18px" } },
          h("div", { style: { overflowX: "auto" } },
            h("table", { className: "theme-table" },
              h("thead", null,
                h("tr", null,
                  h("th", { style: { width: "60px", textAlign: "center" } }, "RANK"),
                  h("th", null, "HISTORICAL TEAM"),
                  h("th", { style: { textAlign: "center" } }, "MATCHES"),
                  h("th", { style: { textAlign: "center" } }, "WINS"),
                  h("th", { style: { textAlign: "right", paddingRight: "20px" } }, "TOTAL POINTS")
                )
              ),
              h("tbody", null,
                Object.entries(D5_2025.grand || {}).sort((a, b) => b[1] - a[1]).map(([t, pts], i) => (
                  h("tr", { key: t },
                    h("td", { style: { textAlign: "center", fontWeight: "700", color: i === 0 ? "var(--accent-gold)" : "var(--text-muted)" } }, `${i + 1}`),
                    h("td", { style: { fontWeight: "600", color: "#fff" } }, t),
                    h("td", { style: { textAlign: "center" } }, D5_2025.matches.filter((m) => m.teams[t]).length),
                    h("td", { style: { textAlign: "center", fontWeight: "600", color: "var(--accent-primary)" } }, D5_2025.wins?.[t] || 0),
                    h("td", { style: { textAlign: "right", paddingRight: "20px", fontWeight: "700", color: "var(--accent-gold)" } }, pts)
                  )
                ))
              )
            )
          )
        )
      ),

      // 🎯 View 6: Rules
      tab === "rules" && h("div", null,
        h("h1", { style: { fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px", marginBottom: "18px" } }, "Scoring Rules & Net Differentials"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "20px" } },
          h(AppCard, null,
            h("h3", { style: { color: "var(--accent-primary)", fontSize: "16px", fontWeight: "700", marginBottom: "12px" } }, "⚡ Base Points"),
            [
              ["Run", "+5 pts / run"],
              ["Wicket", "+100 pts / wkt"],
              ["Catch", "+50 pts / catch"],
              ["Stumping", "+50 pts / st"],
              ["Run Out", "+50 / +100 pts"],
              ["Duck Penalty", "−50 pts"],
            ].map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" } },
              h("span", { style: { color: "var(--text-secondary)" } }, k),
              h("span", { style: { fontWeight: "700", color: k.includes("Duck") ? "var(--accent-rose)" : "#fff" } }, v)
            ))
          ),
          h(AppCard, null,
            h("h3", { style: { color: "var(--accent-gold)", fontSize: "16px", fontWeight: "700", marginBottom: "12px" } }, "⭐ Milestone Bonuses"),
            [
              ["Runs 30 – 49 / 50 – 99", "+50 / +150 pts"],
              ["Runs 100+ (Century)", "+250 pts"],
              ["2 Wkts / 3-4 Wkts / 5+ Wkts", "+50 / +150 / +200 pts"],
              ["3 Catches / 5 Catches", "+100 / +200 pts"],
              ["5 – 9 Sixes / 10+ Sixes", "+150 / +300 pts"],
              ["Maiden Over / Hat-trick", "+200 / +400 pts"],
            ].map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" } },
              h("span", { style: { color: "var(--text-secondary)" } }, k),
              h("span", { style: { fontWeight: "700", color: "var(--accent-gold)" } }, v)
            ))
          )
        ),
        h(AppCard, null,
          h("h3", { style: { color: "var(--accent-primary)", fontSize: "16px", fontWeight: "700", marginBottom: "8px" } }, "🌟 Captain & Differential Scoring"),
          h("p", { style: { fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "8px" } },
            "• Captain 2×: Designated captain receives double (2×) all base points and bonuses."
          ),
          h("p", { style: { fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.7" } },
            "• Net Differential: Winner gains the sum of point differences against all losing teams. Losers lose their exact difference against the winner."
          )
        )
      )
    ),

    // ── 3. Clean Floating Bottom Navigation Bar ───────────────────────────────
    h("nav", { className: "theme-bottom-nav" },
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
          className: `theme-nav-item ${isSel ? "active" : ""}`,
        },
          h("span", { style: { fontSize: "15px" } }, item.icon),
          h("span", null, item.label)
        );
      })
    ),

    // ── 4. Clean Manual Match & Player Selection Modal ────────────────────────
    editingEntry && h(AppModal, {
      isOpen: Boolean(editingEntry),
      onClose: () => setEditingEntry(null),
      title: "Match Scorecard & Player Roster Setup",
      maxWidth: "920px",
    },
      h(CleanManualMatchEditor, {
        entry: editingEntry,
        teams,
        onSave: handleSaveScorecard,
        onCancel: () => setEditingEntry(null),
      })
    )
  );
}

// ─── CLEAN MANUAL MATCH & PLAYER SELECTION SUITE ──────────────────────────────

function CleanManualMatchEditor({ entry, teams, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(entry)));
  const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id || "T1");

  const allIplPlayers = useMemo(() => {
    const list = [];
    Object.entries(IPL_SQUADS).forEach(([teamCode, squad]) => {
      squad.forEach((p) => list.push({ name: p.name, role: p.role, teamCode }));
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
    hapticFeedback(12);
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId].forEach((p, idx) => {
        p.isCaptain = idx === playerIdx;
      });
      return next;
    });
  };

  const teamTotals = useMemo(() => {
    return teams.reduce((acc, t) => {
      const roster = draft.teamData[t.id] || [];
      acc[t.id] = roster.reduce((sum, p) => sum + calcPts(p), 0);
      return acc;
    }, {});
  }, [draft, teams]);

  return h("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } },
    // Step 1: Match Setup
    h("div", { style: { background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: "14px", border: "1px solid var(--border-subtle)" } },
      h("div", { style: { fontSize: "11.5px", fontWeight: "700", color: "var(--accent-primary)", textTransform: "uppercase", marginBottom: "8px" } }, "1. Match Details"),
      h("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" } },
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "4px" } }, "MATCH TITLE"),
          h("input", {
            className: "theme-input",
            type: "text",
            value: draft.matchLabel || "",
            onChange: (e) => setDraft({ ...draft, matchLabel: e.target.value }),
            placeholder: "e.g. Match 1 - CSK vs MI",
            style: { width: "100%" }
          })
        ),
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "4px" } }, "DATE"),
          h("input", {
            className: "theme-input",
            type: "date",
            value: draft.date || "",
            onChange: (e) => setDraft({ ...draft, date: e.target.value }),
            style: { width: "100%" }
          })
        ),
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "4px" } }, "PRESET FIXTURE"),
          h("select", {
            className: "theme-input",
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
            IPL_SCHEDULE_2027.map((m) => h("option", { key: m.id, value: m.id }, `${m.team1} vs ${m.team2}`))
          )
        )
      )
    ),

    // Step 2: Team Tabs
    h("div", { style: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" } },
      teams.map((t) => {
        const isSel = activeTeamId === t.id;
        const total = teamTotals[t.id] || 0;
        return h("button", {
          key: t.id,
          onClick: () => setActiveTeamId(t.id),
          style: {
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${isSel ? "var(--accent-primary)" : "var(--border-subtle)"}`,
            background: isSel ? "var(--accent-primary-dim)" : "var(--bg-elevated)",
            color: isSel ? "var(--accent-primary)" : "var(--text-secondary)",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }
        },
          `${t.name}: `,
          h("span", { style: { color: "#fff", fontWeight: "800" } }, `${total} pts`)
        );
      })
    ),

    // Step 3: Roster & Stats Grid
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      (draft.teamData[activeTeamId] || []).map((player, pIdx) => {
        const pts = calcPts(player);
        return h("div", {
          key: player.id || pIdx,
          style: {
            background: "var(--bg-elevated)",
            border: `1px solid ${player.isCaptain ? "var(--accent-gold)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-md)",
            padding: "12px",
            display: "grid",
            gridTemplateColumns: "180px 1fr 1fr 1fr 1fr 1fr 50px 75px",
            gap: "8px",
            alignItems: "center",
          }
        },
          // Player Autocomplete & Captain
          h("div", null,
            h("input", {
              className: "theme-input",
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
                color: player.isCaptain ? "var(--accent-gold)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: "700", cursor: "pointer", marginTop: "4px", display: "block"
              }
            }, player.isCaptain ? "★ Captain (2×)" : "☆ Make Captain")
          ),
          h(AppNumberInput, { label: "Runs", value: player.runs || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "runs", v) }),
          h(AppNumberInput, { label: "Wkts", value: player.wkts || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "wkts", v) }),
          h(AppNumberInput, { label: "Catches", value: player.catch || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "catch", v) }),
          h(AppNumberInput, { label: "RO/St", value: (player.ro || 0) + (player.stmp || 0), onChange: (v) => updatePlayerField(activeTeamId, pIdx, "ro", v) }),
          h(AppNumberInput, { label: "Sixes", value: player.b6s || 0, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "b6s", v) }),
          h(AppNumberInput, { label: "Duck", value: player.duck || 0, min: 0, max: 1, onChange: (v) => updatePlayerField(activeTeamId, pIdx, "duck", v) }),
          h("div", { style: { textAlign: "right", fontWeight: "800", fontSize: "16px", color: player.isCaptain ? "var(--accent-gold)" : "var(--accent-primary)" } },
            `${pts} pts`
          )
        );
      })
    ),

    // Footer actions
    h("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "14px",
        marginTop: "10px",
      }
    },
      h("div", { style: { fontSize: "13px", color: "var(--text-secondary)" } },
        "Match Total: ",
        Object.entries(teamTotals).map(([tId, pts]) => {
          const t = teams.find((tm) => tm.id === tId);
          return h("span", { key: tId, style: { fontWeight: "700", marginRight: "12px", color: "#fff" } },
            `${t?.name}: ${pts}`
          );
        })
      ),
      h("div", { style: { display: "flex", gap: "10px" } },
        h(AppButton, { variant: "secondary", onClick: onCancel }, "Cancel"),
        h(AppButton, { variant: "primary", onClick: () => onSave(draft) }, "💾 Save Scorecard")
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
