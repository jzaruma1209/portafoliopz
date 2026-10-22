"use client";

import { useEffect, useRef, useState } from "react";
import InteractiveParticles from "@/app/components/InteractiveParticles";
import BubbleIntro from "@/app/components/paul3d/BubbleIntro";
import { printSans, printSlab } from "@/app/components/paul3d/fonts";
import { pickPhrase } from "@/app/components/paul3d/phrases";
import type { PaulScene } from "@/app/components/paul3d/createPaulScene";

// Caja del personaje respecto al círculo: algo más grande, como si saliera de él
const CHARACTER_BOX = { width: "110%", height: "125%", bottom: "-2%" };
// Las burbujas de carga se ven al menos este tiempo y luego tarda esto en reventar (ms)
const INTRO_MIN_MS = 900, BURST_MS = 700;

/**
 * Avatar de la portada: el personaje voxel 3D animado de Paul.
 * Mientras carga Three.js se ven burbujas en el círculo; al estar listo la
 * burbuja revienta y aparece él. Sin WebGL (o si el 3D falla) queda solo el círculo.
 */
export default function PaulAvatar3D() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [minShown, setMinShown] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  // Globo de diálogo: `id` cambia en cada frase para repetir la animación de entrada
  const [speech, setSpeech] = useState({ text: "", show: false, id: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;
    if (!("WebGLRenderingContext" in window)) {
      setFailed(true);
      return;
    }

    let scene: PaulScene | null = null;
    let cancelled = false;
    // Three.js se carga aparte para no engordar el bundle inicial de la página
    import("@/app/components/paul3d/createPaulScene")
      .then(({ createPaulScene }) => {
        if (cancelled) return;
        scene = createPaulScene({
          host,
          interaction: root,
          fonts: { slab: printSlab.style.fontFamily, sans: printSans.style.fontFamily },
          onReady: () => setReady(true),
          onSay: (kind) =>
            setSpeech((s) => (kind ? { text: pickPhrase(kind, s.text), show: true, id: s.id + 1 } : { ...s, show: false })),
        });
      })
      .catch((err) => {
        console.error("No se pudo iniciar el personaje 3D", err);
        setFailed(true);
      });

    return () => {
      cancelled = true;
      scene?.dispose();
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setMinShown(true), INTRO_MIN_MS);
    return () => window.clearTimeout(t);
  }, []);

  const revealed = ready && minShown;
  useEffect(() => {
    if (!revealed) return;
    const t = window.setTimeout(() => setIntroDone(true), BURST_MS);
    return () => window.clearTimeout(t);
  }, [revealed]);

  return (
    // El padding superior reserva el espacio por el que la cabeza sale del círculo
    <div className="flex flex-col items-center pt-8 sm:pt-12 lg:pt-16">
      <div
        ref={rootRef}
        role="img"
        aria-label="Paul Zaruma, desarrollador web en La Troncal, Cañar"
        className="relative select-none touch-pan-y"
      >
        {/* Círculos decorativos */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 lg:w-[28rem] md:h-80 lg:h-[28rem] rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center animate-float">
          <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 lg:w-96 md:h-72 lg:h-96 rounded-full bg-gradient-to-br from-red-500/30 to-red-900/30" />
        </div>

        {/* Zona táctil del personaje: la cabeza sale del círculo y también debe responder al toque */}
        <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2" style={{ ...CHARACTER_BOX, zIndex: 4 }} />

        {/* Personaje 3D */}
        <div
          ref={hostRef}
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${revealed ? "animate-paul-pop" : "opacity-0"}`}
          style={{ ...CHARACTER_BOX, zIndex: 6 }}
        />

        {/* Burbujas de carga que revientan cuando aparece el personaje */}
        {!failed && !introDone && <BubbleIntro phase={revealed ? "burst" : "loading"} />}

        {/* Globo de diálogo: la escena lo coloca junto a la boca (--say-x / --say-y) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-10 transition-opacity duration-300 ${speech.show ? "opacity-100" : "opacity-0"}`}
          style={{
            left: "var(--say-x, 60%)",
            top: "var(--say-y, 20%)",
            transform: "translate(calc(-6px - var(--say-shift, 0px)), calc(-100% - 12px))",
          }}
        >
          {speech.text && (
            <div
              key={speech.id}
              className="animate-say-in origin-bottom-left relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm md:text-base leading-snug text-slate-900 dark:text-white shadow-xl"
              style={{ width: "max-content", maxWidth: "min(15rem, max(7.5rem, var(--say-room, 15rem)))" }}
            >
              {speech.text}
              {/* Colita hacia la boca (compensa el corrimiento del globo) */}
              <span
                className="absolute -bottom-[6px] h-3 w-3 rotate-45 border-b border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                style={{ left: "calc(8px + var(--say-shift, 0px))" }}
              />
            </div>
          )}
        </div>

        {/* Partículas interactivas */}
        <InteractiveParticles />
      </div>

      <p
        className={`mt-6 md:mt-8 text-xs text-slate-500 dark:text-slate-400 transition-opacity duration-700 ${revealed ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!revealed}
      >
        <span className="hidden pointer-fine:inline">Arrástrame para girarme · clic para que te salude</span>
        <span className="pointer-fine:hidden">Tócame para que te salude</span>
      </p>
    </div>
  );
}
