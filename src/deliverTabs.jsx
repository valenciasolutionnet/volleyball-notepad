import { useState, useRef, useEffect } from "react";
import {
  Plus, Trash2, ListOrdered, PersonStanding, Zap, Dumbbell, ChevronUp, ChevronDown,
  PenTool, MousePointer2, Circle, X as XIcon, ArrowUpRight, Eraser, RotateCcw, Edit3, Undo2,
  Play, Pause, SkipForward, Timer,
} from "lucide-react";
import { C, uid, DRILL_CATEGORIES, categoryAccent, createDiagram } from "./theme.jsx";
import { Panel, TabPill, IconBtn, TextInput } from "./ui.jsx";

/* ---------------------------------- Warm-Up ---------------------------------- */

function WarmupCategoryBadge({ category }) {
  const isStretch = category === "stretch";
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontWeight: 700,
        fontSize: 10.5, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 5, flexShrink: 0,
        color: isStretch ? C.sage : C.amber,
        background: isStretch ? "rgba(121,160,122,0.15)" : "rgba(224,135,44,0.15)",
      }}
    >
      {isStretch ? "STRETCH" : "EXERCISE"}
    </span>
  );
}

export function WarmupTab({ warmups, setWarmups, onAddToPlan }) {
  const [filter, setFilter] = useState("all");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("stretch");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addWarmup = () => {
    if (!name.trim()) return;
    setWarmups((ws) => [
      ...ws,
      { id: uid(), name: name.trim(), category, duration: Number(duration) || 0, description: description.trim() },
    ]);
    setName(""); setDuration(""); setDescription(""); setShowForm(false);
  };
  const removeWarmup = (id) => setWarmups((ws) => ws.filter((w) => w.id !== id));

  const visible = warmups.filter((w) => filter === "all" || w.category === filter);

  return (
    <Panel icon={PersonStanding} title="Warm-Up" subtitle="Stretching and light exercise to open every practice">
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <TabPill active={filter === "all"} onClick={() => setFilter("all")} icon={ListOrdered} label="All" />
        <TabPill active={filter === "stretch"} onClick={() => setFilter("stretch")} icon={PersonStanding} label="Stretch" />
        <TabPill active={filter === "exercise"} onClick={() => setFilter("exercise")} icon={Zap} label="Exercise" />
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7,
            border: `1px dashed ${C.line}`, background: "transparent", color: C.chalkDim,
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginBottom: 14,
          }}
        >
          <Plus size={14} strokeWidth={2.5} /> Add your own warm-up
        </button>
      ) : (
        <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextInput value={name} onChange={setName} placeholder="Warm-up name" />
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="min"
              style={{
                width: 56, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 7, padding: "9px 8px",
                color: C.chalk, fontFamily: "'Space Mono', monospace", fontSize: 13.5, outline: "none", textAlign: "center",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <TabPill active={category === "stretch"} onClick={() => setCategory("stretch")} icon={PersonStanding} label="Stretch" />
            <TabPill active={category === "exercise"} onClick={() => setCategory("exercise")} icon={Zap} label="Exercise" />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Quick description (optional)"
            rows={2}
            style={{
              width: "100%", resize: "vertical", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6,
              padding: "8px 9px", color: C.chalk, fontFamily: "'Inter', sans-serif", fontSize: 13, outline: "none",
              boxSizing: "border-box", marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addWarmup}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 7, border: "none", background: C.amber, color: C.amberInk,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              Save warm-up
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "9px 14px", borderRadius: 7, border: `1px solid ${C.line}`, background: "transparent",
                color: C.chalkDim, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.chalkFaint, fontStyle: "italic" }}>
          Nothing in this category yet.
        </p>
      ) : (
        <div className="np-drills-list">
          {visible.map((w) => (
            <div key={w.id} style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <WarmupCategoryBadge category={w.category} />
                {w.duration > 0 && (
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, color: C.chalkDim }}>
                    {w.duration}m
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: C.chalk, marginBottom: 4 }}>
                {w.name}
              </div>
              {w.description && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.chalkDim, margin: "0 0 10px" }}>
                  {w.description}
                </p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onAddToPlan(w.name, w.duration)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 6,
                    border: `1px solid ${C.amberDim}`, background: "transparent", color: C.amber,
                    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} /> Add to practice plan
                </button>
                <IconBtn onClick={() => removeWarmup(w.id)} danger>
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ---------------------------------- Drills ---------------------------------- */

function DrillArt({ category }) {
  if (category !== "hitting" && category !== "blocking" && category !== "defense") return null;
  const accent = category === "hitting" ? C.amber : category === "blocking" ? C.sage : C.red;
  return (
    <svg viewBox="0 0 120 70" style={{ width: 76, height: 44, flexShrink: 0, borderRadius: 6, background: C.bg }}>
      <rect x="4" y="4" width="112" height="62" fill="none" stroke={C.chalkFaint} strokeWidth="1.5" />
      <line x1="60" y1="4" x2="60" y2="66" stroke={C.chalkFaint} strokeWidth="2" />
      <line x1="38" y1="4" x2="38" y2="66" stroke={C.chalkFaint} strokeWidth="1" strokeDasharray="3 2" />
      <line x1="82" y1="4" x2="82" y2="66" stroke={C.chalkFaint} strokeWidth="1" strokeDasharray="3 2" />
      {category === "hitting" ? (
        <>
          <circle cx="30" cy="20" r="5" fill="none" stroke={C.amber} strokeWidth="2" />
          <line x1="30" y1="25" x2="30" y2="45" stroke={accent} strokeWidth="2" />
          <line x1="30" y1="30" x2="50" y2="20" stroke={C.amber} strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="55" cy="18" r="3" fill={C.amber} />
        </>
      ) : category === "blocking" ? (
        <>
          <line x1="55" y1="15" x2="65" y2="25" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="65" y1="15" x2="55" y2="25" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="45" cy="20" r="4" fill="none" stroke={C.amber} strokeWidth="1.5" />
          <path d="M 49 20 Q 52 17 55 18" fill="none" stroke={C.amber} strokeWidth="1" strokeDasharray="2 2" />
        </>
      ) : (
        <>
          <circle cx="75" cy="40" r="4" fill="none" stroke={C.amber} strokeWidth="1.5" />
          <path d="M 71 40 Q 60 42 50 48" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="3 2" />
          <line x1="48" y1="45" x2="52" y2="52" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="52" y1="45" x2="48" y2="52" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function DrillCategoryBadge({ category }) {
  const meta = DRILL_CATEGORIES.find((c) => c.key === category) || { label: category, color: "dim" };
  const accent = categoryAccent(meta.color);
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", fontFamily: "'Inter', sans-serif", fontWeight: 700,
        fontSize: 10.5, letterSpacing: "0.03em", padding: "3px 8px", borderRadius: 5, flexShrink: 0,
        color: accent, background: `${accent}26`,
      }}
    >
      {meta.label.toUpperCase()}
    </span>
  );
}

export function DrillsTab({ drills, setDrills, onAddToPlan }) {
  const [filter, setFilter] = useState("all");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("serving");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [beginnerTip, setBeginnerTip] = useState("");
  const [advancedTip, setAdvancedTip] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addDrill = () => {
    if (!name.trim()) return;
    setDrills((ds) => [
      ...ds,
      {
        id: uid(), name: name.trim(), category, duration: Number(duration) || 0, description: description.trim(),
        beginnerTip: beginnerTip.trim(), advancedTip: advancedTip.trim(),
      },
    ]);
    setName(""); setDuration(""); setDescription(""); setBeginnerTip(""); setAdvancedTip(""); setShowForm(false);
  };
  const removeDrill = (id) => setDrills((ds) => ds.filter((d) => d.id !== id));

  const visible = drills.filter((d) => filter === "all" || d.category === filter);

  return (
    <Panel icon={Dumbbell} title="Drills" subtitle="Serving, passing, setting, hitting, blocking, defense and conditioning">
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
        <TabPill active={filter === "all"} onClick={() => setFilter("all")} icon={ListOrdered} label="All" />
        {DRILL_CATEGORIES.map((c) => (
          <TabPill key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)} icon={Dumbbell} label={c.label} />
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7,
            border: `1px dashed ${C.line}`, background: "transparent", color: C.chalkDim,
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginBottom: 14,
          }}
        >
          <Plus size={14} strokeWidth={2.5} /> Add your own drill
        </button>
      ) : (
        <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextInput value={name} onChange={setName} placeholder="Drill name" />
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="min"
              style={{
                width: 56, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 7, padding: "9px 8px",
                color: C.chalk, fontFamily: "'Space Mono', monospace", fontSize: 13.5, outline: "none", textAlign: "center",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto", paddingBottom: 2 }}>
            {DRILL_CATEGORIES.map((c) => (
              <TabPill key={c.key} active={category === c.key} onClick={() => setCategory(c.key)} icon={Dumbbell} label={c.label} />
            ))}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Quick description (optional)"
            rows={2}
            style={{
              width: "100%", resize: "vertical", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6,
              padding: "8px 9px", color: C.chalk, fontFamily: "'Inter', sans-serif", fontSize: 13, outline: "none",
              boxSizing: "border-box", marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextInput value={beginnerTip} onChange={setBeginnerTip} placeholder="Easier for beginners (optional)" />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextInput value={advancedTip} onChange={setAdvancedTip} placeholder="Harder for advanced players (optional)" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addDrill}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 7, border: "none", background: C.amber, color: C.amberInk,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              Save drill
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "9px 14px", borderRadius: 7, border: `1px solid ${C.line}`, background: "transparent",
                color: C.chalkDim, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.chalkFaint, fontStyle: "italic" }}>
          No drills in this category yet.
        </p>
      ) : (
        <div className="np-drills-list">
          {visible.map((d) => (
            <div key={d.id} style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <DrillArt category={d.category} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <DrillCategoryBadge category={d.category} />
                    {d.duration > 0 && (
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, color: C.chalkDim }}>
                        {d.duration}m
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: C.chalk }}>
                    {d.name}
                  </div>
                </div>
              </div>
              {d.description && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.chalkDim, margin: "0 0 8px" }}>
                  {d.description}
                </p>
              )}
              {(d.beginnerTip || d.advancedTip) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                  {d.beginnerTip && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.chalkDim, margin: 0 }}>
                      <strong style={{ color: C.sage }}>Beginner:</strong> {d.beginnerTip}
                    </p>
                  )}
                  {d.advancedTip && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.chalkDim, margin: 0 }}>
                      <strong style={{ color: C.amber }}>Advanced:</strong> {d.advancedTip}
                    </p>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onAddToPlan(d.name, d.duration)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 6,
                    border: `1px solid ${C.amberDim}`, background: "transparent", color: C.amber,
                    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} /> Add to practice plan
                </button>
                <IconBtn onClick={() => removeDrill(d.id)} danger>
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ---------------------------------- Practice Plan ---------------------------------- */

