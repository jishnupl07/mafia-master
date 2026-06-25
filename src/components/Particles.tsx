import { useMemo } from "react";

export function Particles({ count = 24 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 12 + Math.random() * 18,
        delay: -Math.random() * 20,
        opacity: 0.2 + Math.random() * 0.6,
        hue: Math.random() > 0.5 ? "oklch(0.7 0.18 295)" : "oklch(0.75 0.15 210)",
      })),
    [count],
  );
  return (
    <div className="particles" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.hue}`,
          }}
        />
      ))}
    </div>
  );
}
