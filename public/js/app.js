/**
 * Production Frontend Application Core
 * D5 IPL Fantasy Platform
 * High-performance React 18 UI with Zero-Runtime-Babel overhead
 */

const { useState, useEffect, useRef, useMemo, createElement: h } = React;

// ─── UI PRIMITIVES & DESIGN SYSTEM COMPONENTS ─────────────────────────────────

function Btn({ onClick, children, variant = "primary", disabled = false, small = false, style = {} }) {
  const baseStyle = {
    padding: small ? "6px 14px" : "10px 22px",
    borderRadius: "24px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-heading)",
    fontSize: small ? "13px" : "15px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    transition: "all 0.2s ease",
    border: "none",
    opacity: disabled ? 0.45 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    outline: "none",
  };

  const variants = {
    primary: { background: "linear-gradient(135deg, #d11a2a, #ff2d3d)", color: "#fff", boxShadow: "0 4px 14px rgba(209,26,42,0.35)" },
    danger: { background: "rgba(209,26,42,0.15)", color: "#ff5e6d", border: "1px solid rgba(209,26,42,0.3)" },
    ghost: { background: "var(--bg-surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" },
    success: { background: "linear-gradient(135deg, #00c853, #69f0ae)", color: "#000", boxShadow: "0 4px 14px rgba(0,200,83,0.3)" },
    warning: { background: "linear-gradient(135deg, #ffb830, #ffd54f)", color: "#000", boxShadow: "0 4px 12px rgba(255,184,48,0.3)" },
    cyan: { background: "linear-gradient(135deg, #00c9ff, #92fe9d)", color: "#000", boxShadow: "0 4px 12px rgba(0,201,255,0.3)" },
  };

  return h("button", {
    onClick,
    disabled,
    style: { ...baseStyle, ...(variants[variant] || variants.primary), ...style },
  }, children);
}

function Card({ children, style = {}, className = "" }) {
  return h("div", {
    className: `card-glass animate-fade-in ${className}`,
    style: { padding: "20px", ...style },
  }, children);
}

function LiveBadge() {
  return h("span", { className: "badge-live" },
    h("span", { className: "badge-live-dot" }),
    "LIVE"
  );
}

function StatusBadge({ status, daysUntil }) {
  if (status === "live") return h(LiveBadge);
  if (status === "completed") {
    return h("span", {
      style: { padding: "3px 10px", borderRadius: "12px", background: "rgba(168,255,62,0.12)", color: "#a8ff3e", fontSize: "11px", border: "1px solid rgba(168,255,62,0.3)", fontWeight: "600" }
    }, "✓ Done");
  }
  if (daysUntil === 0) {
    return h("span", {
      style: { padding: "3px 10px", borderRadius: "12px", background: "rgba(255,184,48,0.15)", color: "#ffb830", fontSize: "11px", border: "1px solid rgba(255,184,48,0.3)", fontWeight: "600" }
    }, "Today");
  }
  if (daysUntil === 1) {
    return h("span", {
      style: { padding: "3px 10px", borderRadius: "12px", background: "rgba(0,201,255,0.15)", color: "#00c9ff", fontSize: "11px", border: "1px solid rgba(0,201,255,0.3)", fontWeight: "600" }
    }, "Tomorrow");
  }
  return h("span", {
    style: { padding: "3px 10px", borderRadius: "12px", background: "var(--bg-surface-elevated)", color: "var(--text-muted)", fontSize: "11px", border: "1px solid var(--border-subtle)" }
  }, `In ${daysUntil}d`);
}