/* ---------------------------------- Practice Timer ---------------------------------- */

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PracticeTimerOverlay({ items, onClose }) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState((items[0]?.duration || 0) * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  const current = items[index];
  const next = items[index + 1];
  const totalSeconds = (current?.duration || 0) * 60;

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else if (remaining === 0 && running) {
      setRunning(false);
      if (index < items.length - 1) {
        setIndex((i) => i + 1);
        setRemaining((items[index + 1]?.duration || 0) * 60);
      } else {
        setCompleted(true);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining, index, items]);

  useEffect(() => {
    setRemaining((items[index]?.duration || 0) * 60);
  }, [index, items]);

  const toggle = () => setRunning((r) => !r);
  const skip = () => {
    setRunning(false);
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setCompleted(true);
      setRemaining(0);
    }
  };
  const reset = () => {
    setRunning(false);
    setIndex(0);
    setRemaining((items[0]?.duration || 0) * 60);
    setCompleted(false);
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100, background: C.bg,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16, background: "none", border: "none",
          color: C.chalkDim, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 13,
        }}
      >
        Close
      </button>

      {completed ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 42, color: C.sage, marginBottom: 12 }}>PRACTICE COMPLETE</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.chalkDim, marginBottom: 24 }}>
            Great work — session finished.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none", background: C.amber, color: C.amberInk,
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Run again
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.chalkDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Segment {index + 1} / {items.length}
          </div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, color: C.chalk, letterSpacing: "0.02em", marginBottom: 6, textAlign: "center" }}>
            {current?.activity || ""}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 72, fontWeight: 700, color: C.amber, lineHeight: 1, marginBottom: 20 }}>
            {formatTimer(remaining)}
          </div>

          <div style={{ width: "100%", maxWidth: 320, height: 8, background: C.panel2, borderRadius: 4, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: C.amber, borderRadius: 4, transition: "width 1s linear" }} />
          </div>

          {next && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.chalkDim, marginBottom: 24 }}>
              Next: <span style={{ color: C.chalk }}>{next.activity}</span> · {next.duration}m
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={toggle}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: 8,
                border: "none", background: C.amber, color: C.amberInk,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={skip}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 8,
                border: `1px solid ${C.amberDim}`, background: "transparent", color: C.amber,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              <SkipForward size={16} /> Skip
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function PracticePlanTab({ items, setItems }) {
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [running, setRunning] = useState(false);

  const add = () => {
    if (!activity.trim()) return;
    setItems((its) => [...its, { id: uid(), activity: activity.trim(), duration: Number(duration) || 0 }]);
    setActivity("");
    setDuration("");
  };
  const remove = (id) => setItems((its) => its.filter((i) => i.id !== id));
  const move = (id, dir) =>
    setItems((its) => {
      const idx = its.findIndex((i) => i.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= its.length) return its;
      const copy = [...its];
      [copy[idx], copy[swap]] = [copy[swap], copy[idx]];
      return copy;
    });

  const total = items.reduce((s, i) => s + (i.duration || 0), 0);

  return (
    <Panel icon={ListOrdered} title="Practice Plan" subtitle="Build an ordered, timed practice">
      {running && (
        <PracticeTimerOverlay items={items} onClose={() => setRunning(false)} />
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <TextInput value={activity} onChange={setActivity} placeholder="Activity or drill" onEnter={add} />
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="min"
          style={{
            width: 56,
            background: C.bg2,
            border: `1px solid ${C.line}`,
            borderRadius: 7,
            padding: "9px 8px",
            color: C.chalk,
            fontFamily: "'Space Mono', monospace",
            fontSize: 13.5,
            outline: "none",
            textAlign: "center",
          }}
        />
        <button
          onClick={add}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "0 14px", borderRadius: 7, border: "none",
            background: C.amber, color: C.amberInk, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}
        >
          <Plus size={15} strokeWidth={3} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.chalkFaint, fontStyle: "italic" }}>
          No segments yet — build your practice above.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {items.map((i, idx) => (
              <div
                key={i.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10, background: C.bg2,
                  border: `1px solid ${C.line}`, borderRadius: 7, padding: "8px 10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.sage, width: 18, textAlign: "center", flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: C.chalk }}>{i.activity}</span>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 12.5, color: C.amber, background: "rgba(224,135,44,0.14)",
                    padding: "2px 8px", borderRadius: 5, flexShrink: 0,
                  }}
                >
                  {i.duration}m
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => move(i.id, -1)} style={{ background: "none", border: "none", color: C.chalkDim, cursor: "pointer", padding: 0 }}>
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={() => move(i.id, 1)} style={{ background: "none", border: "none", color: C.chalkDim, cursor: "pointer", padding: 0 }}>
                    <ChevronDown size={13} />
                  </button>
                </div>
                <IconBtn onClick={() => remove(i.id)} danger>
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            ))}
          </div>
          <button
            onClick={() => setRunning(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "none", background: C.sage, color: C.bg,
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 14,
            }}
          >
            <Play size={15} strokeWidth={2.5} /> Run Practice
          </button>
        </>
      )}

      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px dashed ${C.line}`, paddingTop: 12,
        }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.chalkDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Total time
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 26, fontWeight: 700, color: C.chalk }}>
          {total}<span style={{ fontSize: 14, color: C.chalkDim }}> min</span>
        </span>
      </div>
    </Panel>
  );
}

/* ---------------------------------- Volleyball Court Helpers ---------------------------------- */

function VolleyballCourtSVG({ children, onClick, cursor }) {
  const W = 500;
  const H = 460;
  const pad = 10;
  const courtW = W - pad * 2;
  const courtH = H - pad * 2;
  const netY = pad + courtH / 2;
  const attackOffset = courtH * 0.167; // ~3m / 18m

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      onClick={onClick}
      style={{
        width: "100%",
        background: C.bg2,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        cursor: cursor || "default",
        touchAction: "none",
      }}
    >
      {/* Court boundary */}
      <rect x={pad} y={pad} width={courtW} height={courtH} fill="none" stroke={C.chalkFaint} strokeWidth="2" />
      {/* Center / net line */}
      <line x1={pad} y1={netY} x2={W - pad} y2={netY} stroke={C.amberDim} strokeWidth="3" />
      {/* Attack lines */}
      <line x1={pad} y1={netY - attackOffset} x2={W - pad} y2={netY - attackOffset} stroke={C.chalkFaint} strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1={pad} y1={netY + attackOffset} x2={W - pad} y2={netY + attackOffset} stroke={C.chalkFaint} strokeWidth="1.5" strokeDasharray="6 4" />
      {/* Net posts */}
      <rect x={pad - 4} y={netY - 30} width="4" height="60" fill={C.chalkFaint} />
      <rect x={W - pad} y={netY - 30} width="4" height="60" fill={C.chalkFaint} />
      {/* Net mesh hint */}
      <line x1={pad} y1={netY - 25} x2={W - pad} y2={netY - 25} stroke={C.chalkFaint} strokeWidth="0.5" opacity="0.4" />
      <line x1={pad} y1={netY + 25} x2={W - pad} y2={netY + 25} stroke={C.chalkFaint} strokeWidth="0.5" opacity="0.4" />
      {/* Zone labels */}
      {[
        { x: pad + courtW * 0.17, y: pad + courtH * 0.12, n: "4" },
        { x: pad + courtW * 0.5, y: pad + courtH * 0.12, n: "3" },
        { x: pad + courtW * 0.83, y: pad + courtH * 0.12, n: "2" },
        { x: pad + courtW * 0.17, y: pad + courtH * 0.35, n: "5" },
        { x: pad + courtW * 0.5, y: pad + courtH * 0.35, n: "6" },
        { x: pad + courtW * 0.83, y: pad + courtH * 0.35, n: "1" },
        { x: pad + courtW * 0.17, y: pad + courtH * 0.65, n: "1" },
        { x: pad + courtW * 0.5, y: pad + courtH * 0.65, n: "6" },
        { x: pad + courtW * 0.83, y: pad + courtH * 0.65, n: "5" },
        { x: pad + courtW * 0.17, y: pad + courtH * 0.88, n: "2" },
        { x: pad + courtW * 0.5, y: pad + courtH * 0.88, n: "3" },
        { x: pad + courtW * 0.83, y: pad + courtH * 0.88, n: "4" },
      ].map((z) => (
        <text key={`${z.x}-${z.y}`} x={z.x} y={z.y} fill={C.chalkFaint} fontSize="10" fontFamily="'Space Mono', monospace" textAnchor="middle" opacity="0.35">
          {z.n}
        </text>
      ))}
      {children}
    </svg>
  );
}

function drawVolleyballCourtCanvas(ctx, W, H) {
  const pad = 10;
  const courtW = W - pad * 2;
  const courtH = H - pad * 2;
  const netY = pad + courtH / 2;
  const attackOffset = courtH * 0.167;

  ctx.save();
  ctx.strokeStyle = C.chalkFaint;
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, courtW, courtH);
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(pad, netY); ctx.lineTo(W - pad, netY); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(pad, netY - attackOffset); ctx.lineTo(W - pad, netY - attackOffset); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, netY + attackOffset); ctx.lineTo(W - pad, netY + attackOffset); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.chalkFaint;
  ctx.fillRect(pad - 4, netY - 30, 4, 60);
  ctx.fillRect(W - pad, netY - 30, 4, 60);
  ctx.restore();
}

/* ---------------------------------- X's and O's ---------------------------------- */

function ToolBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 10px", borderRadius: 8,
        border: `1px solid ${active ? C.amber : C.line}`, background: active ? "rgba(224,135,44,0.16)" : "transparent",
        color: active ? C.amber : C.chalkDim, cursor: "pointer", flexShrink: 0,
      }}
    >
      <Icon size={16} strokeWidth={2.25} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function VolleyballCourtDiagram({ diagram, updateDiagram }) {
  const svgRef = useRef(null);
  const [tool, setTool] = useState("select");
  const [lineStart, setLineStart] = useState(null);

  const toPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 460;
    return { x: Math.max(4, Math.min(496, x)), y: Math.max(4, Math.min(456, y)) };
  };

  const handleBackgroundClick = (e) => {
    const p = toPoint(e);
    if (tool === "addO" || tool === "addX") {
      updateDiagram((d) => ({
        ...d,
        markers: [...d.markers, { id: uid(), type: tool === "addO" ? "O" : "X", x: p.x, y: p.y }],
      }));
    } else if (tool === "line") {
      if (!lineStart) {
        setLineStart(p);
      } else {
        updateDiagram((d) => ({
          ...d,
          lines: [...d.lines, { id: uid(), x1: lineStart.x, y1: lineStart.y, x2: p.x, y2: p.y }],
        }));
        setLineStart(null);
      }
    }
  };

  const handleMarkerDown = (e, marker) => {
    if (tool === "erase") {
      e.stopPropagation();
      updateDiagram((d) => ({ ...d, markers: d.markers.filter((m) => m.id !== marker.id) }));
      return;
    }
    if (tool !== "select") return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
  };
  const handleMarkerMove = (e, marker) => {
    if (tool !== "select" || e.buttons !== 1) return;
    const p = toPoint(e);
    updateDiagram((d) => ({
      ...d,
      markers: d.markers.map((m) => (m.id === marker.id ? { ...m, x: p.x, y: p.y } : m)),
    }));
  };

  const removeLine = (id) => updateDiagram((d) => ({ ...d, lines: d.lines.filter((l) => l.id !== id) }));
  const clearCourt = () => updateDiagram((d) => ({ ...d, markers: [], lines: [] }));

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
        <ToolBtn active={tool === "select"} onClick={() => { setTool("select"); setLineStart(null); }} icon={MousePointer2} label="Move" />
        <ToolBtn active={tool === "addO"} onClick={() => { setTool("addO"); setLineStart(null); }} icon={Circle} label="Add O" />
        <ToolBtn active={tool === "addX"} onClick={() => { setTool("addX"); setLineStart(null); }} icon={XIcon} label="Add X" />
        <ToolBtn active={tool === "line"} onClick={() => setTool("line")} icon={ArrowUpRight} label="Draw line" />
        <ToolBtn active={tool === "erase"} onClick={() => { setTool("erase"); setLineStart(null); }} icon={Eraser} label="Erase" />
        <ToolBtn active={false} onClick={clearCourt} icon={RotateCcw} label="Clear all" />
      </div>

      {tool === "line" && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.amber, margin: "0 0 8px" }}>
          {lineStart ? "Tap the end point to finish the line." : "Tap a start point on the court."}
        </p>
      )}
      {tool === "erase" && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.red, margin: "0 0 8px" }}>
          Tap a marker or a line to delete it.
        </p>
      )}

      <div ref={svgRef}>
        <VolleyballCourtSVG
          onClick={handleBackgroundClick}
          cursor={tool === "select" ? "default" : "crosshair"}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={C.amber} />
            </marker>
          </defs>

          {diagram.lines.map((l) => (
            <line
              key={l.id}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={C.amber} strokeWidth="2.5" markerEnd="url(#arrowhead)"
              style={{ cursor: tool === "erase" ? "pointer" : "default" }}
              onClick={(e) => { if (tool === "erase") { e.stopPropagation(); removeLine(l.id); } }}
            />
          ))}

          {lineStart && <circle cx={lineStart.x} cy={lineStart.y} r="5" fill="none" stroke={C.amber} strokeDasharray="3 3" />}

          {diagram.markers.map((m) => (
            <g
              key={m.id}
              onPointerDown={(e) => handleMarkerDown(e, m)}
              onPointerMove={(e) => handleMarkerMove(e, m)}
              style={{ cursor: tool === "select" ? "grab" : tool === "erase" ? "pointer" : "default" }}
            >
              {m.type === "O" ? (
                <circle cx={m.x} cy={m.y} r="12" fill={C.panel} stroke={C.sage} strokeWidth="2.5" />
              ) : (
                <>
                  <line x1={m.x - 8} y1={m.y - 8} x2={m.x + 8} y2={m.y + 8} stroke={C.red} strokeWidth="3" strokeLinecap="round" />
                  <line x1={m.x + 8} y1={m.y - 8} x2={m.x - 8} y2={m.y + 8} stroke={C.red} strokeWidth="3" strokeLinecap="round" />
                </>
              )}
            </g>
          ))}
        </VolleyballCourtSVG>
      </div>
    </div>
  );
}

function PlayChip({ active, onClick, category, label }) {
  const accent = category === "offense" ? C.sage : C.red;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 999,
        border: `1px solid ${active ? C.amber : C.line}`, background: active ? C.amber : "transparent",
        color: active ? C.amberInk : C.chalkDim, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5,
        whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
      }}
    >
      {category === "offense" ? (
        <Circle size={9} strokeWidth={3} color={active ? C.amberInk : accent} />
      ) : (
        <XIcon size={9} strokeWidth={3} color={active ? C.amberInk : accent} />
      )}
      {label}
    </button>
  );
}

export function XOTab({ diagrams, setDiagrams, activeId, setActiveId }) {
  const active = diagrams.find((d) => d.id === activeId) || diagrams[0];

  const offenseCount = diagrams.filter((d) => d.category === "offense").length;
  const defenseCount = diagrams.filter((d) => d.category === "defense").length;

  const updateActive = (fn) => setDiagrams((ds) => ds.map((d) => (d.id === active.id ? fn(d) : d)));

  const newPlay = (category) => {
    const countForCategory = category === "offense" ? offenseCount : defenseCount;
    const label = category === "offense" ? "Offense" : "Defense";
    const d = createDiagram(`${label} Play ${countForCategory + 1}`, category);
    setDiagrams((ds) => [...ds, d]);
    setActiveId(d.id);
  };

  const deletePlay = () => {
    if (diagrams.length <= 1) return;
    const rest = diagrams.filter((d) => d.id !== active.id);
    setDiagrams(rest);
    setActiveId(rest[0].id);
  };

  return (
    <Panel icon={PenTool} title="X's and O's" subtitle="Diagram plays to match your practice plan">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input
          value={active.name}
          onChange={(e) => updateActive((d) => ({ ...d, name: e.target.value }))}
          style={{
            flex: 1, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: "8px 10px",
            color: C.chalk, fontFamily: "'Anton', sans-serif", fontSize: 15, letterSpacing: "0.02em", outline: "none",
          }}
        />
        <IconBtn onClick={deletePlay} danger><Trash2 size={14} /></IconBtn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => newPlay("offense")}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0",
            borderRadius: 7, border: `1px solid ${C.sage}`, background: "rgba(121,160,122,0.12)", color: C.sage,
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
          }}
        >
          <Plus size={14} strokeWidth={2.5} /> Offense play
        </button>
        <button
          onClick={() => newPlay("defense")}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0",
            borderRadius: 7, border: `1px solid ${C.red}`, background: "rgba(196,69,58,0.12)", color: C.red,
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
          }}
        >
          <Plus size={14} strokeWidth={2.5} /> Defense play
        </button>
      </div>

      {diagrams.length > 1 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 2 }}>
          {diagrams.map((d) => (
            <PlayChip
              key={d.id}
              active={d.id === active.id}
              onClick={() => setActiveId(d.id)}
              category={d.category}
              label={d.name}
            />
          ))}
        </div>
      )}

      <div className="np-court-cap">
        <VolleyballCourtDiagram diagram={active} updateDiagram={updateActive} />
      </div>
    </Panel>
  );
}

/* ---------------------------------- Draw Board (freehand) ---------------------------------- */

function VolleyballDrawCanvas({ board, updateBoard }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const strokeRef = useRef(null);
  const [color, setColor] = useState(C.amber);
  const [thick, setThick] = useState(false);
  const [tool, setTool] = useState("pen");

  const drawCourt = (ctx) => {
    drawVolleyballCourtCanvas(ctx, 500, 460);
  };

  const drawStroke = (ctx, stroke) => {
    if (!stroke) return;
    ctx.save();
    ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
    if (stroke.points.length < 2) {
      const p = stroke.points[0];
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCourt(ctx);
    board.strokes.forEach((s) => drawStroke(ctx, s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.id, board.strokes]);

  const toPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 460;
    return { x, y };
  };

  const strokeWidth = () => (tool === "eraser" ? (thick ? 34 : 20) : thick ? 5 : 2.5);

  const handleDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    const p = toPoint(e);
    strokeRef.current = { points: [p], color, width: strokeWidth(), erase: tool === "eraser" };
    drawingRef.current = true;
    drawStroke(canvasRef.current.getContext("2d"), strokeRef.current);
  };
  const handleMove = (e) => {
    if (!drawingRef.current || !strokeRef.current) return;
    const p = toPoint(e);
    const pts = strokeRef.current.points;
    pts.push(p);
    const prev = pts[pts.length - 2];
    const ctx = canvasRef.current.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = strokeRef.current.erase ? "destination-out" : "source-over";
    ctx.strokeStyle = strokeRef.current.color;
    ctx.lineWidth = strokeRef.current.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.restore();
  };
  const handleUp = () => {
    if (!drawingRef.current || !strokeRef.current) return;
    drawingRef.current = false;
    const finishedStroke = strokeRef.current;
    strokeRef.current = null;
    updateBoard((b) => ({ ...b, strokes: [...b.strokes, finishedStroke] }));
  };

  const undo = () => updateBoard((b) => ({ ...b, strokes: b.strokes.slice(0, -1) }));
  const clearAll = () => updateBoard((b) => ({ ...b, strokes: [] }));

  const COLORS = [C.chalk, C.amber, C.sage, C.red];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              style={{
                width: 26, height: 26, borderRadius: "50%", background: c,
                border: `2px solid ${tool === "pen" && color === c ? C.chalk : "transparent"}`,
                boxShadow: `0 0 0 1px ${C.line}`, cursor: "pointer", flexShrink: 0, padding: 0,
              }}
            />
          ))}
        </div>
        <ToolBtn active={tool === "pen"} onClick={() => setTool("pen")} icon={Edit3} label="Pen" />
        <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")} icon={Eraser} label="Erase" />
        <ToolBtn active={thick} onClick={() => setThick((t) => !t)} icon={PenTool} label={thick ? "Thick" : "Thin"} />
        <ToolBtn active={false} onClick={undo} icon={Undo2} label="Undo" />
        <ToolBtn active={false} onClick={clearAll} icon={RotateCcw} label="Clear" />
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={460}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        style={{
          width: "100%", touchAction: "none", background: C.bg2, border: `1px solid ${C.line}`,
          borderRadius: 10, cursor: "crosshair", display: "block",
        }}
      />
    </div>
  );
}

export function DrawBoardTab({ boards, setBoards, activeId, setActiveId }) {
  const active = boards.find((b) => b.id === activeId) || boards[0];
  const updateActive = (fn) => setBoards((bs) => bs.map((b) => (b.id === active.id ? fn(b) : b)));

  const newBoard = () => {
    const b = { id: uid(), name: `Sketch ${boards.length + 1}`, strokes: [] };
    setBoards((bs) => [...bs, b]);
    setActiveId(b.id);
  };
  const deleteBoard = () => {
    if (boards.length <= 1) return;
    const rest = boards.filter((b) => b.id !== active.id);
    setBoards(rest);
    setActiveId(rest[0].id);
  };

  return (
    <Panel icon={Edit3} title="Draw Board" subtitle="Freehand-sketch plays on a blank court — stylus friendly">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input
          value={active.name}
          onChange={(e) => updateActive((b) => ({ ...b, name: e.target.value }))}
          style={{
            flex: 1, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: "8px 10px",
            color: C.chalk, fontFamily: "'Anton', sans-serif", fontSize: 15, letterSpacing: "0.02em", outline: "none",
          }}
        />
        <IconBtn onClick={newBoard}><Plus size={14} /></IconBtn>
        <IconBtn onClick={deleteBoard} danger><Trash2 size={14} /></IconBtn>
      </div>

      {boards.length > 1 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 2 }}>
          {boards.map((b) => (
            <TabPill key={b.id} active={b.id === active.id} onClick={() => setActiveId(b.id)} icon={Edit3} label={b.name} />
          ))}
        </div>
      )}

      <div className="np-court-cap">
        <VolleyballDrawCanvas board={active} updateBoard={updateActive} />
      </div>
    </Panel>
  );
}