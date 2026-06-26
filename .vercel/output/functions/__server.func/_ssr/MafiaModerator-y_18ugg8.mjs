import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { _ as CircleCheck, a as Stethoscope, c as Shield, d as Play, f as Pencil, g as TriangleAlert, h as Activity, i as Trash2, l as RotateCcw, m as Check, n as Users, o as Skull, p as Eye, r as User, s as Shuffle, t as X, u as Plus, v as ChartColumn } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MafiaModerator-y_18ugg8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Particles({ count = 24 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "particles",
		"aria-hidden": true,
		children: (0, import_react.useMemo)(() => Array.from({ length: count }).map((_, i) => ({
			id: i,
			left: Math.random() * 100,
			size: 2 + Math.random() * 4,
			duration: 12 + Math.random() * 18,
			delay: -Math.random() * 20,
			opacity: .2 + Math.random() * .6,
			hue: Math.random() > .5 ? "oklch(0.7 0.18 295)" : "oklch(0.75 0.15 210)"
		})), [count]).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "particle",
			style: {
				left: `${p.left}%`,
				width: p.size,
				height: p.size,
				background: p.hue,
				opacity: p.opacity,
				animationDuration: `${p.duration}s`,
				animationDelay: `${p.delay}s`,
				boxShadow: `0 0 ${p.size * 3}px ${p.hue}`
			}
		}, p.id))
	});
}
var ROLES = {
	mafia: {
		key: "mafia",
		name: "Mafia",
		description: "Eliminate one player each night.",
		emoji: "🔪",
		colorVar: "var(--mafia)",
		ring: "ring-[#DC2626]/50",
		text: "text-[#FCA5A5]",
		glow: "shadow-[0_0_40px_-8px_#DC262699]",
		bg: "from-[#DC2626]/30 to-[#7f1d1d]/60"
	},
	doctor: {
		key: "doctor",
		name: "Doctor",
		description: "Protect one player every night.",
		emoji: "🩺",
		colorVar: "var(--doctor)",
		ring: "ring-[#16A34A]/50",
		text: "text-[#86efac]",
		glow: "shadow-[0_0_40px_-8px_#16A34A99]",
		bg: "from-[#16A34A]/30 to-[#14532d]/60"
	},
	police: {
		key: "police",
		name: "Police",
		description: "Investigate one player every night.",
		emoji: "🛡️",
		colorVar: "var(--police)",
		ring: "ring-[#2563EB]/50",
		text: "text-[#93c5fd]",
		glow: "shadow-[0_0_40px_-8px_#2563EB99]",
		bg: "from-[#2563EB]/30 to-[#1e3a8a]/60"
	},
	civilian: {
		key: "civilian",
		name: "Civilian",
		description: "Find the Mafia and survive.",
		emoji: "👤",
		colorVar: "var(--civilian)",
		ring: "ring-[#6B7280]/50",
		text: "text-slate-200",
		glow: "shadow-[0_0_40px_-8px_#6B728099]",
		bg: "from-slate-500/30 to-slate-800/60"
	}
};
function fisherYates(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
var STORAGE_KEY = "mafia-moderator-v2";
var ROLE_ICONS = {
	mafia: Skull,
	doctor: Stethoscope,
	police: Shield,
	civilian: User
};
function loadSaved() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.assignments) parsed.assignments = parsed.assignments.map((a) => ({
			...a,
			alive: a.alive ?? true
		}));
		return parsed;
	} catch {
		return null;
	}
}
function MafiaModerator() {
	const saved = typeof window !== "undefined" ? loadSaved() : null;
	const [phase, setPhase] = (0, import_react.useState)(saved?.phase ?? "setup");
	const [players, setPlayers] = (0, import_react.useState)(saved?.players ?? []);
	const [counts, setCounts] = (0, import_react.useState)(saved?.counts ?? {
		mafia: 1,
		doctor: 1,
		police: 1,
		civilian: 0
	});
	const [assignments, setAssignments] = (0, import_react.useState)(saved?.assignments ?? []);
	const [rounds, setRounds] = (0, import_react.useState)(saved?.rounds ?? []);
	const [currentChoices, setCurrentChoices] = (0, import_react.useState)(saved?.currentChoices ?? {
		mafiaKill: null,
		doctorSave: null,
		policeSuspect: null,
		votedOut: null
	});
	const [openIdx, setOpenIdx] = (0, import_react.useState)(null);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	const [dismissWin, setDismissWin] = (0, import_react.useState)(false);
	const [showAnalytics, setShowAnalytics] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const data = {
			phase,
			players,
			counts,
			assignments,
			rounds,
			currentChoices
		};
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {}
	}, [
		phase,
		players,
		counts,
		assignments,
		rounds,
		currentChoices
	]);
	(0, import_react.useEffect)(() => {
		setDismissWin(false);
	}, [assignments.map((a) => `${a.name}:${a.alive}`).join(","), phase]);
	const civilianCount = Math.max(0, players.length - counts.mafia - counts.doctor - counts.police);
	const totalRoles = counts.mafia + counts.doctor + counts.police + civilianCount;
	const validation = (() => {
		if (players.length < 4) return {
			ok: false,
			msg: "Need at least 4 players"
		};
		if (counts.mafia < 1) return {
			ok: false,
			msg: "Need at least 1 Mafia"
		};
		if (civilianCount < 1) return {
			ok: false,
			msg: "⚠ Too many special roles"
		};
		if (totalRoles !== players.length) return {
			ok: false,
			msg: "Role count must match player count"
		};
		return {
			ok: true,
			msg: "✓ Total roles match player count"
		};
	})();
	function startGame() {
		if (!validation.ok) return;
		const shuffledRoles = fisherYates([
			...Array(counts.mafia).fill("mafia"),
			...Array(counts.doctor).fill("doctor"),
			...Array(counts.police).fill("police"),
			...Array(civilianCount).fill("civilian")
		]);
		setAssignments(fisherYates(players).map((name, i) => ({
			name,
			role: shuffledRoles[i],
			seen: false,
			alive: true
		})));
		setOpenIdx(null);
		setRounds([]);
		setCurrentChoices({
			mafiaKill: null,
			doctorSave: null,
			policeSuspect: null,
			votedOut: null
		});
		setPhase("reveal");
	}
	function shuffleAgain() {
		setPhase("setup");
		setAssignments([]);
		setRounds([]);
		setCurrentChoices({
			mafiaKill: null,
			doctorSave: null,
			policeSuspect: null,
			votedOut: null
		});
		setOpenIdx(null);
	}
	function startNewGame() {
		setPlayers([]);
		setCounts({
			mafia: 1,
			doctor: 1,
			police: 1,
			civilian: 0
		});
		setAssignments([]);
		setRounds([]);
		setCurrentChoices({
			mafiaKill: null,
			doctorSave: null,
			policeSuspect: null,
			votedOut: null
		});
		setOpenIdx(null);
		setPhase("setup");
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {}
		setConfirmReset(false);
	}
	function executeRound() {
		const eliminatedThisRound = /* @__PURE__ */ new Set();
		if (currentChoices.votedOut) eliminatedThisRound.add(currentChoices.votedOut);
		let noOneEliminated = false;
		if (currentChoices.mafiaKill && currentChoices.policeSuspect && currentChoices.doctorSave && currentChoices.mafiaKill === currentChoices.policeSuspect && currentChoices.mafiaKill === currentChoices.doctorSave) noOneEliminated = true;
		if (!noOneEliminated) {
			if (currentChoices.mafiaKill && currentChoices.mafiaKill !== currentChoices.doctorSave) eliminatedThisRound.add(currentChoices.mafiaKill);
			if (currentChoices.policeSuspect) {
				if (assignments.find((a) => a.name === currentChoices.policeSuspect)?.role === "mafia") eliminatedThisRound.add(currentChoices.policeSuspect);
			}
		}
		const newAssignments = assignments.map((a) => {
			if (eliminatedThisRound.has(a.name)) return {
				...a,
				alive: false
			};
			return a;
		});
		setRounds([...rounds, {
			roundNumber: rounds.length + 1,
			choices: currentChoices,
			eliminated: Array.from(eliminatedThisRound)
		}]);
		setAssignments(newAssignments);
		setCurrentChoices({
			mafiaKill: null,
			doctorSave: null,
			policeSuspect: null,
			votedOut: null
		});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "app-bg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, { count: 28 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 backdrop-blur-xl bg-black/70 border-b border-white/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-5xl px-4 py-3 flex items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#EF4444] to-[#9F1239] glow-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "h-5 w-5 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold tracking-tight",
								children: "Mafia Moderator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.18em] text-white/50",
								children: phase === "setup" ? "Setup" : phase === "reveal" ? "Reveal Roles" : "Active Game"
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-5xl px-4 pb-40 pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "wait",
					children: phase === "setup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -16
						},
						transition: { duration: .3 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupPhase, {
							players,
							setPlayers,
							counts,
							setCounts,
							civilianCount,
							validation,
							onStart: startGame
						})
					}, "setup") : phase === "reveal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -16
						},
						transition: { duration: .3 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealPhase, {
							assignments,
							openIdx,
							setOpenIdx,
							markSeen: (i) => setAssignments((prev) => prev.map((a, idx) => idx === i ? {
								...a,
								seen: true
							} : a)),
							onStartPlay: () => setPhase("play")
						})
					}, "reveal") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -16
						},
						transition: { duration: .3 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayPhase, {
							assignments,
							currentChoices,
							setCurrentChoices,
							executeRound,
							roundNumber: rounds.length + 1,
							setShowAnalytics
						})
					}, "play")
				})
			}),
			(phase === "reveal" || phase === "play") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#0F172A]/80 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-5xl px-4 py-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: shuffleAgain,
						className: "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl glass px-4 py-3 text-sm font-semibold hover:bg-white/10 active:scale-[0.98] transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "h-4 w-4" }), " Shuffle Again"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setConfirmReset(true),
						className: "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-gradient-to-r from-[#DC2626] to-[#9f1239] text-white shadow-[0_10px_30px_-10px_#dc262699] active:scale-[0.98] transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " Start New Game"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: confirmReset && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4",
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				onClick: () => setConfirmReset(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						scale: .9,
						opacity: 0
					},
					animate: {
						scale: 1,
						opacity: 1
					},
					exit: {
						scale: .9,
						opacity: 0
					},
					transition: {
						type: "spring",
						stiffness: 280,
						damping: 24
					},
					className: "glass rounded-3xl p-6 max-w-sm w-full",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 w-11 place-items-center rounded-2xl bg-[#DC2626]/20 text-[#FCA5A5]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Start new game?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-white/60",
							children: "All players & roles will be cleared."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setConfirmReset(false),
							className: "flex-1 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover:bg-white/10",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: startNewGame,
							className: "flex-1 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#9f1239] text-white px-4 py-2.5 text-sm font-semibold",
							children: "Clear & Restart"
						})]
					})]
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: gameWinner && !dismissWin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				className: "fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-md p-4",
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						scale: .9,
						opacity: 0,
						y: 20
					},
					animate: {
						scale: 1,
						opacity: 1,
						y: 0
					},
					exit: {
						scale: .9,
						opacity: 0,
						y: 20
					},
					transition: {
						type: "spring",
						stiffness: 280,
						damping: 24
					},
					className: "glass rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden border border-white/10 shadow-[0_0_50px_0_rgba(0,0,0,0.8)]",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-0 bg-gradient-to-b opacity-10 pointer-events-none ${gameWinner === "mafia" ? "from-[#DC2626] to-[#7f1d1d]" : "from-emerald-500 to-emerald-900"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `grid h-20 w-20 place-items-center rounded-3xl mb-5 shadow-lg ${gameWinner === "mafia" ? "bg-[#DC2626]/20 text-[#FCA5A5] border border-[#DC2626]/30 shadow-[#DC2626]/20" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/20"}`,
								children: gameWinner === "mafia" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "h-10 w-10 animate-bounce" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-10 w-10 animate-bounce" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-[11px] uppercase tracking-[0.25em] font-bold ${gameWinner === "mafia" ? "text-[#FCA5A5]" : "text-emerald-300"}`,
								children: "Victory Achieved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-3xl font-black tracking-tight text-white font-display",
								children: gameWinner === "mafia" ? "Mafia Wins!" : "Civilians Win!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-white/70 max-w-xs",
								children: gameWinner === "mafia" ? "The Mafia has successfully outnumbered the Civilians." : "All members of the Mafia have been eliminated from the town."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 w-full rounded-2xl bg-white/[0.04] border border-white/5 p-4 flex justify-around text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-white/40",
										children: "Mafia Alive"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-[#FCA5A5]",
										children: aliveMafias
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-white/10" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-white/40",
										children: "Civilians Alive"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-emerald-300",
										children: aliveCivilians
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-col gap-3 w-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3 w-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setDismissWin(true),
										className: "flex-1 rounded-xl glass px-4 py-3 text-sm font-semibold hover:bg-white/10 transition active:scale-[0.98]",
										children: "Review Game"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: startGame,
										className: `flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${gameWinner === "mafia" ? "bg-gradient-to-r from-[#DC2626] to-[#9f1239] shadow-[0_10px_20px_-5px_#dc262699]" : "bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)]"}`,
										children: "Play Again"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setShowAnalytics(true),
									className: "w-full rounded-xl glass px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition active:scale-[0.98] flex items-center justify-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4" }), " Game Analytics"]
								})]
							})
						]
					})]
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showAnalytics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsOverlay, {
				rounds,
				onClose: () => setShowAnalytics(false)
			}) })
		]
	});
}
function SetupPhase({ players, setPlayers, counts, setCounts, civilianCount, validation, onStart }) {
	const [draft, setDraft] = (0, import_react.useState)("");
	const [editIdx, setEditIdx] = (0, import_react.useState)(null);
	const [editVal, setEditVal] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
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
	function removePlayer(i) {
		setPlayers(players.filter((_, idx) => idx !== i));
	}
	function commitEdit(i) {
		const name = editVal.trim().replace(/\s+/g, " ");
		if (!name) {
			setEditIdx(null);
			return;
		}
		if (players.some((p, idx) => idx !== i && p.toLowerCase() === name.toLowerCase())) {
			setErr("Duplicate name");
			return;
		}
		setPlayers(players.map((p, idx) => idx === i ? name : p));
		setEditIdx(null);
		setErr(null);
	}
	function bump(role, delta) {
		if (role === "civilian") return;
		const next = Math.max(role === "mafia" ? 1 : 0, counts[role] + delta);
		setCounts({
			...counts,
			[role]: next
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center pt-4 pb-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							scale: .95
						},
						animate: {
							opacity: 1,
							scale: 1
						},
						className: "inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" }), "Moderator Console"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 text-3xl sm:text-4xl font-black tracking-tight",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-gradient-to-r from-[#FCA5A5] via-[#EF4444] to-[#B91C1C] bg-clip-text text-transparent",
							children: "Mafia Moderator"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-white/60",
						children: "Set up players & roles. Reveal each role in secret."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass rounded-3xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-8 w-8 place-items-center rounded-xl bg-[#EF4444]/20 text-[#FCA5A5]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-semibold",
								children: "Players"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs font-medium text-white/60",
							children: ["Players: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white font-bold",
								children: players.length
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							value: draft,
							onChange: (e) => {
								setDraft(e.target.value);
								setErr(null);
							},
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addPlayer();
								}
							},
							placeholder: "Add player name...",
							maxLength: 32,
							className: "flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/60 focus:border-transparent transition"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: addPlayer,
							className: "inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold bg-gradient-to-br from-[#EF4444] to-[#B91C1C] text-white shadow-[0_10px_30px_-10px_#EF444499] hover:brightness-110 active:scale-[0.97] transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
						})]
					}),
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-xs text-[#FCA5A5]",
						children: err
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
							initial: false,
							children: players.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
								layout: true,
								initial: {
									opacity: 0,
									y: -8
								},
								animate: {
									opacity: 1,
									y: 0
								},
								exit: {
									opacity: 0,
									x: 20
								},
								transition: { duration: .2 },
								className: "group flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/5 px-3 py-2.5 hover:bg-white/[0.07] transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 border border-white/5 text-xs font-bold",
										children: i + 1
									}),
									editIdx === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										autoFocus: true,
										value: editVal,
										onChange: (e) => setEditVal(e.target.value),
										onKeyDown: (e) => {
											if (e.key === "Enter") commitEdit(i);
											if (e.key === "Escape") setEditIdx(null);
										},
										className: "flex-1 min-w-0 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]/60"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1 min-w-0 truncate text-sm",
										children: p
									}),
									editIdx === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => commitEdit(i),
										className: "grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30",
										"aria-label": "Save",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditIdx(null),
										className: "grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10",
										"aria-label": "Cancel",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setEditIdx(i);
											setEditVal(p);
										},
										className: "grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70",
										"aria-label": "Edit",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removePlayer(i),
										className: "grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-[#DC2626]/30 text-white/70 hover:text-[#FCA5A5]",
										"aria-label": "Remove",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})] })
								]
							}, p + i))
						}), players.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-center text-xs text-white/40 py-6",
							children: "No players yet. Add at least 4 to begin."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass rounded-3xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "Role Configuration"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-white/60",
							children: [
								"Total: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-white font-bold",
									children: counts.mafia + counts.doctor + counts.police + civilianCount
								}),
								" / ",
								players.length
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCounter, {
								role: "mafia",
								value: counts.mafia,
								onChange: (d) => bump("mafia", d),
								min: 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCounter, {
								role: "doctor",
								value: counts.doctor,
								onChange: (d) => bump("doctor", d),
								min: 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCounter, {
								role: "police",
								value: counts.police,
								onChange: (d) => bump("police", d),
								min: 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCounter, {
								role: "civilian",
								value: civilianCount,
								onChange: () => {},
								disabled: true
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-medium border ${validation.ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-amber-500/10 border-amber-500/20 text-amber-300"}`,
						children: [validation.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }), validation.msg]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
				whileTap: { scale: .98 },
				onClick: onStart,
				disabled: !validation.ok,
				className: "w-full rounded-3xl py-4 text-base font-bold tracking-tight transition relative overflow-hidden\r\n          disabled:opacity-40 disabled:cursor-not-allowed\r\n          enabled:bg-gradient-to-r enabled:from-[#EF4444] enabled:via-[#DC2626] enabled:to-[#9F1239]\r\n          enabled:text-white enabled:shadow-[0_20px_60px_-15px_#EF444499] enabled:hover:brightness-110",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5" }), " Start Game"]
				})
			})
		]
	});
}
function RoleCounter({ role, value, onChange, min = 0, disabled = false }) {
	const meta = ROLES[role];
	const Icon = ROLE_ICONS[role];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative rounded-2xl p-4 border overflow-hidden ${disabled ? "bg-white/[0.03] border-white/5" : "bg-gradient-to-br " + meta.bg + " border-white/10"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `grid h-9 w-9 place-items-center rounded-xl ${disabled ? "bg-white/5 text-white/60" : "bg-black/30 " + meta.text}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					children: meta.name
				}), disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-white/50",
					children: "Auto-calculated"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-center justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: disabled || value <= min,
					onClick: () => onChange(-1),
					className: "grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold",
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-black tabular-nums",
					children: value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled,
					onClick: () => onChange(1),
					className: "grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold",
					children: "+"
				})
			]
		})]
	});
}
function RevealPhase({ assignments, openIdx, setOpenIdx, markSeen, onStartPlay }) {
	function toggle(i) {
		if (openIdx === i) setOpenIdx(null);
		else {
			setOpenIdx(i);
			markSeen(i);
		}
	}
	const aliveCount = assignments.filter((a) => a.alive).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center pt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " Tap a card to reveal"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-3xl sm:text-4xl font-black tracking-tight font-display",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-gradient-to-r from-[#FCA5A5] to-[#EF4444] bg-clip-text text-transparent",
						children: "Reveal Roles"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-white/50 font-sans",
					children: [
						assignments.length,
						" players · ",
						aliveCount,
						" alive ·",
						" ",
						assignments.filter((a) => a.seen).length,
						" viewed"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onStartPlay,
					className: "mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold bg-gradient-to-br from-[#EF4444] to-[#B91C1C] text-white shadow-[0_10px_30px_-10px_#EF444499] hover:brightness-110 active:scale-[0.97] transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), " Start Mafia"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
			children: assignments.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerCard, {
				index: i,
				assignment: a,
				open: openIdx === i,
				onClick: () => toggle(i)
			}, a.name + i))
		})]
	});
}
function PlayPhase({ assignments, currentChoices, setCurrentChoices, executeRound, roundNumber, setShowAnalytics }) {
	const aliveCount = assignments.filter((a) => a.alive).length;
	const aliveMafias = assignments.filter((a) => a.role === "mafia" && a.alive).length;
	const aliveCivilians = assignments.filter((a) => a.role !== "mafia" && a.alive).length;
	const handleChoiceToggle = (key, name) => {
		setCurrentChoices({
			...currentChoices,
			[key]: currentChoices[key] === name ? null : name
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" }), "Active Game Dashboard"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 text-3xl sm:text-4xl font-black tracking-tight font-display",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "bg-gradient-to-r from-[#FCA5A5] to-[#EF4444] bg-clip-text text-transparent",
							children: ["Round ", roundNumber]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-white/50 font-sans",
						children: "Make choices for each role, then submit the round."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 font-sans",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-white/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-wider text-white/40 mb-1",
							children: "Total Players"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl font-black text-white",
							children: assignments.length
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-[#EF4444]/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-wider text-[#FCA5A5] mb-1",
							children: "Alive Players"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl font-black text-white",
							children: aliveCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-[#DC2626]/20 bg-[#DC2626]/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-wider text-[#FCA5A5] mb-1",
							children: "Alive Mafia"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl font-black text-[#FCA5A5]",
							children: aliveMafias
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border-emerald-500/20 bg-emerald-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-wider text-emerald-300 mb-1",
							children: "Alive Civilians"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl font-black text-emerald-300",
							children: aliveCivilians
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass rounded-3xl p-5 border-white/10 font-sans",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold tracking-tight text-white font-display",
							children: "Active Roster"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setShowAnalytics(true),
							className: "inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" }), "Analytics"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-4",
						children: assignments.map((a, i) => {
							const meta = ROLES[a.role];
							const Icon = ROLE_ICONS[a.role];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
								layout: true,
								className: `flex flex-col gap-3 rounded-2xl border px-4 py-4 transition duration-200 ${a.alive ? "bg-white/[0.04] border-white/10" : "bg-white/[0.02] border-white/5 opacity-60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-bold text-white/80",
											children: i + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `text-sm sm:text-base font-bold truncate transition ${a.alive ? "text-white" : "line-through text-white/40"}`,
												children: a.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold ${meta.text}`,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 text-white/80" }),
													" ",
													meta.name
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold border ${a.alive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-[#DC2626]/10 border-[#DC2626]/20 text-[#FCA5A5]"}`,
											children: a.alive ? "ALIVE" : "ELIMINATED"
										})
									]
								}), a.alive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleChoiceToggle("mafiaKill", a.name),
											className: `rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentChoices.mafiaKill === a.name ? "bg-[#DC2626] border-[#DC2626] text-white" : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"}`,
											children: "Mafia Kill"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleChoiceToggle("doctorSave", a.name),
											className: `rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentChoices.doctorSave === a.name ? "bg-blue-600 border-blue-600 text-white" : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"}`,
											children: "Doctor Save"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleChoiceToggle("policeSuspect", a.name),
											className: `rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentChoices.policeSuspect === a.name ? "bg-amber-600 border-amber-600 text-white" : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"}`,
											children: "Police Suspect"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleChoiceToggle("votedOut", a.name),
											className: `rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentChoices.votedOut === a.name ? "bg-purple-600 border-purple-600 text-white" : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"}`,
											children: "Voted Out"
										})
									]
								})]
							}, a.name + i);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: executeRound,
							className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white shadow-[0_10px_30px_-10px_#EF444499] hover:brightness-110 active:scale-[0.97] transition",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }),
								" Submit Round ",
								roundNumber
							]
						})
					})
				]
			})
		]
	});
}
function PlayerCard({ index, assignment, open, onClick }) {
	const meta = ROLES[assignment.role];
	const Icon = ROLE_ICONS[assignment.role];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 16,
			scale: .96
		},
		animate: {
			opacity: 1,
			y: 0,
			scale: 1
		},
		transition: {
			duration: .35,
			delay: index * .03
		},
		className: "flip-scene aspect-[3/4]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick,
			className: "flip-card w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] rounded-[1.25rem]",
			style: { transform: open ? "rotateY(180deg)" : "rotateY(0deg)" },
			"aria-label": `${assignment.name} card`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flip-face glass flex flex-col items-center justify-center p-3 relative overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-[#EF4444]/8 via-transparent to-[#EF4444]/3 pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-2.5 left-2.5 grid h-6 w-6 place-items-center rounded-lg bg-black/40 border border-white/10 text-[10px] font-bold text-white/70",
						children: index + 1
					}),
					assignment.seen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-lg bg-white/10 text-white/70",
						title: "Already viewed",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#EF4444]/25 to-[#B91C1C]/25 border border-[#EF4444]/20 mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-6 w-6 text-white/80" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-sm sm:text-base font-bold tracking-tight px-1 line-clamp-2",
						children: assignment.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50",
						children: "Tap to reveal"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flip-face flip-back flex flex-col items-center justify-center p-3 bg-gradient-to-br ${meta.bg} border border-white/15 ${meta.glow}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-2.5 left-2.5 grid h-6 w-6 place-items-center rounded-lg bg-black/40 text-[10px] font-bold text-white/80",
						children: index + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							scale: .6,
							opacity: 0
						},
						animate: open ? {
							scale: 1,
							opacity: 1
						} : {
							scale: .6,
							opacity: 0
						},
						transition: {
							delay: open ? .25 : 0,
							type: "spring",
							stiffness: 240,
							damping: 18
						},
						className: `grid h-16 w-16 place-items-center rounded-2xl bg-black/40 ${meta.text} mb-2`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-8 w-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-xs font-semibold text-white/90 line-clamp-1 px-1",
						children: assignment.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mt-1 text-base font-black ${meta.text}`,
						children: meta.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 text-center text-[10px] leading-snug text-white/70 px-1 line-clamp-3",
						children: meta.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/90 border border-white/15",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " Hide Role"]
					})
				]
			})]
		})
	});
}
function AnalyticsOverlay({ rounds, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		className: "fixed inset-0 z-[60] grid place-items-center bg-black/80 backdrop-blur-md p-4",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				scale: .95,
				opacity: 0,
				y: 10
			},
			animate: {
				scale: 1,
				opacity: 1,
				y: 0
			},
			exit: {
				scale: .95,
				opacity: 0,
				y: 10
			},
			className: "glass rounded-3xl p-5 max-w-xl w-full max-h-[85vh] flex flex-col relative border border-white/10 shadow-2xl",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4 pb-4 border-b border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 place-items-center rounded-xl bg-white/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-5 w-5 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-bold font-display tracking-tight",
						children: "Game Analytics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-white/50",
						children: "Round history & stats"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "grid h-9 w-9 place-items-center rounded-xl bg-white/5 hover:bg-white/10 transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto pr-2 space-y-4 font-sans",
				children: rounds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center py-10 text-white/40 text-sm",
					children: "No rounds recorded yet."
				}) : rounds.map((round) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-white/[0.03] border border-white/5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm font-bold text-white mb-3",
							children: ["Round ", round.roundNumber]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-black/30 rounded-xl p-2.5 border border-white/5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/40 block mb-1",
										children: "Mafia Kill"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-white",
										children: round.choices.mafiaKill || "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-black/30 rounded-xl p-2.5 border border-white/5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/40 block mb-1",
										children: "Doctor Save"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-white",
										children: round.choices.doctorSave || "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-black/30 rounded-xl p-2.5 border border-white/5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/40 block mb-1",
										children: "Police Suspect"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-white",
										children: round.choices.policeSuspect || "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-black/30 rounded-xl p-2.5 border border-white/5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/40 block mb-1",
										children: "Voted Out"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-white",
										children: round.choices.votedOut || "—"
									})]
								})
							]
						}),
						round.eliminated.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 pt-3 border-t border-white/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] uppercase tracking-wider text-[#FCA5A5] font-bold block mb-1.5",
								children: [
									"Eliminated (",
									round.eliminated.length,
									"/2 Max)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: round.eliminated.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 rounded-lg bg-[#DC2626]/20 text-[#FCA5A5] px-2.5 py-1 text-xs font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "h-3 w-3" }),
										" ",
										name
									]
								}, name))
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 pt-3 border-t border-white/5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-wider text-emerald-400 font-bold block",
								children: "No eliminations this round."
							})
						})
					]
				}, round.roundNumber))
			})]
		})
	});
}
//#endregion
export { MafiaModerator as default };