function TeamChip({ code, large = false }) {
  const t = IPL_TEAMS[code] || { name: code, color: "#888" };
  const size = large ? 54 : 38;
  return h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" } },
    h("div", {
      style: {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `${t.color}22`,
        border: `2px solid ${t.color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-heading)",
        fontSize: large ? "17px" : "13px",
        color: t.color,
        boxShadow: `0 2px 10px ${t.color}33`,
      }
    }, code),
    large && h("span", { style: { fontSize: "11px", color: "var(--text-secondary)", textAlign: "center", maxWidth: "80px", lineHeight: "1.2" } }, t.name)
  );
}

// ─── MAIN APPLICATION COMPONENT ───────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState("leaderboard");
  const [teams, setTeams] = useState(DEFAULT_2026_TEAMS);
  const [entries, setEntries] = useState([]);
  const [isEditor, setIsEditor] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminError, setAdminError] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);

  // Live Scores State
  const [liveScores, setLiveScores] = useState({});
  const [liveLoading, setLiveLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // 2025 History Filters
  const [histTeamFilter, setHistTeamFilter] = useState("ALL");
  const [selHistMatch, setSelHistMatch] = useState(null);

  // ── Firebase & Realtime Sync ───────────────────────────────────────────────
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

  // ── Live Cricket Data Polling ──────────────────────────────────────────────
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
      console.warn("Live score update fallback:", err.message);
    } finally {
      setLiveLoading(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
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

  // ── Differential Scoring & Standings Calculations ──────────────────────────
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

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSaveEntry = (entry) => {
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

  const handleDeleteEntry = (id) => {
    if (confirm("Are you sure you want to delete this match scorecard?")) {
      if (window.db) {
        window.db.ref(`d5_2026_entries/${id}`).remove();
      } else {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  // ── Render Views ────────────────────────────────────────────────────────────
  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column" } },
    // Top Navigation Header
    h("header", {
      style: {
        background: "rgba(20,23,33,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "12px 24px",
      }
    },
      h("div", {
        style: {
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }
      },
        // Brand Title
        h("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
          h("div", {
            style: {
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #d11a2a, #ff2d3d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 12px rgba(209,26,42,0.4)",
            }
          }, "🏏"),
          h("div", null,
            h("div", { style: { fontFamily: "var(--font-heading)", fontSize: "24px", letterSpacing: "2px", lineHeight: "1" } }, "D5 IPL FANTASY"),
            h("div", { style: { fontSize: "10px", color: "var(--text-muted)", letterSpacing: "1.5px", textTransform: "uppercase" } }, "Official League Platform 2026")
          )
        ),
        // Tabs
        h("nav", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
          [
            { id: "leaderboard", label: "🏆 Standings" },
            { id: "matches", label: "📋 Match Scorecards" },
            { id: "live", label: "📡 Live & Fixtures" },
            { id: "archive", label: "📜 2025 History" },
            { id: "rules", label: "🎯 Rules & Scoring" },
          ].map((t) => h("button", {
            key: t.id,
            onClick: () => setTab(t.id),
            style: {
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: tab === t.id ? "linear-gradient(135deg, #d11a2a, #ff2d3d)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--text-secondary)",
              fontFamily: "var(--font-heading)",
              fontSize: "14px",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }
          }, t.label))
        ),
        // Admin Lock
        h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
          isEditor
            ? h(Btn, { variant: "danger", small: true, onClick: () => setIsEditor(false) }, "🔓 Lock Editor")
            : h(Btn, { variant: "ghost", small: true, onClick: () => setShowAdminModal(true) }, "🔒 Admin Unlock")
        )
      )
    ),

    // Content Body
    h("main", { style: { flex: 1, maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "24px" } },
      // Tab 1: Leaderboard
      tab === "leaderboard" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px" } }, "🏆 Tournament Standings (2026)"),
            h("div", { style: { fontSize: "13px", color: "var(--text-muted)" } }, "Standings dynamically calculated via the D5 differential net scoring engine")
          ),
          isEditor && h(Btn, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "+ Add Match Scorecard")
        ),
        // Standings Table Card
        h(Card, { style: { marginBottom: "24px", padding: 0, overflow: "hidden" } },
          h("div", { className: "table-responsive" },
            h("table", null,
              h("thead", null,
                h("tr", null,
                  h("th", { style: { textAlign: "center", width: "70px" } }, "POS"),
                  h("th", null, "TEAM"),
                  h("th", { style: { textAlign: "center" } }, "MATCHES"),
                  h("th", { style: { textAlign: "center" } }, "WINS"),
                  h("th", { style: { textAlign: "center" } }, "BEST MATCH"),
                  h("th", { style: { textAlign: "center" } }, "RAW TOTAL"),
                  h("th", { style: { textAlign: "center", color: "var(--accent-amber)" } }, "NET GRAND POINTS")
                )
              ),
              h("tbody", null,
                standingsData.leaderboard.map((team, idx) => h("tr", { key: team.id },
                  h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: idx === 0 ? "var(--accent-amber)" : "var(--text-muted)" } },
                    idx === 0 ? "👑 1" : `#${idx + 1}`
                  ),
                  h("td", null,
                    h("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
                      h("div", {
                        style: {
                          width: "38px", height: "38px", borderRadius: "50%",
                          background: `${team.color}22`, border: `2px solid ${team.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-heading)", fontSize: "14px", color: team.color,
                        }
                      }, team.name.slice(0, 3).toUpperCase()),
                      h("div", null,
                        h("div", { style: { fontFamily: "var(--font-heading)", fontSize: "17px", color: "#fff" } }, team.name),
                        h("div", { style: { fontSize: "11px", color: "var(--text-muted)" } }, `Avg: ${team.avgScore} pts/match`)
                      )
                    )
                  ),
                  h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px" } }, team.played),
                  h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--accent-green)" } }, team.wins),
                  h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--accent-cyan)" } }, team.bestMatch),
                  h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--text-secondary)" } }, team.rawPointsTotal),
                  h("td", {
                    style: {
                      textAlign: "center",
                      fontFamily: "var(--font-heading)",
                      fontSize: "24px",
                      color: team.grandPoints >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                      fontWeight: "bold",
                    }
                  }, `${team.grandPoints >= 0 ? "+" : ""}${team.grandPoints}`)
                ))
              )
            )
          )
        ),
        // Empty State or Match Summary Cards
        entries.length === 0 && h(Card, { style: { textAlign: "center", padding: "40px" } },
          h("div", { style: { fontSize: "42px", marginBottom: "12px" } }, "🏏"),
          h("h3", { style: { fontSize: "20px", marginBottom: "8px" } }, "No 2026 Fantasy Matches Logged Yet"),
          h("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" } }, "Unlock Admin mode to submit the first match scorecard of the season!"),
          isEditor && h(Btn, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "+ Add First Match")
        )
      ),

      // Tab 2: Matches
      tab === "matches" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } },
          h("h1", { style: { fontSize: "28px" } }, "📋 2026 Season Match Scorecards"),
          isEditor && h(Btn, { variant: "primary", onClick: () => setEditingEntry(blankEntry(teams)) }, "+ New Match Scorecard")
        ),
        h("div", { className: "grid-responsive" },
          entries.map((entry) => {
            const mScore = standingsData.matchScores.find((m) => m.id === entry.id);
            const winner = teams.find((t) => t.id === mScore?.winnerId);
            return h(Card, { key: entry.id, style: { position: "relative" } },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" } },
                h("div", null,
                  h("div", { style: { fontFamily: "var(--font-heading)", fontSize: "18px", color: "#fff" } }, entry.matchLabel || "Match Scorecard"),
                  h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, fmtDate(entry.date))
                ),
                winner && h("span", {
                  style: { padding: "4px 10px", borderRadius: "12px", background: `${winner.color}22`, border: `1px solid ${winner.color}`, color: winner.color, fontFamily: "var(--font-heading)", fontSize: "12px" }
                }, `🏆 Winner: ${winner.name}`)
              ),
              // Team scores breakdown
              h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "14px 0" } },
                teams.map((t) => {
                  const pts = mScore?.scores[t.id] || 0;
                  const netPts = mScore?.net[t.id] || 0;
                  const isTop = t.id === winner?.id;
                  return h("div", {
                    key: t.id,
                    style: {
                      background: "var(--bg-surface-elevated)",
                      border: `1px solid ${isTop ? t.color : "var(--border-subtle)"}`,
                      borderRadius: "10px",
                      padding: "10px",
                    }
                  },
                    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                      h("span", { style: { color: t.color, fontFamily: "var(--font-heading)", fontSize: "14px" } }, t.name),
                      h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "18px", color: "#fff" } }, pts)
                    ),
                    h("div", { style: { fontSize: "11px", color: netPts >= 0 ? "var(--accent-green)" : "var(--accent-red)", marginTop: "4px" } },
                      `Net: ${netPts >= 0 ? "+" : ""}${netPts}`
                    )
                  );
                })
              ),
              // Admin controls
              isEditor && h("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" } },
                h(Btn, { variant: "ghost", small: true, onClick: () => setEditingEntry(entry) }, "✏️ Edit"),
                h(Btn, { variant: "danger", small: true, onClick: () => handleDeleteEntry(entry.id) }, "🗑️ Delete")
              )
            );
          })
        )
      ),

      // Tab 3: Live & Fixtures
      tab === "live" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px" } }, "📡 Live IPL Matches & Fixtures"),
            lastRefreshedAt && h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, `Last updated: ${lastRefreshedAt}`)
          ),
          h("div", { style: { display: "flex", gap: "8px" } },
            h(Btn, { variant: "warning", small: true, onClick: fetchLiveScores, disabled: liveLoading }, liveLoading ? "⏳ Loading..." : "🔄 Refresh Scores"),
            h(Btn, { variant: autoRefresh ? "danger" : "ghost", small: true, onClick: () => setAutoRefresh(!autoRefresh) }, autoRefresh ? "⏹ Stop Auto" : "▶ Auto 30s")
          )
        ),
        // Live matches list or empty card
        Object.keys(liveScores).length > 0 ? h("div", { className: "grid-responsive", style: { marginBottom: "28px" } },
          IPL_SCHEDULE.filter((m) => liveScores[m.id]).map((m) => {
            const sd = liveScores[m.id];
            return h(Card, { key: m.id, style: { borderColor: "var(--accent-red)" } },
              h(LiveBadge),
              h("div", { style: { display: "flex", justifyContent: "space-between", margin: "14px 0" } },
                h(TeamChip, { code: m.team1, large: true }),
                h("div", { style: { fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--text-muted)", alignSelf: "center" } }, "VS"),
                h(TeamChip, { code: m.team2, large: true })
              ),
              (sd.score || []).map((s, i) => h("div", { key: i, style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" } },
                h("span", { style: { fontSize: "12px", color: "var(--text-muted)" } }, s.inning),
                h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--accent-cyan)" } }, `${s.r}/${s.w} (${s.o} ov)`)
              )),
              sd.status && h("div", { style: { fontSize: "12px", color: "var(--accent-amber)", marginTop: "8px" } }, sd.status)
            );
          })
        ) : h(Card, { style: { textAlign: "center", padding: "32px", marginBottom: "28px" } },
          h("div", { style: { fontSize: "36px", marginBottom: "8px" } }, "🏏"),
          h("h3", { style: { fontSize: "20px", marginBottom: "6px" } }, "No Live Match Right Now"),
          h("p", { style: { fontSize: "13px", color: "var(--text-muted)" } }, "IPL 2026 tournament fixtures will update live when matches begin.")
        ),
        // Tournament Fixtures Schedule
        h("h2", { style: { fontSize: "22px", marginBottom: "14px" } }, "📅 Upcoming Tournament Fixtures"),
        h("div", { className: "grid-responsive" },
          IPL_SCHEDULE.map((m) => {
            const d = getDaysUntil(m.date);
            const isCompleted = d < 0;
            return h(Card, { key: m.id },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
                h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, `${fmtDate(m.date)} · ${m.time}`),
                h(StatusBadge, { status: isCompleted ? "completed" : "upcoming", daysUntil: d })
              ),
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" } },
                h(TeamChip, { code: m.team1 }),
                h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--text-muted)" } }, "VS"),
                h(TeamChip, { code: m.team2 })
              ),
              h("div", { style: { fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginTop: "8px" } },
                `📍 ${m.venue}`
              )
            );
          })
        )
      ),

      // Tab 4: 2025 Season Archive
      tab === "archive" && h("div", null,
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } },
          h("div", null,
            h("h1", { style: { fontSize: "28px" } }, "📜 2025 Historical Season Archive"),
            h("div", { style: { fontSize: "13px", color: "var(--text-muted)" } }, "Complete 47-match historical records and scorecards from 2025")
          ),
          h("select", {
            value: histTeamFilter,
            onChange: (e) => setHistTeamFilter(e.target.value),
            style: { width: "180px" }
          },
            h("option", { value: "ALL" }, "All Teams"),
            Object.keys(D5_2025.grand || {}).map((t) => h("option", { key: t, value: t }, t))
          )
        ),
        // 2025 Historical Standings Summary
        h(Card, { style: { marginBottom: "24px", padding: 0, overflow: "hidden" } },
          h("div", { className: "table-responsive" },
            h("table", null,
              h("thead", null,
                h("tr", null,
                  h("th", { style: { textAlign: "center", width: "70px" } }, "RANK"),
                  h("th", null, "HISTORICAL TEAM"),
                  h("th", { style: { textAlign: "center" } }, "MATCHES"),
                  h("th", { style: { textAlign: "center" } }, "WINS"),
                  h("th", { style: { textAlign: "center" } }, "WIN RATE"),
                  h("th", { style: { textAlign: "center", color: "var(--accent-amber)" } }, "TOTAL 2025 POINTS")
                )
              ),
              h("tbody", null,
                Object.entries(D5_2025.grand || {}).sort((a, b) => b[1] - a[1]).map(([t, pts], i) => {
                  const wins = D5_2025.wins?.[t] || 0;
                  const matchCount = D5_2025.matches.filter((m) => m.teams[t]).length;
                  const winRate = matchCount ? Math.round((wins / matchCount) * 100) : 0;
                  const cfg = D5_TEAM_CONFIG[t] || { color: "#888" };
                  return h("tr", { key: t },
                    h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: i === 0 ? "var(--accent-amber)" : "var(--text-muted)" } },
                      i === 0 ? "🏆 1" : `#${i + 1}`
                    ),
                    h("td", null,
                      h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                        h("span", { style: { width: "10px", height: "10px", borderRadius: "50%", background: cfg.color } }),
                        h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "17px", color: cfg.color } }, t)
                      )
                    ),
                    h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px" } }, matchCount),
                    h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--accent-green)" } }, wins),
                    h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--accent-cyan)" } }, `${winRate}%`),
                    h("td", { style: { textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "22px", color: "var(--accent-amber)" } }, pts)
                  );
                })
              )
            )
          )
        ),
        // Historical Matches Grid
        h("h2", { style: { fontSize: "22px", marginBottom: "14px" } }, "Match-by-Match History"),
        h("div", { className: "grid-responsive" },
          D5_2025.matches
            .filter((m) => histTeamFilter === "ALL" || m.teams[histTeamFilter])
            .map((m) => {
              const sorted = Object.entries(m.totals).sort((a, b) => b[1] - a[1]);
              const top = sorted[0];
              const topCfg = D5_TEAM_CONFIG[top?.[0]] || { color: "#888" };
              return h(Card, {
                key: m.id,
                onClick: () => setSelHistMatch(m),
                style: { cursor: "pointer", transition: "all 0.2s ease" }
              },
                h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
                  h("div", null,
                    h("div", { style: { fontFamily: "var(--font-heading)", fontSize: "16px" } }, m.sheet),
                    h("div", { style: { fontSize: "11px", color: "var(--text-muted)" } }, m.date)
                  ),
                  top && h("span", {
                    style: { padding: "2px 8px", borderRadius: "10px", background: `${topCfg.color}20`, color: topCfg.color, fontFamily: "var(--font-heading)", fontSize: "12px" }
                  }, `🏆 ${top[0]}`)
                ),
                h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
                  sorted.map(([t, pts]) => {
                    const cfg = D5_TEAM_CONFIG[t] || { color: "#888" };
                    return h("div", {
                      key: t,
                      style: { display: "flex", gap: "6px", alignItems: "center", padding: "4px 8px", borderRadius: "8px", background: `${cfg.color}15`, border: `1px solid ${cfg.color}33` }
                    },
                      h("span", { style: { color: cfg.color, fontFamily: "var(--font-heading)", fontSize: "12px" } }, t),
                      h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "16px", color: "#fff" } }, pts)
                    );
                  })
                )
              );
            })
        )
      ),

      // Tab 5: Rules & Scoring
      tab === "rules" && h("div", null,
        h("h1", { style: { fontSize: "28px", marginBottom: "18px" } }, "🎯 D5 Scoring Rules & Engine Architecture"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "20px" } },
          // Base Points
          h(Card, null,
            h("h3", { style: { color: "var(--accent-cyan)", fontSize: "18px", marginBottom: "12px" } }, "⚡ Base Scoring Points"),
            [
              ["Run", "+5 pts / run"],
              ["Wicket", "+100 pts / wkt"],
              ["Catch", "+50 pts / catch"],
              ["Stumping", "+50 pts / st"],
              ["Run Out", "+50 (half) / +100 (direct)"],
              ["Duck Penalty", "−50 pts"],
            ].map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" } },
              h("span", { style: { color: "var(--text-secondary)" } }, k),
              h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "17px", color: k.includes("Duck") ? "var(--accent-red)" : "#fff" } }, v)
            ))
          ),
          // Milestone Bonuses
          h(Card, null,
            h("h3", { style: { color: "var(--accent-amber)", fontSize: "18px", marginBottom: "12px" } }, "⭐ Milestone Bonuses"),
            [
              ["Runs 30 – 49", "+50 pts"],
              ["Runs 50 – 99 (Half-Century)", "+150 pts"],
              ["Runs 100+ (Century)", "+250 pts"],
              ["2 Wickets", "+50 pts"],
              ["3 – 4 Wickets", "+150 pts"],
              ["5+ Wickets (Fifer)", "+200 pts"],
              ["3 Catches", "+100 pts"],
              ["5 Catches", "+200 pts"],
              ["5 – 9 Sixes / 10+ Sixes", "+150 / +300 pts"],
              ["Maiden Over / Hat-trick", "+200 / +400 pts"],
            ].map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" } },
              h("span", { style: { color: "var(--text-secondary)" } }, k),
              h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--accent-amber)" } }, v)
            ))
          )
        ),
        // Captain Multiplier & Differential Scoring
        h(Card, { style: { borderColor: "rgba(168,255,62,0.3)" } },
          h("h3", { style: { color: "var(--accent-green)", fontSize: "18px", marginBottom: "8px" } }, "🌟 Captain & Differential Net League Scoring"),
          h("p", { style: { fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.8", marginBottom: "10px" } },
            "1. ", h("strong", { style: { color: "#fff" } }, "Captain 2× Multiplier: "),
            "The designated captain on each team earns double (2×) all base points and bonuses."
          ),
          h("p", { style: { fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.8" } },
            "2. ", h("strong", { style: { color: "#fff" } }, "Differential Net Points: "),
            "The match winner gains the sum of differences between their total score and all losing teams. Losers lose the exact point difference against the winner."
          )
        )
      )
    ),

    // Modal: Admin PIN Unlock
    showAdminModal && h("div", {
      style: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
      }
    },
      h(Card, { style: { maxWidth: "400px", width: "100%" } },
        h("h3", { style: { fontSize: "22px", marginBottom: "12px" } }, "🔒 Admin PIN Authentication"),
        h("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" } }, "Enter the league editor PIN to modify scores and teams."),
        h("input", {
          type: "password",
          value: adminPin,
          onChange: (e) => { setAdminPin(e.target.value); setAdminError(""); },
          placeholder: "Enter PIN (default: ipl)",
          style: { width: "100%", marginBottom: "12px" },
          autoFocus: true,
        }),
        adminError && h("div", { style: { color: "var(--accent-red)", fontSize: "12px", marginBottom: "12px" } }, adminError),
        h("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end" } },
          h(Btn, { variant: "ghost", small: true, onClick: () => { setShowAdminModal(false); setAdminPin(""); setAdminError(""); } }, "Cancel"),
          h(Btn, {
            variant: "primary", small: true,
            onClick: () => {
              if (adminPin === (window.EDITOR_PASSWORD || "ipl")) {
                setIsEditor(true);
                setShowAdminModal(false);
                setAdminPin("");
              } else {
                setAdminError("Invalid PIN / Password");
              }
            }
          }, "Unlock")
        )
      )
    ),

    // Modal: Match Scorecard Editor
    editingEntry && h(MatchEditorModal, {
      entry: editingEntry,
      teams,
      onSave: handleSaveEntry,
      onClose: () => setEditingEntry(null),
    }),

    // Modal: Historical 2025 Match Detail
    selHistMatch && h(HistoricalMatchModal, {
      match: selHistMatch,
      onClose: () => setSelHistMatch(null),
    })
  );
}

