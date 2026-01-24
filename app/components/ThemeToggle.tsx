"use client";

import { useCallback, useSyncExternalStore } from "react";

// Funciones para useSyncExternalStore
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return savedTheme === "dark" || (!savedTheme && prefersDark);
}

function getServerSnapshot(): boolean {
  return true; // Default to dark mode on server
}

export default function ThemeToggle() {
  const darkMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Sincronizar clase con el DOM
  if (typeof window !== "undefined") {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  const toggleTheme = useCallback(() => {
    const newDarkMode = !darkMode;
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Disparar evento para que useSyncExternalStore detecte el cambio
    window.dispatchEvent(new Event("storage"));
  }, [darkMode]);

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors duration-300 flex items-center p-1"
      aria-label="Toggle theme"
    >
      {/* Sol */}
      <span
        className={`absolute left-1 text-sm transition-opacity duration-300 ${
          darkMode ? "opacity-50" : "opacity-100"
        }`}
      >
        ☀️
      </span>
      {/* Luna */}
      <span
        className={`absolute right-1 text-sm transition-opacity duration-300 ${
          darkMode ? "opacity-100" : "opacity-50"
        }`}
      >
        🌙
      </span>
      {/* Toggle ball */}
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          darkMode ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}
