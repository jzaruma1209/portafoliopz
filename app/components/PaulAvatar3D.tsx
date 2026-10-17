"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import InteractiveParticles from "@/app/components/InteractiveParticles";
import { printSans, printSlab } from "@/app/components/paul3d/fonts";
import type { PaulScene } from "@/app/components/paul3d/createPaulScene";

/**
 * Avatar de la portada: el personaje voxel 3D animado de Paul.
 * Mientras carga Three.js se ve una animación de carga en el círculo. La imagen
 * /paul.png sigue en el HTML (invisible) para SEO y solo se muestra como
 * respaldo si no hay WebGL, si el 3D falla o si tarda demasiado.
 */
const FALLBACK_MS = 8000;

export default function PaulAvatar3D() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;
    if (!("WebGLRenderingContext" in window)) {
      setFallback(true);
      return;
    }

    const timer = setTimeout(() => setFallback(true), FALLBACK_MS);
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
        });
      })
      .catch((err) => {
        console.error("No se pudo iniciar el personaje 3D", err);
        setFallback(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      scene?.dispose();
    };
  }, []);

  const showImage = fallback && !ready;
  const loading = !ready && !fallback;

  return (
    // El padding superior reserva el espacio por el que la cabeza sale del círculo
    <div className="flex flex-col items-center pt-12 sm:pt-16 lg:pt-24">
      <div ref={rootRef} className="relative select-none touch-pan-y">
        {/* Círculos decorativos */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 lg:w-[28rem] md:h-80 lg:h-[28rem] rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center animate-float">
          <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 lg:w-96 md:h-72 lg:h-96 rounded-full bg-gradient-to-br from-red-500/30 to-red-900/30 flex items-center justify-center overflow-hidden relative">
            <Image
              src="/paul.png"
              alt="Paul Zaruma, desarrollador web en La Troncal, Cañar"
              width={400}
              height={400}
              className={`w-full h-full object-cover transition-opacity duration-700 ${showImage ? "opacity-100" : "opacity-0"}`}
              priority
            />
            {/* Animación de carga mientras llega el personaje 3D */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${loading ? "opacity-100" : "opacity-0"}`}
            >
              <div className="absolute w-2/3 h-2/3 rounded-full bg-red-500/20 animate-ping" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
            </div>
          </div>
        </div>

        {/* Personaje 3D: más grande que el círculo, como si saliera de él */}
        <div
          ref={hostRef}
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 transition duration-700 ease-out ${ready ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          style={{ width: "125%", height: "142%", bottom: "-5%", zIndex: 6 }}
        />

        {/* Partículas interactivas */}
        <InteractiveParticles />
      </div>

      <p
        className={`mt-6 md:mt-8 text-xs text-slate-500 dark:text-slate-400 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!ready}
      >
        <span className="hidden pointer-fine:inline">Arrástrame para girarme · clic para otra animación</span>
        <span className="pointer-fine:hidden">Tócame para ver otra animación</span>
      </p>
    </div>
  );
}