// ─── MATCH EDITOR MODAL COMPONENT ─────────────────────────────────────────────

function MatchEditorModal({ entry, teams, onSave, onClose }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(entry)));
  const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id || "T1");

  const updatePlayer = (teamId, playerIdx, field, val) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId][playerIdx][field] = val;
      return next;
    });
  };

  const setCaptain = (teamId, playerIdx) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.teamData[teamId].forEach((p, idx) => {
        p.isCaptain = idx === playerIdx;
      });
      return next;
    });
  };

  return h("div", {
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
    }
  },
    h(Card, { style: { maxWidth: "900px", width: "100%", maxHeight: "90vh", overflowY: "auto" } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" } },
        h("h2", { style: { fontSize: "24px" } }, "✏️ Edit Match Scorecard"),
        h("button", { onClick: onClose, style: { background: "none", border: "none", color: "#888", fontSize: "22px", cursor: "pointer" } }, "✕")
      ),
      // Match Header Form
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" } },
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" } }, "Match Label"),
          h("input", {
            type: "text",
            value: draft.matchLabel || "",
            onChange: (e) => setDraft({ ...draft, matchLabel: e.target.value }),
            placeholder: "e.g. Match 1 - CSK vs RCB",
            style: { width: "100%" }
          })
        ),
        h("div", null,
          h("label", { style: { fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" } }, "Match Date"),
          h("input", {
            type: "date",
            value: draft.date || "",
            onChange: (e) => setDraft({ ...draft, date: e.target.value }),
            style: { width: "100%" }
          })
        )
      ),
      // Team Tabs
      h("div", { style: { display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginBottom: "18px" } },
        teams.map((t) => h("button", {
          key: t.id,
          onClick: () => setActiveTeamId(t.id),
          style: {
            padding: "6px 14px",
            borderRadius: "16px",
            border: "none",
            background: activeTeamId === t.id ? t.color : "transparent",
            color: activeTeamId === t.id ? "#000" : t.color,
            fontFamily: "var(--font-heading)",
            fontSize: "14px",
            cursor: "pointer",
            fontWeight: "bold",
          }
        }, `${t.name} (${(draft.teamData[t.id] || []).reduce((s, p) => s + calcPts(p), 0)} pts)`))
      ),
      // Player score entry rows
      h("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" } },
        (draft.teamData[activeTeamId] || []).map((player, pIdx) => {
          const pts = calcPts(player);
          return h("div", {
            key: player.id || pIdx,
            style: {
              background: "var(--bg-surface-elevated)",
              border: `1px solid ${player.isCaptain ? "var(--accent-amber)" : "var(--border-subtle)"}`,
              borderRadius: "10px",
              padding: "12px",
              display: "grid",
              gridTemplateColumns: "140px 1fr 1fr 1fr 1fr 1fr 60px 80px",
              gap: "8px",
              alignItems: "center",
            }
          },
            h("div", null,
              h("input", {
                type: "text",
                value: player.name || "",
                onChange: (e) => updatePlayer(activeTeamId, pIdx, "name", e.target.value),
                placeholder: `Player ${pIdx + 1}`,
                style: { width: "100%" }
              }),
              h("button", {
                onClick: () => setCaptain(activeTeamId, pIdx),
                style: {
                  background: "none", border: "none",
                  color: player.isCaptain ? "var(--accent-amber)" : "#555",
                  fontSize: "11px", cursor: "pointer", marginTop: "4px", display: "block"
                }
              }, player.isCaptain ? "★ Captain (2×)" : "☆ Set Cap")
            ),
            h("div", null,
              h("label", { style: { fontSize: "9px", color: "#888", display: "block" } }, "RUNS"),
              h("input", { type: "number", value: player.runs || 0, onChange: (e) => updatePlayer(activeTeamId, pIdx, "runs", Number(e.target.value)), style: { width: "100%" } })
            ),
            h("div", null,
              h("label", { style: { fontSize: "9px", color: "#888", display: "block" } }, "WKTS"),
              h("input", { type: "number", value: player.wkts || 0, onChange: (e) => updatePlayer(activeTeamId, pIdx, "wkts", Number(e.target.value)), style: { width: "100%" } })
            ),
            h("div", null,
              h("label", { style: { fontSize: "9px", color: "#888", display: "block" } }, "CATCH"),
              h("input", { type: "number", value: player.catch || 0, onChange: (e) => updatePlayer(activeTeamId, pIdx, "catch", Number(e.target.value)), style: { width: "100%" } })
            ),
            h("div", null,
              h("label", { style: { fontSize: "9px", color: "#888", display: "block" } }, "RO/ST"),
              h("input", { type: "number", value: (player.ro || 0) + (player.stmp || 0), onChange: (e) => updatePlayer(activeTeamId, pIdx, "ro", Number(e.target.value)), style: { width: "100%" } })
            ),
            h("div", null,
              h("label", { style: { fontSize: "9px", color: "#888", display: "block" } }, "6s"),
              h("input", { type: "number", value: player.b6s || 0, onChange: (e) => updatePlayer(activeTeamId, pIdx, "b6s", Number(e.target.value)), style: { width: "100%" } })
            ),
            h("div", null,
              h("label", { style: { fontSize: "9px", color: "#888", display: "block" } }, "DUCK"),
              h("input", { type: "number", min: 0, max: 1, value: player.duck || 0, onChange: (e) => updatePlayer(activeTeamId, pIdx, "duck", Number(e.target.value)), style: { width: "100%" } })
            ),
            h("div", { style: { textAlign: "right", fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--accent-green)" } }, pts)
          );
        })
      ),
      // Footer actions
      h("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end" } },
        h(Btn, { variant: "ghost", onClick: onClose }, "Cancel"),
        h(Btn, { variant: "primary", onClick: () => onSave(draft) }, "💾 Save Scorecard")
      )
    )
  );
}

