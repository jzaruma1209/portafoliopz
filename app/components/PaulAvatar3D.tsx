"use client";

import { useEffect, useRef, useState } from "react";
import InteractiveParticles from "@/app/components/InteractiveParticles";
import { printSans, printSlab } from "@/app/components/paul3d/fonts";
import type { PaulScene } from "@/app/components/paul3d/createPaulScene";

type Status = "loading" | "ready" | "error";

/**
 * Three.js y las fuentes del estampado se piden en cuanto el navegador evalúa
 * este módulo (antes de hidratar) y en paralelo, para que el personaje 3D
 * aparezca lo antes posible. Three.js va en su propio chunk para no engordar
 * el bundle inicial de la página.
 */
function preloadScene() {
  if (typeof window === "undefined" || !("WebGLRenderingContext" in window)) return null;
  document.fonts?.load(`900 200px ${printSlab.style.fontFamily}`).catch(() => {});
  document.fonts?.load(`700 100px ${printSans.style.fontFamily}`).catch(() => {});
  const promise = import("@/app/components/paul3d/createPaulScene");
  promise.catch(() => {}); // el error se gestiona en el efecto
  return promise;
}
const scenePromise = preloadScene();

/** Avatar de la portada: el personaje voxel 3D animado de Paul. */
export default function PaulAvatar3D() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const ready = status === "ready";

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;

    let scene: PaulScene | null = null;
    let cancelled = false;
    (scenePromise ?? Promise.reject(new Error("WebGL no disponible")))
      .then(({ createPaulScene }) => {
        if (cancelled) return;
        scene = createPaulScene({
          host,
          interaction: root,
          fonts: { slab: printSlab.style.fontFamily, sans: printSans.style.fontFamily },
          onReady: () => setStatus("ready"),
        });
      })
      .catch((err) => {
        console.error("No se pudo iniciar el personaje 3D", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      scene?.dispose();
    };
  }, []);

  return (
    // El padding superior reserva el espacio por el que la cabeza sale del círculo
    <div className="flex flex-col items-center pt-12 sm:pt-16 lg:pt-24">
      <div
        ref={rootRef}
        role="img"
        aria-label="Personaje 3D animado de Paul Zaruma, desarrollador web en La Troncal, Cañar"
        className="relative select-none touch-pan-y"
      >
        {/* Círculos decorativos */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 lg:w-[28rem] md:h-80 lg:h-[28rem] rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center animate-float">
          <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 lg:w-96 md:h-72 lg:h-96 rounded-full bg-gradient-to-br from-red-500/30 to-red-900/30 flex items-center justify-center">
            {/* Indicador de carga mientras llega el personaje 3D */}
            {status === "loading" && (
              <span
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* Personaje 3D: más grande que el círculo, como si saliera de él */}
        <div
          ref={hostRef}
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
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
