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
  BarChart3,
  Activity,
} from "lucide-react";
import { Particles } from "@/components/Particles";
import { ROLES, RoleKey, fisherYates } from "@/lib/mafia";

type Phase = "setup" | "reveal" | "play";
type Counts = Record<RoleKey, number>;

interface Assignment {
  name: string;
  role: RoleKey;
  seen: boolean;
  alive: boolean;
}

export interface RoundChoices {
  mafiaKill: string | null;
  doctorSave: string | null;
  policeSuspect: string | null;
  votedOut: string | null;
}

export interface RoundRecord {
  roundNumber: number;
  choices: RoundChoices;
  eliminated: string[];
}

interface SavedGame {
  phase: Phase;
  players: string[];
  counts: Counts;
  assignments: Assignment[];
  rounds: RoundRecord[];
  currentChoices: RoundChoices;
}

const STORAGE_KEY = "mafia-moderator-v3";

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
    const parsed = JSON.parse(raw) as SavedGame;
    if (parsed.assignments) {
      parsed.assignments = parsed.assignments.map((a) => ({ ...a, alive: a.alive ?? true }));
    }
    return parsed;
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
  const [rounds, setRounds] = useState<RoundRecord[]>(saved?.rounds ?? []);
  const [currentChoices, setCurrentChoices] = useState<RoundChoices>(
    saved?.currentChoices ?? { mafiaKill: null, doctorSave: null, policeSuspect: null, votedOut: null }
  );
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dismissWin, setDismissWin] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // persist
  useEffect(() => {
    const data: SavedGame = { phase, players, counts, assignments, rounds, currentChoices };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [phase, players, counts, assignments, rounds, currentChoices]);

  // Reset dismissWin when phase changes or assignments count of alive changes
  const aliveStatusKey = assignments.map((a) => `${a.name}:${a.alive}`).join(",");
  useEffect(() => {
    setDismissWin(false);
  }, [aliveStatusKey, phase]);

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
      alive: true,
    }));
    setAssignments(assigns);
    setOpenIdx(null);
    setRounds([]);
    setCurrentChoices({ mafiaKill: null, doctorSave: null, policeSuspect: null, votedOut: null });
    setPhase("reveal");
  }

  function shuffleAgain() {
    setPhase("setup");
    setAssignments([]);
    setRounds([]);
    setCurrentChoices({ mafiaKill: null, doctorSave: null, policeSuspect: null, votedOut: null });
    setOpenIdx(null);
  }

  function startNewGame() {
    setPlayers([]);
    setCounts({ mafia: 1, doctor: 1, police: 1, civilian: 0 });
    setAssignments([]);
    setRounds([]);
    setCurrentChoices({ mafiaKill: null, doctorSave: null, policeSuspect: null, votedOut: null });
    setOpenIdx(null);
    setPhase("setup");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setConfirmReset(false);
  }

  function executeRound() {
    const eliminatedThisRound = new Set<string>();

    if (currentChoices.votedOut) {
      eliminatedThisRound.add(currentChoices.votedOut);
    }

    let noOneEliminated = false;
    if (
      currentChoices.mafiaKill &&
      currentChoices.policeSuspect &&
      currentChoices.doctorSave &&
      currentChoices.mafiaKill === currentChoices.policeSuspect &&
      currentChoices.mafiaKill === currentChoices.doctorSave
    ) {
      noOneEliminated = true;
    }

    if (!noOneEliminated) {
      if (currentChoices.mafiaKill && currentChoices.mafiaKill !== currentChoices.doctorSave) {
        eliminatedThisRound.add(currentChoices.mafiaKill);
      }

      if (currentChoices.policeSuspect) {
        const suspected = assignments.find((a) => a.name === currentChoices.policeSuspect);
        if (suspected?.role === "mafia") {
          eliminatedThisRound.add(currentChoices.policeSuspect);
        }
      }
    }

    const newAssignments = assignments.map((a) => {
      if (eliminatedThisRound.has(a.name)) {
        return { ...a, alive: false };
      }
      return a;
    });

    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        choices: currentChoices,
        eliminated: Array.from(eliminatedThisRound),
      },
    ]);
    setAssignments(newAssignments);
    setCurrentChoices({ mafiaKill: null, doctorSave: null, policeSuspect: null, votedOut: null });
  }

  const aliveMafias = assignments.filter((a) => a.role === "mafia" && a.alive).length;
  const aliveCivilians = assignments.filter((a) => a.role !== "mafia" && a.alive).length;
  const totalMafias = assignments.filter((a) => a.role === "mafia").length;

  const gameWinner = (() => {
    if (phase !== "play") return null;
    if (totalMafias === 0) return null;
    if (aliveMafias === 0) return "civilians";
    if (aliveMafias >= aliveCivilians) return "mafia";
    return null;
  })();

  return (
    <div className="relative min-h-dvh text-foreground">
      <div className="app-bg" />
      <Particles count={28} />

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/70 border-b border-white/5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#EF4444] to-[#9F1239] glow-primary">
              <Skull className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Mafia Moderator</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                {phase === "setup" ? "Setup" : phase === "reveal" ? "Reveal Roles" : "Active Game"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-[calc(env(safe-area-inset-bottom)+10rem)] pt-6">
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
          ) : phase === "reveal" ? (
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
                onStartPlay={() => setPhase("play")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <PlayPhase
                assignments={assignments}
                currentChoices={currentChoices}
                setCurrentChoices={setCurrentChoices}
                executeRound={executeRound}
                roundNumber={rounds.length + 1}
                setShowAnalytics={setShowAnalytics}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {(phase === "reveal" || phase === "play") && (
        <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#0F172A]/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-5xl px-4 pt-3 pb-4 flex gap-2">
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

      <AnimatePresence>
        {gameWinner && !dismissWin && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="glass rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden border border-white/10 shadow-[0_0_50px_0_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-b opacity-10 pointer-events-none ${
                  gameWinner === "mafia"
                    ? "from-[#DC2626] to-[#7f1d1d]"
                    : "from-emerald-500 to-emerald-900"
                }`}
              />

              <div className="flex flex-col items-center">
                <div
                  className={`grid h-20 w-20 place-items-center rounded-3xl mb-5 shadow-lg ${
                    gameWinner === "mafia"
                      ? "bg-[#DC2626]/20 text-[#FCA5A5] border border-[#DC2626]/30 shadow-[#DC2626]/20"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/20"
                  }`}
                >
                  {gameWinner === "mafia" ? (
                    <Skull className="h-10 w-10 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  )}
                </div>

                <span
                  className={`text-[11px] uppercase tracking-[0.25em] font-bold ${
                    gameWinner === "mafia" ? "text-[#FCA5A5]" : "text-emerald-300"
                  }`}
                >
                  Victory Achieved
                </span>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-white font-display">
                  {gameWinner === "mafia" ? "Mafia Wins!" : "Civilians Win!"}
                </h2>

                <p className="mt-3 text-sm text-white/70 max-w-xs">
                  {gameWinner === "mafia"
                    ? "The Mafia has successfully outnumbered the Civilians."
                    : "All members of the Mafia have been eliminated from the town."}
                </p>

                <div className="mt-6 w-full rounded-2xl bg-white/[0.04] border border-white/5 p-4 flex justify-around text-sm">
                  <div>
                    <span className="block text-xs text-white/40">Mafia Alive</span>
                    <span className="font-bold text-[#FCA5A5]">{aliveMafias}</span>
                  </div>
                  <div className="border-r border-white/10" />
                  <div>
                    <span className="block text-xs text-white/40">Civilians Alive</span>
                    <span className="font-bold text-emerald-300">{aliveCivilians}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 w-full">
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setDismissWin(true)}
                      className="flex-1 rounded-xl glass px-4 py-3 text-sm font-semibold hover:bg-white/10 transition active:scale-[0.98]"
                    >
                      Review Game
                    </button>
                    <button
                      onClick={startGame}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${
                        gameWinner === "mafia"
                          ? "bg-gradient-to-r from-[#DC2626] to-[#9f1239] shadow-[0_10px_20px_-5px_#dc262699]"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)]"
                      }`}
                    >
                      Play Again
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAnalytics(true)}
                    className="w-full rounded-xl glass px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" /> Game Analytics
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsOverlay rounds={rounds} onClose={() => setShowAnalytics(false)} />
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
    inputRef.current?.focus();
  }

  function removePlayer(i: number) {
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
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />
          Moderator Console
        </motion.div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-[#FCA5A5] via-[#EF4444] to-[#B91C1C] bg-clip-text text-transparent">
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
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#EF4444]/20 text-[#FCA5A5]">
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
            className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/60 focus:border-transparent transition"
          />
          <button
            onClick={addPlayer}
            className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold bg-gradient-to-br from-[#EF4444] to-[#B91C1C] text-white shadow-[0_10px_30px_-10px_#EF444499] hover:brightness-110 active:scale-[0.97] transition"
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
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 border border-white/5 text-xs font-bold">
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
                    className="flex-1 min-w-0 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]/60"
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
          enabled:bg-gradient-to-r enabled:from-[#EF4444] enabled:via-[#DC2626] enabled:to-[#9F1239]
          enabled:text-white enabled:shadow-[0_20px_60px_-15px_#EF444499] enabled:hover:brightness-110"
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
}/* ---------------- Reveal/Play ---------------- */

function RevealPhase({
  assignments,
  openIdx,
  setOpenIdx,
  markSeen,
  onStartPlay,
}: {
  assignments: Assignment[];
  openIdx: number | null;
  setOpenIdx: (i: number | null) => void;
  markSeen: (i: number) => void;
  onStartPlay: () => void;
}) {
  function toggle(i: number) {
    if (openIdx === i) {
      setOpenIdx(null);
    } else {
      setOpenIdx(i);
      markSeen(i);
    }
  }

  const aliveCount = assignments.filter((a) => a.alive).length;

  return (
    <div className="space-y-4">
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
          <Eye className="h-3 w-3" /> Tap a card to reveal
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight font-display">
          <span className="bg-gradient-to-r from-[#FCA5A5] to-[#EF4444] bg-clip-text text-transparent">
            Reveal Roles
          </span>
        </h1>
        <p className="mt-1 text-xs text-white/50 font-sans">
          {assignments.length} players · {aliveCount} alive ·{" "}
          {assignments.filter((a) => a.seen).length} viewed
        </p>
        <button
          onClick={onStartPlay}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold bg-gradient-to-br from-[#EF4444] to-[#B91C1C] text-white shadow-[0_10px_30px_-10px_#EF444499] hover:brightness-110 active:scale-[0.97] transition"
        >
          <Play className="h-4 w-4" /> Start Mafia
        </button>
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

function PlayPhase({
  assignments,
  currentChoices,
  setCurrentChoices,
  executeRound,
  roundNumber,
  setShowAnalytics,
}: {
  assignments: Assignment[];
  currentChoices: RoundChoices;
  setCurrentChoices: (c: RoundChoices) => void;
  executeRound: () => void;
  roundNumber: number;
  setShowAnalytics: (v: boolean) => void;
}) {
  const aliveCount = assignments.filter((a) => a.alive).length;
  const aliveMafias = assignments.filter((a) => a.role === "mafia" && a.alive).length;
  const aliveCivilians = assignments.filter((a) => a.role !== "mafia" && a.alive).length;

  const handleChoiceToggle = (key: keyof RoundChoices, name: string) => {
    setCurrentChoices({
      ...currentChoices,
      [key]: currentChoices[key] === name ? null : name,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Play Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Game Dashboard
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight font-display">
          <span className="bg-gradient-to-r from-[#FCA5A5] to-[#EF4444] bg-clip-text text-transparent">
            Round {roundNumber}
          </span>
        </h1>
        <p className="mt-1 text-xs text-white/50 font-sans">
          Make choices for each role, then submit the round.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans">
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Total Players</span>
          <span className="text-2xl font-black text-white">{assignments.length}</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-[#EF4444]/20">
          <span className="text-[10px] uppercase tracking-wider text-[#FCA5A5] mb-1">Alive Players</span>
          <span className="text-2xl font-black text-white">{aliveCount}</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-[#DC2626]/20 bg-[#DC2626]/5">
          <span className="text-[10px] uppercase tracking-wider text-[#FCA5A5] mb-1">Alive Mafia</span>
          <span className="text-2xl font-black text-[#FCA5A5]">{aliveMafias}</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1">Alive Civilians</span>
          <span className="text-2xl font-black text-emerald-300">{aliveCivilians}</span>
        </div>
      </div>

      {/* Roster / Player List */}
      <section className="glass rounded-3xl p-5 border-white/10 font-sans">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold tracking-tight text-white font-display">Active Roster</h2>
          <button
            onClick={() => setShowAnalytics(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </button>
        </div>
        <ul className="space-y-4">
          {assignments.map((a, i) => {
            const meta = ROLES[a.role];
            const Icon = ROLE_ICONS[a.role];
            return (
              <motion.li
                key={a.name + i}
                layout
                className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition duration-200 ${
                  a.alive
                    ? "bg-white/[0.04] border-white/10"
                    : "bg-white/[0.02] border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-bold text-white/80">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm sm:text-base font-bold truncate transition ${
                        a.alive ? "text-white" : "line-through text-white/40"
                      }`}
                    >
                      {a.name}
                    </div>
                    <div
                      className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold ${meta.text}`}
                    >
                      <Icon className="h-3.5 w-3.5 text-white/80" /> {meta.name}
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold border ${
                      a.alive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-[#DC2626]/10 border-[#DC2626]/20 text-[#FCA5A5]"
                    }`}
                  >
                    {a.alive ? "ALIVE" : "ELIMINATED"}
                  </div>
                </div>

                {a.alive && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleChoiceToggle("mafiaKill", a.name)}
                      className={`rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        currentChoices.mafiaKill === a.name
                          ? "bg-[#DC2626] border-[#DC2626] text-white"
                          : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"
                      }`}
                    >
                      Mafia Kill
                    </button>
                    <button
                      onClick={() => handleChoiceToggle("doctorSave", a.name)}
                      className={`rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        currentChoices.doctorSave === a.name
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"
                      }`}
                    >
                      Doctor Save
                    </button>
                    <button
                      onClick={() => handleChoiceToggle("policeSuspect", a.name)}
                      className={`rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        currentChoices.policeSuspect === a.name
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"
                      }`}
                    >
                      Police Suspect
                    </button>
                    <button
                      onClick={() => handleChoiceToggle("votedOut", a.name)}
                      className={`rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        currentChoices.votedOut === a.name
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"
                      }`}
                    >
                      Voted Out
                    </button>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={executeRound}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white shadow-[0_10px_30px_-10px_#EF444499] hover:brightness-110 active:scale-[0.97] transition"
          >
            <Play className="h-4 w-4" /> Submit Round {roundNumber}
          </button>
        </div>
      </section>
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
        className="flip-card w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] rounded-[1.25rem]"
        style={{ transform: open ? "rotateY(180deg)" : "rotateY(0deg)" }}
        aria-label={`${assignment.name} card`}
      >
        {/* FRONT */}
        <div className="flip-face glass flex flex-col items-center justify-center p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/8 via-transparent to-[#EF4444]/3 pointer-events-none" />
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
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#EF4444]/25 to-[#B91C1C]/25 border border-[#EF4444]/20 mb-3">
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

function AnalyticsOverlay({
  rounds,
  onClose,
}: {
  rounds: RoundRecord[];
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/80 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="glass rounded-3xl p-5 max-w-xl w-full max-h-[85vh] flex flex-col relative border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display tracking-tight">Game Analytics</h3>
              <p className="text-xs text-white/50">Round history & stats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-sans">
          {rounds.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm">
              No rounds recorded yet.
            </div>
          ) : (
            rounds.map((round) => (
              <div
                key={round.roundNumber}
                className="rounded-2xl bg-white/[0.03] border border-white/5 p-4"
              >
                <div className="text-sm font-bold text-white mb-3">Round {round.roundNumber}</div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                    <span className="text-white/40 block mb-1">Mafia Kill</span>
                    <span className="font-semibold text-white">
                      {round.choices.mafiaKill || "—"}
                    </span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                    <span className="text-white/40 block mb-1">Doctor Save</span>
                    <span className="font-semibold text-white">
                      {round.choices.doctorSave || "—"}
                    </span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                    <span className="text-white/40 block mb-1">Police Suspect</span>
                    <span className="font-semibold text-white">
                      {round.choices.policeSuspect || "—"}
                    </span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                    <span className="text-white/40 block mb-1">Voted Out</span>
                    <span className="font-semibold text-white">
                      {round.choices.votedOut || "—"}
                    </span>
                  </div>
                </div>

                {round.eliminated.length > 0 ? (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-[11px] uppercase tracking-wider text-[#FCA5A5] font-bold block mb-1.5">
                      Eliminated ({round.eliminated.length}/2 Max)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {round.eliminated.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#DC2626]/20 text-[#FCA5A5] px-2.5 py-1 text-xs font-semibold"
                        >
                          <Skull className="h-3 w-3" /> {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                      No eliminations this round.
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

