export type RoleKey = "mafia" | "doctor" | "police" | "civilian";

export interface RoleMeta {
  key: RoleKey;
  name: string;
  description: string;
  emoji: string;
  colorVar: string;
  ring: string;
  text: string;
  glow: string;
  bg: string;
}

export const ROLES: Record<RoleKey, RoleMeta> = {
  mafia: {
    key: "mafia",
    name: "Mafia",
    description: "Eliminate one player each night.",
    emoji: "🔪",
    colorVar: "var(--mafia)",
    ring: "ring-[#DC2626]/50",
    text: "text-[#FCA5A5]",
    glow: "shadow-[0_0_40px_-8px_#DC262699]",
    bg: "from-[#DC2626]/30 to-[#7f1d1d]/60",
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
    bg: "from-[#16A34A]/30 to-[#14532d]/60",
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
    bg: "from-[#2563EB]/30 to-[#1e3a8a]/60",
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
    bg: "from-slate-500/30 to-slate-800/60",
  },
};

export function fisherYates<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
