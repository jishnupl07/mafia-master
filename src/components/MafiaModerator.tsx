import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Play,
  Shuffle,
  RotateCcw,
  Eye,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Users,
  Skull,
  Stethoscope,
  Shield,
  User,
  ListChecks,
  Heart,
  HeartOff,
} from "lucide-react";
import { Particles } from "@/components/Particles";
import { ROLES, RoleKey, fisherYates } from "@/lib/mafia";
import { sfx, setSoundEnabled, isSoundEnabled } from "@/lib/sfx";

type Phase = "setup" | "reveal";
type Counts = Record<RoleKey, number>;

interface Assignment {
  name: string;
  role: RoleKey;
  seen: boolean;
  alive: boolean;
}
interface SavedGame {
  phase: Phase;
  players: string[];
  counts: Counts;
  assignments: Assignment[];
  sound: boolean;
}

const STORAGE_KEY = "mafia-moderator-v1";

const ROLE_ICONS: Record<RoleKey, React.ComponentType<{ className?: string }>> = {
  mafia: Skull,
  doctor: Stethoscope,
  police: Shield,
  civilian: User,
};

function loadSaved(): SavedGame | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGame;
  } catch {
    return null;
  }
}

export default function MafiaModerator() {
  const saved = typeof window !== "undefined" ? loadSaved() : null;

  const [phase, setPhase] = useState<Phase>(saved?.phase ?? "setup");
  const [players, setPlayers] = useState<string[]>(saved?.players ?? []);
  const [counts, setCounts] = useState<Counts>(
    saved?.counts ?? { mafia: 1, doctor: 1, police: 1, civilian: 0 },
  );
  const [assignments, setAssignments] = useState<Assignment[]>(saved?.assignments ?? []);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [sound, setSound] = useState<boolean>(saved?.sound ?? true);

  useEffect(() => setSoundEnabled(sound), [sound]);

  // persist
  useEffect(() => {
    const data: SavedGame = { phase, players, counts, assignments, sound };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [phase, players, counts, assignments, sound]);

  const civilianCount = Math.max(
    0,
    players.length - counts.mafia - counts.doctor - counts.police,
  );
  const totalRoles = counts.mafia + counts.doctor + counts.police + civilianCount;

  const validation = (() => {
    if (players.length < 4) return { ok: false, msg: "Need at least 4 players" };
    if (counts.mafia < 1) return { ok: false, msg: "Need at least 1 Mafia" };
    if (civilianCount < 1) return { ok: false, msg: "⚠ Too many special roles" };
    if (totalRoles !== players.length)
      return { ok: false, msg: "Role count must match player count" };
    return { ok: true, msg: "✓ Total roles match player count" };
  })();

  function startGame() {
    if (!validation.ok) return;
    sfx.start();
    const roleList: RoleKey[] = [
      ...Array(counts.mafia).fill("mafia"),
      ...Array(counts.doctor).fill("doctor"),
      ...Array(counts.police).fill("police"),
      ...Array(civilianCount).fill("civilian"),
    ];
    const shuffledRoles = fisherYates(roleList);
    const shuffledPlayers = fisherYates(players);
    const assigns: Assignment[] = shuffledPlayers.map((name, i) => ({
      name,
      role: shuffledRoles[i],
      seen: false,
    }));
    setAssignments(assigns);
    setOpenIdx(null);
    setPhase("reveal");
  }

  function shuffleAgain() {
    sfx.click();
    setPhase("setup");
    setAssignments([]);
    setOpenIdx(null);
  }

  function startNewGame() {
    sfx.click();
    setPlayers([]);
    setCounts({ mafia: 1, doctor: 1, police: 1, civilian: 0 });
    setAssignments([]);
    setOpenIdx(null);
    setPhase("setup");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setConfirmReset(false);
  }

  return (
    <div className="relative min-h-dvh text-foreground">
      <div className="app-bg" />
      <Particles count={28} />

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0F172A]/60 border-b border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] glow-primary">
              <Skull className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Mafia Moderator</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                {phase === "setup" ? "Setup" : "Reveal Roles"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSound((s) => !s);
              if (!sound) sfx.click();
            }}
            className="grid h-10 w-10 place-items-center rounded-xl glass hover:bg-white/10 transition-colors"
            aria-label={sound ? "Mute sounds" : "Enable sounds"}
          >
            {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-40 pt-6">
        <AnimatePresence mode="wait">
          {phase === "setup" ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <SetupPhase
                players={players}
                setPlayers={setPlayers}
                counts={counts}
                setCounts={setCounts}
                civilianCount={civilianCount}
                validation={validation}
                onStart={startGame}
              />
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <RevealPhase
                assignments={assignments}
                openIdx={openIdx}
                setOpenIdx={setOpenIdx}
                markSeen={(i) =>
                  setAssignments((prev) =>
                    prev.map((a, idx) => (idx === i ? { ...a, seen: true } : a)),
                  )
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {phase === "reveal" && (
        <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#0F172A]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl px-4 py-3 flex gap-2">
            <button
              onClick={shuffleAgain}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl glass px-4 py-3 text-sm font-semibold hover:bg-white/10 active:scale-[0.98] transition"
            >
              <Shuffle className="h-4 w-4" /> Shuffle Again
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-gradient-to-r from-[#DC2626] to-[#9f1239] text-white shadow-[0_10px_30px_-10px_#dc262699] active:scale-[0.98] transition"
            >
              <RotateCcw className="h-4 w-4" /> Start New Game
            </button>
          </div>
        </footer>
      )}

      <AnimatePresence>
        {confirmReset && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmReset(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="glass rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#DC2626]/20 text-[#FCA5A5]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Start new game?</h3>
                  <p className="text-xs text-white/60">All players & roles will be cleared.</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={startNewGame}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#9f1239] text-white px-4 py-2.5 text-sm font-semibold"
                >
                  Clear & Restart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Setup ---------------- */

function SetupPhase({
  players,
  setPlayers,
  counts,
  setCounts,
  civilianCount,
  validation,
  onStart,
}: {
  players: string[];
  setPlayers: (p: string[]) => void;
  counts: Counts;
  setCounts: (c: Counts) => void;
  civilianCount: number;
  validation: { ok: boolean; msg: string };
  onStart: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addPlayer() {
    const name = draft.trim().replace(/\s+/g, " ");
    if (!name) return;
    if (players.some((p) => p.toLowerCase() === name.toLowerCase())) {
      setErr("Player already added");
      return;
    }
    setPlayers([...players, name]);
    setDraft("");
    setErr(null);
    sfx.click();
    inputRef.current?.focus();
  }

  function removePlayer(i: number) {
    sfx.click();
    setPlayers(players.filter((_, idx) => idx !== i));
  }

  function commitEdit(i: number) {
    const name = editVal.trim().replace(/\s+/g, " ");
    if (!name) {
      setEditIdx(null);
      return;
    }
    if (players.some((p, idx) => idx !== i && p.toLowerCase() === name.toLowerCase())) {
      setErr("Duplicate name");
      return;
    }
    setPlayers(players.map((p, idx) => (idx === i ? name : p)));
    setEditIdx(null);
    setErr(null);
  }

  function bump(role: RoleKey, delta: number) {
    if (role === "civilian") return;
    const next = Math.max(role === "mafia" ? 1 : 0, counts[role] + delta);
    setCounts({ ...counts, [role]: next });
    sfx.click();
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="text-center pt-4 pb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
          Moderator Console
        </motion.div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-[#a78bfa] via-[#c4b5fd] to-[#67e8f9] bg-clip-text text-transparent">
            Mafia Moderator
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-white/60">
          Set up players & roles. Reveal each role in secret.
        </p>
      </div>

      {/* Players card */}
      <section className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#8B5CF6]/20 text-[#c4b5fd]">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold">Players</h2>
          </div>
          <div className="text-xs font-medium text-white/60">
            Players: <span className="text-white font-bold">{players.length}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setErr(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPlayer();
              }
            }}
            placeholder="Add player name..."
            maxLength={32}
            className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/60 focus:border-transparent transition"
          />
          <button
            onClick={addPlayer}
            className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] text-white shadow-[0_10px_30px_-10px_#8B5CF699] hover:brightness-110 active:scale-[0.97] transition"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {err && <div className="mt-2 text-xs text-[#FCA5A5]">{err}</div>}

        <ul className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {players.map((p, i) => (
              <motion.li
                key={p + i}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/5 px-3 py-2.5 hover:bg-white/[0.07] transition"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 text-xs font-bold">
                  {i + 1}
                </div>
                {editIdx === i ? (
                  <input
                    autoFocus
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(i);
                      if (e.key === "Escape") setEditIdx(null);
                    }}
                    className="flex-1 min-w-0 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/60"
                  />
                ) : (
                  <span className="flex-1 min-w-0 truncate text-sm">{p}</span>
                )}
                {editIdx === i ? (
                  <>
                    <button
                      onClick={() => commitEdit(i)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      aria-label="Save"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditIdx(null)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
                      aria-label="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditIdx(i);
                        setEditVal(p);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removePlayer(i)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-[#DC2626]/30 text-white/70 hover:text-[#FCA5A5]"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
          {players.length === 0 && (
            <li className="text-center text-xs text-white/40 py-6">
              No players yet. Add at least 4 to begin.
            </li>
          )}
        </ul>
      </section>

      {/* Roles card */}
      <section className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Role Configuration</h2>
          <div className="text-xs text-white/60">
            Total: <span className="text-white font-bold">{counts.mafia + counts.doctor + counts.police + civilianCount}</span> / {players.length}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RoleCounter
            role="mafia"
            value={counts.mafia}
            onChange={(d) => bump("mafia", d)}
            min={1}
          />
          <RoleCounter
            role="doctor"
            value={counts.doctor}
            onChange={(d) => bump("doctor", d)}
            min={0}
          />
          <RoleCounter
            role="police"
            value={counts.police}
            onChange={(d) => bump("police", d)}
            min={0}
          />
          <RoleCounter role="civilian" value={civilianCount} onChange={() => {}} disabled />
        </div>

        <div
          className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-medium border ${
            validation.ok
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-300"
          }`}
        >
          {validation.ok ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {validation.msg}
        </div>
      </section>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        disabled={!validation.ok}
        className="w-full rounded-3xl py-4 text-base font-bold tracking-tight transition relative overflow-hidden
          disabled:opacity-40 disabled:cursor-not-allowed
          enabled:bg-gradient-to-r enabled:from-[#8B5CF6] enabled:via-[#7c3aed] enabled:to-[#06B6D4]
          enabled:text-white enabled:shadow-[0_20px_60px_-15px_#8B5CF699] enabled:hover:brightness-110"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Play className="h-5 w-5" /> Start Game
        </span>
      </motion.button>
    </div>
  );
}

function RoleCounter({
  role,
  value,
  onChange,
  min = 0,
  disabled = false,
}: {
  role: RoleKey;
  value: number;
  onChange: (delta: number) => void;
  min?: number;
  disabled?: boolean;
}) {
  const meta = ROLES[role];
  const Icon = ROLE_ICONS[role];
  return (
    <div
      className={`relative rounded-2xl p-4 border overflow-hidden ${
        disabled
          ? "bg-white/[0.03] border-white/5"
          : "bg-gradient-to-br " + meta.bg + " border-white/10"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl ${
            disabled ? "bg-white/5 text-white/60" : "bg-black/30 " + meta.text
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{meta.name}</div>
          {disabled && <div className="text-[10px] text-white/50">Auto-calculated</div>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          disabled={disabled || value <= min}
          onClick={() => onChange(-1)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
        >
          −
        </button>
        <div className="text-2xl font-black tabular-nums">{value}</div>
        <button
          disabled={disabled}
          onClick={() => onChange(1)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ---------------- Reveal ---------------- */

function RevealPhase({
  assignments,
  openIdx,
  setOpenIdx,
  markSeen,
}: {
  assignments: Assignment[];
  openIdx: number | null;
  setOpenIdx: (i: number | null) => void;
  markSeen: (i: number) => void;
}) {
  function toggle(i: number) {
    sfx.flip();
    if (openIdx === i) {
      setOpenIdx(null);
    } else {
      setOpenIdx(i);
      markSeen(i);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
          <Eye className="h-3 w-3" /> Tap a card to reveal
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-[#a78bfa] to-[#67e8f9] bg-clip-text text-transparent">
            Reveal Roles
          </span>
        </h1>
        <p className="mt-1 text-xs text-white/50">
          {assignments.length} players · {assignments.filter((a) => a.seen).length} viewed
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {assignments.map((a, i) => (
          <PlayerCard
            key={a.name + i}
            index={i}
            assignment={a}
            open={openIdx === i}
            onClick={() => toggle(i)}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({
  index,
  assignment,
  open,
  onClick,
}: {
  index: number;
  assignment: Assignment;
  open: boolean;
  onClick: () => void;
}) {
  const meta = ROLES[assignment.role];
  const Icon = ROLE_ICONS[assignment.role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="flip-scene aspect-[3/4]"
    >
      <button
        onClick={onClick}
        className="flip-card w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-[1.25rem]"
        style={{ transform: open ? "rotateY(180deg)" : "rotateY(0deg)" }}
        aria-label={`${assignment.name} card`}
      >
        {/* FRONT */}
        <div className="flip-face glass flex flex-col items-center justify-center p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 via-transparent to-[#06B6D4]/10 pointer-events-none" />
          <div className="absolute top-2.5 left-2.5 grid h-6 w-6 place-items-center rounded-lg bg-black/40 border border-white/10 text-[10px] font-bold text-white/70">
            {index + 1}
          </div>
          {assignment.seen && (
            <div
              className="absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-lg bg-white/10 text-white/70"
              title="Already viewed"
            >
              <Eye className="h-3 w-3" />
            </div>
          )}
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-white/10 mb-3">
            <User className="h-6 w-6 text-white/80" />
          </div>
          <div className="text-center text-sm sm:text-base font-bold tracking-tight px-1 line-clamp-2">
            {assignment.name}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
            Tap to reveal
          </div>
        </div>

        {/* BACK */}
        <div
          className={`flip-face flip-back flex flex-col items-center justify-center p-3 bg-gradient-to-br ${meta.bg} border border-white/15 ${meta.glow}`}
        >
          <div className="absolute top-2.5 left-2.5 grid h-6 w-6 place-items-center rounded-lg bg-black/40 text-[10px] font-bold text-white/80">
            {index + 1}
          </div>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={open ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
            transition={{ delay: open ? 0.25 : 0, type: "spring", stiffness: 240, damping: 18 }}
            className={`grid h-16 w-16 place-items-center rounded-2xl bg-black/40 ${meta.text} mb-2`}
          >
            <Icon className="h-8 w-8" />
          </motion.div>
          <div className="text-center text-xs font-semibold text-white/90 line-clamp-1 px-1">
            {assignment.name}
          </div>
          <div className={`mt-1 text-base font-black ${meta.text}`}>{meta.name}</div>
          <div className="mt-1.5 text-center text-[10px] leading-snug text-white/70 px-1 line-clamp-3">
            {meta.description}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/90 border border-white/15">
            <Eye className="h-3 w-3" /> Hide Role
          </div>
        </div>
      </button>
    </motion.div>
  );
}
