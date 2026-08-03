import { useState, useEffect } from "react";
import { Radio, RefreshCw, LogOut, Minus, Plus } from "lucide-react";
import { C, uid } from "./theme.jsx";
import { Panel, TextInput, IconBtn, SubHeading } from "./ui.jsx";

function generateGameCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function emptyStats() {
  return {
    kills: 0, digs: 0, assists: 0, aces: 0, blocks: 0, svcErrors: 0,
    hitAttempts: 0, hitErrors: 0,
    inRotation: false,
  };
}

const STAT_LABELS = {
  kills: "KILLS",
  digs: "DIGS",
  assists: "AST",
  aces: "ACES",
  blocks: "BLOCKS",
  svcErrors: "SVC ERR",
};

function formatHitPct(attempts, errors) {
  if (attempts === 0) return ".000";
  const pct = (attempts - errors) / attempts;
  return pct >= 0 ? `.${Math.round(pct * 1000).toString().padStart(3, "0")}` : `-.${Math.abs(Math.round(pct * 1000)).toString().padStart(3, "0")}`;
}

async function fetchGame(code) {
  const res = await fetch(`/api/game?code=${encodeURIComponent(code)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Sync failed (${res.status})`);
  const data = await res.json();
  return data.game;
}

async function saveGameRemote(code, game) {
  const res = await fetch(`/api/game?code=${encodeURIComponent(code)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
  if (!res.ok) throw new Error(`Sync failed (${res.status})`);
}

const miniBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6,
  border: `1px solid ${C.line}`, background: "transparent", color: C.chalkDim, cursor: "pointer", padding: 0,
};

function statBtnStyle(accent) {
  return {
    padding: "7px 11px", borderRadius: 7, border: `1px solid ${accent}`, background: "transparent",
    color: accent, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer",
  };
}

export function LiveGameTab({ players }) {
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [game, setGame] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [status, setStatus] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const [myLabel, setMyLabel] = useState("Coach");
  const [messageDraft, setMessageDraft] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const saveGame = async (nextGame, c) => {
    try {
      await saveGameRemote(c || code, nextGame);
    } catch (e) {
      setStatus("Couldn't sync that update — check your connection.");
    }
  };

  const pullGame = async (c) => {
    try {
      const remote = await fetchGame(c);
      if (remote) {
        setGame(remote);
        setLastSynced(new Date());
      }
    } catch (e) {
      /* transient network hiccup while polling — ignore */
    }
  };

  const startNewGame = async () => {
    const source = players.some((p) => p.present) ? players.filter((p) => p.present) : players;
    const c = generateGameCode();
    const initial = {
      teamName: "Us",
      opponentName: "Opponent",
      currentSet: 1,
      sets: [{ us: 0, opp: 0 }],
      setsWon: { us: 0, opp: 0 },
      players: source.map((p) => ({ id: p.id, name: p.name, ...emptyStats() })),
      messages: [],
      updatedAt: Date.now(),
    };
    setStatus("");
    setCode(c);
    setGame(initial);
    setSelectedPlayerId(initial.players[0] ? initial.players[0].id : null);
    await saveGame(initial, c);
  };

  const joinGame = async () => {
    const c = codeInput.trim().toUpperCase();
    if (!c) return;
    setStatus("Joining…");
    try {
      const remote = await fetchGame(c);
      if (remote) {
        if (!remote.messages) remote.messages = [];
        if (!remote.sets) remote.sets = [{ us: 0, opp: 0 }];
        if (!remote.setsWon) remote.setsWon = { us: 0, opp: 0 };
        setCode(c);
        setGame(remote);
        setSelectedPlayerId(remote.players[0] ? remote.players[0].id : null);
        setLastSynced(new Date());
        setStatus("");
      } else {
        setStatus("Game not found — double-check the code.");
      }
    } catch (e) {
      setStatus("Couldn't reach the game — check your connection and try again.");
    }
  };

  const leaveGame = () => {
    setCode("");
    setGame(null);
    setSelectedPlayerId(null);
    setStatus("");
  };

  useEffect(() => {
    if (!code) return undefined;
    const id = setInterval(() => pullGame(code), 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const updateGame = (fn) => {
    setGame((g) => {
      const next = { ...fn(g), updatedAt: Date.now() };
      saveGame(next);
      return next;
    });
  };

  const addTeamPoint = () => {
    updateGame((g) => {
      const sets = [...g.sets];
      const current = { ...sets[g.currentSet - 1] };
      current.us += 1;
      sets[g.currentSet - 1] = current;

      // Check for set win
      const target = g.currentSet === 5 ? 15 : 25;
      const setsWon = { ...g.setsWon };
      let nextSet = g.currentSet;
      if (current.us >= target && current.us - current.opp >= 2) {
        setsWon.us += 1;
        if (setsWon.us < 3 && setsWon.opp < 3) {
          nextSet = g.currentSet + 1;
          sets.push({ us: 0, opp: 0 });
        }
      }
      return { ...g, sets, setsWon, currentSet: nextSet };
    });
  };

  const addOppPoint = () => {
    updateGame((g) => {
      const sets = [...g.sets];
      const current = { ...sets[g.currentSet - 1] };
      current.opp += 1;
      sets[g.currentSet - 1] = current;

      const target = g.currentSet === 5 ? 15 : 25;
      const setsWon = { ...g.setsWon };
      let nextSet = g.currentSet;
      if (current.opp >= target && current.opp - current.us >= 2) {
        setsWon.opp += 1;
        if (setsWon.us < 3 && setsWon.opp < 3) {
          nextSet = g.currentSet + 1;
          sets.push({ us: 0, opp: 0 });
        }
      }
      return { ...g, sets, setsWon, currentSet: nextSet };
    });
  };

  const undoPoint = (team) => {
    updateGame((g) => {
      const sets = [...g.sets];
      const current = { ...sets[g.currentSet - 1] };
      if (team === "us") current.us = Math.max(0, current.us - 1);
      else current.opp = Math.max(0, current.opp - 1);
      sets[g.currentSet - 1] = current;
      return { ...g, sets };
    });
  };

  const bumpStat = (playerId, key, delta) => {
    updateGame((g) => ({
      ...g,
      players: g.players.map((p) => (p.id === playerId ? { ...p, [key]: Math.max(0, (p[key] || 0) + delta) } : p)),
    }));
  };

  const logHit = (playerId, result) => {
    updateGame((g) => ({
      ...g,
      players: g.players.map((p) => {
        if (p.id !== playerId) return p;
        if (result === "kill") return { ...p, kills: p.kills + 1, hitAttempts: p.hitAttempts + 1 };
        if (result === "error") return { ...p, hitErrors: p.hitErrors + 1, hitAttempts: p.hitAttempts + 1 };
        if (result === "attempt") return { ...p, hitAttempts: p.hitAttempts + 1 };
        return p;
      }),
    }));
  };

  const toggleRotation = (playerId) => {
    updateGame((g) => ({
      ...g,
      players: g.players.map((p) => (p.id === playerId ? { ...p, inRotation: !p.inRotation } : p)),
    }));
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    updateGame((g) => ({
      ...g,
      messages: [...(g.messages || []), { id: uid(), text: text.trim(), from: myLabel || "Coach", time: Date.now() }].slice(-30),
    }));
    setMessageDraft("");
  };

  const subtitle = code ? `Game code ${code} · shared with your assistant coach` : "Track score and player stats, synced across coaches' tablets";
  const selectedPlayer = game ? game.players.find((p) => p.id === selectedPlayerId) : null;
  const currentScore = game && game.sets[game.currentSet - 1] ? game.sets[game.currentSet - 1] : { us: 0, opp: 0 };
  const matchOver = game && (game.setsWon.us >= 3 || game.setsWon.opp >= 3);

  return (
    <Panel icon={Radio} title="Live Match" subtitle={subtitle}>
      {!code || !game ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <button
              onClick={startNewGame}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "10px 14px",
                borderRadius: 8, border: "none", background: C.amber, color: C.amberInk, fontFamily: "'Inter', sans-serif",
                fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              }}
            >
              <Radio size={15} /> Start a new match
            </button>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.chalkDim, margin: "8px 0 0" }}>
              Creates a game code. Share it with your assistant coach so their tablet syncs to this same match.
            </p>
          </div>

          <div style={{ borderTop: `1px dashed ${C.line}`, paddingTop: 16 }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: C.sage,
                textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px",
              }}
            >
              Already have a code?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <TextInput value={codeInput} onChange={(v) => setCodeInput(v.toUpperCase())} placeholder="Enter game code" onEnter={joinGame} />
              <button
                onClick={joinGame}
                style={{
                  padding: "0 16px", borderRadius: 7, border: `1px solid ${C.amberDim}`, background: "transparent", color: C.amber,
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                Join
              </button>
            </div>
          </div>

          {status && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: status.includes("Couldn't") || status.includes("not found") ? C.red : C.chalkDim }}>
              {status}
            </p>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: C.chalkFaint }}>
            Anyone with the game code can view and update this match's score and stats — great for you and an assistant coach, just don't post the code publicly.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.amber, letterSpacing: "0.05em" }}>
                CODE {code}
              </span>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: C.chalkFaint }}>
                {lastSynced ? `Synced ${lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Not yet synced"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <IconBtn onClick={() => pullGame(code)}><RefreshCw size={14} /></IconBtn>
              <IconBtn onClick={leaveGame} danger><LogOut size={14} /></IconBtn>
            </div>
          </div>

          {status && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.red, margin: "0 0 12px" }}>
              {status}
            </p>
          )}

          {/* Set history */}
          {game.sets.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {game.sets.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 11, color: i + 1 === game.currentSet ? C.amber : C.chalkFaint,
                    background: i + 1 === game.currentSet ? "rgba(224,135,44,0.14)" : "transparent",
                    border: `1px solid ${i + 1 === game.currentSet ? C.amberDim : C.line}`, borderRadius: 5, padding: "3px 8px",
                  }}
                >
                  S{i + 1}: {s.us}-{s.opp}
                </span>
              ))}
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.sage }}>
                ({game.setsWon.us}-{game.setsWon.opp})
              </span>
            </div>
          )}

          {/* Scoreboard */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10, background: C.bg2, border: `1px solid ${C.line}`,
              borderRadius: 10, padding: "16px 10px", marginBottom: 16,
            }}
          >
            <div style={{ flex: 1, textAlign: "center" }}>
              <input
                value={game.teamName}
                onChange={(e) => updateGame((g) => ({ ...g, teamName: e.target.value }))}
                style={{
                  width: "100%", textAlign: "center", background: "transparent", border: "none", outline: "none",
                  color: C.chalk, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, marginBottom: 2,
                }}
              />
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 38, fontWeight: 700, color: C.amber, lineHeight: 1 }}>
                {currentScore.us}
              </div>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8 }}>
                <button
                  onClick={addTeamPoint}
                  disabled={matchOver}
                  style={{
                    width: 40, height: 28, borderRadius: 6, border: `1px solid ${matchOver ? C.line : C.amberDim}`,
                    background: matchOver ? C.panel3 : "rgba(224,135,44,0.14)", color: matchOver ? C.chalkFaint : C.amber,
                    fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, cursor: matchOver ? "not-allowed" : "pointer",
                  }}
                >
                  +1
                </button>
                <button onClick={() => undoPoint("us")} style={{ width: 26, height: 28, borderRadius: 6, border: `1px solid ${C.line}`, background: "transparent", color: C.chalkDim, cursor: "pointer" }}>
                  <Minus size={12} style={{ margin: "0 auto" }} />
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: C.chalkFaint }}>SET {game.currentSet}</span>
              {matchOver && (
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, color: C.sage, marginTop: 2 }}>FINAL</div>
              )}
            </div>

            <div style={{ flex: 1, textAlign: "center" }}>
              <input
                value={game.opponentName}
                onChange={(e) => updateGame((g) => ({ ...g, opponentName: e.target.value }))}
                style={{
                  width: "100%", textAlign: "center", background: "transparent", border: "none", outline: "none",
                  color: C.chalk, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, marginBottom: 2,
                }}
              />
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 38, fontWeight: 700, color: C.chalk, lineHeight: 1 }}>
                {currentScore.opp}
              </div>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8 }}>
                <button
                  onClick={addOppPoint}
                  disabled={matchOver}
                  style={{
                    width: 40, height: 28, borderRadius: 6, border: `1px solid ${matchOver ? C.line : C.line}`,
                    background: matchOver ? C.panel3 : C.panel3, color: matchOver ? C.chalkFaint : C.chalk,
                    fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, cursor: matchOver ? "not-allowed" : "pointer",
                  }}
                >
                  +1
                </button>
                <button onClick={() => undoPoint("opp")} style={{ width: 26, height: 28, borderRadius: 6, border: `1px solid ${C.line}`, background: "transparent", color: C.chalkDim, cursor: "pointer" }}>
                  <Minus size={12} style={{ margin: "0 auto" }} />
                </button>
              </div>
            </div>
          </div>

          {/* Coach comms */}
          <div style={{ marginBottom: 16 }}>
            <SubHeading>Coach comms</SubHeading>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.chalkDim, flexShrink: 0 }}>Sending as</span>
              <input
                value={myLabel}
                onChange={(e) => setMyLabel(e.target.value)}
                placeholder="Coach"
                style={{
                  flex: 1, maxWidth: 140, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "5px 9px",
                  color: C.chalk, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {["Timeout!", "Sub now", "Rotation check", "Nice serve", "Good read"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => sendMessage(preset)}
                  style={{
                    padding: "6px 10px", borderRadius: 999, border: `1px solid ${C.amberDim}`, background: "rgba(224,135,44,0.1)",
                    color: C.amber, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11.5, cursor: "pointer",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <TextInput value={messageDraft} onChange={setMessageDraft} placeholder="Type a quick message…" onEnter={() => sendMessage(messageDraft)} />
              <button
                onClick={() => sendMessage(messageDraft)}
                style={{
                  padding: "0 14px", borderRadius: 7, border: "none", background: C.amber, color: C.amberInk,
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>

            {(game.messages || []).length === 0 ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.chalkFaint, fontStyle: "italic" }}>
                No messages yet — send one and it'll show up on the other coach's tablet within a few seconds.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {(game.messages || []).slice().reverse().map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: "7px 10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, color: C.sage }}>{m.from}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.chalkFaint }}>
                        {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.chalk }}>{m.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {game.players.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.chalkFaint, fontStyle: "italic" }}>
              No players in this match — mark players Present in Attendance before starting your next match.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 2 }}>
                {game.players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 12px", borderRadius: 999, border: `1px solid ${p.id === selectedPlayerId ? C.amber : C.line}`,
                      background: p.id === selectedPlayerId ? C.amber : "transparent", color: p.id === selectedPlayerId ? C.amberInk : C.chalkDim,
                      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    {p.inRotation && <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.id === selectedPlayerId ? C.amberInk : C.sage, flexShrink: 0 }} />}
                    {p.name}
                  </button>
                ))}
              </div>

              {selectedPlayer && (
                <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, color: C.chalk, letterSpacing: "0.02em" }}>
                      {selectedPlayer.name}
                    </span>
                    <button
                      onClick={() => toggleRotation(selectedPlayer.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999,
                        border: `1px solid ${selectedPlayer.inRotation ? C.sage : C.line}`,
                        background: selectedPlayer.inRotation ? "rgba(121,160,122,0.16)" : "transparent",
                        color: selectedPlayer.inRotation ? C.sage : C.chalkDim,
                        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer",
                      }}
                    >
                      {selectedPlayer.inRotation ? "IN ROTATION" : "ON BENCH"}
                    </button>
                  </div>

                  <SubHeading>Hitting</SubHeading>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <button onClick={() => logHit(selectedPlayer.id, "kill")} style={statBtnStyle(C.sage)}>Kill</button>
                    <button onClick={() => logHit(selectedPlayer.id, "error")} style={statBtnStyle(C.red)}>Hit Error</button>
                    <button onClick={() => logHit(selectedPlayer.id, "attempt")} style={statBtnStyle(C.chalkDim)}>Attempt</button>
                  </div>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.chalkDim, margin: "0 0 14px" }}>
                    Hit% {formatHitPct(selectedPlayer.hitAttempts, selectedPlayer.hitErrors)} · {selectedPlayer.hitAttempts - selectedPlayer.hitErrors}/{selectedPlayer.hitAttempts}
                  </p>

                  <SubHeading>Stats</SubHeading>
                  <div className="np-stat-grid">
                    {Object.keys(STAT_LABELS).map((key) => (
                      <div key={key} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700, color: C.chalkDim, marginBottom: 4 }}>
                          {STAT_LABELS[key]}
                        </div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: C.chalk, fontWeight: 700, marginBottom: 6 }}>
                          {selectedPlayer[key] || 0}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                          <button onClick={() => bumpStat(selectedPlayer.id, key, -1)} style={miniBtnStyle}><Minus size={11} /></button>
                          <button onClick={() => bumpStat(selectedPlayer.id, key, 1)} style={miniBtnStyle}><Plus size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Panel>
  );
}