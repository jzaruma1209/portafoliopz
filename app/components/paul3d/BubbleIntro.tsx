import type { CSSProperties } from "react";

// Burbujitas que suben mientras carga: x en %, tamaño en px, retraso en s, vaivén en px
const RISING = [
  { x: 18, size: 12, delay: 0, drift: 10 },
  { x: 32, size: 20, delay: 0.9, drift: -12 },
  { x: 46, size: 9, delay: 0.4, drift: 8 },
  { x: 58, size: 16, delay: 1.5, drift: -8 },
  { x: 70, size: 11, delay: 0.7, drift: 12 },
  { x: 80, size: 18, delay: 1.9, drift: -10 },
  { x: 26, size: 8, delay: 2.2, drift: 6 },
  { x: 64, size: 7, delay: 1.1, drift: -6 },
];
// Gotas que salen disparadas cuando revienta la burbuja grande (ángulo en grados)
const DROPS = Array.from({ length: 10 }, (_, i) => i * 36 + (i % 2 ? 14 : 0));

/**
 * Animación de carga del personaje: burbujitas que suben y una burbuja grande que
 * lo "envuelve". En la fase `burst` la burbuja revienta y él aparece.
 */
export default function BubbleIntro({ phase }: { phase: "loading" | "burst" }) {
  const burst = phase === "burst";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: 7 }}>
      <div
        className={`absolute inset-[8%] overflow-hidden rounded-full transition-opacity duration-200 ${burst ? "opacity-0" : "opacity-100"}`}
        style={{ containerType: "size" }}
      >
        {RISING.map((b, i) => (
          <span
            key={i}
            className="intro-bubble intro-rise"
            style={{ left: `${b.x}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s`, "--drift": `${b.drift}px` } as CSSProperties}
          />
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2" style={{ containerType: "size" }}>
        <div className="intro-grow absolute inset-0">
          <span className={`intro-bubble inset-0 ${burst ? "intro-pop" : "intro-wobble"}`} />
        </div>
        {burst && (
          <>
            <span className="intro-ring absolute inset-0 rounded-full" />
            {DROPS.map((a) => (
              <span key={a} className="intro-bubble intro-drop" style={{ "--a": `${a}deg` } as CSSProperties} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