// ─── HISTORICAL 2025 MATCH DETAIL MODAL ───────────────────────────────────────

function HistoricalMatchModal({ match, onClose }) {
  const sorted = Object.entries(match.totals).sort((a, b) => b[1] - a[1]);
  return h("div", {
    style: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
    }
  },
    h(Card, { style: { maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto" } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" } },
        h("div", null,
          h("h2", { style: { fontSize: "24px" } }, `Match Scorecard: ${match.sheet}`),
          h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, `Date: ${match.date}`)
        ),
        h("button", { onClick: onClose, style: { background: "none", border: "none", color: "#888", fontSize: "22px", cursor: "pointer" } }, "✕")
      ),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" } },
        sorted.map(([tName, pts]) => {
          const cfg = D5_TEAM_CONFIG[tName] || { color: "#888" };
          const roster = match.teams[tName] || [];
          return h("div", {
            key: tName,
            style: { background: "var(--bg-surface-elevated)", border: `1px solid ${cfg.color}44`, borderRadius: "12px", padding: "14px" }
          },
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
              h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "18px", color: cfg.color } }, tName),
              h("span", { style: { fontFamily: "var(--font-heading)", fontSize: "20px", color: "#fff" } }, `${pts} pts`)
            ),
            roster.map((p, idx) => h("div", {
              key: idx,
              style: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }
            },
              h("span", { style: { color: p.cap ? "var(--accent-amber)" : "var(--text-secondary)" } },
                p.cap ? `★ ${p.n}` : p.n
              ),
              h("span", { style: { color: "var(--accent-cyan)", fontFamily: "var(--font-heading)", fontSize: "14px" } }, p.pts)
            ))
          );
        })
      )
    )
  );
}

// ─── INITIALIZE ROOT ──────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
const loadingEl = document.getElementById("loading");
if (loadingEl) loadingEl.style.display = "none";
