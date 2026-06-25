// Lightweight WebAudio sound effects (no assets needed).
let ctx: AudioContext | null = null;
let enabled = true;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}
export function isSoundEnabled() {
  return enabled;
}

function tone(freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.06) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  click: () => tone(520, 0.05, "triangle", 0.05),
  flip: () => {
    tone(380, 0.07, "sine", 0.07);
    setTimeout(() => tone(620, 0.08, "sine", 0.06), 60);
  },
  start: () => {
    tone(440, 0.1, "sine", 0.08);
    setTimeout(() => tone(660, 0.1, "sine", 0.08), 90);
    setTimeout(() => tone(880, 0.16, "sine", 0.08), 180);
  },
};
