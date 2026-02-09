"use client";

import { useState } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";
import InteractiveParticles from "@/app/components/InteractiveParticles";
import Image from "next/image";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/80 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="text-xl font-bold z-50">
            Paul<span className="text-red-500">.dev</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="hover:text-red-400 transition-colors">
              ¿Quién soy?
            </a>
            <a
              href="#projects"
              className="hover:text-red-400 transition-colors"
            >
              Proyectos
            </a>
            <a href="#contact" className="hover:text-red-400 transition-colors">
              Contacto
            </a>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
              aria-label="Toggle menu"
            >
              <span
                className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-slate-50 dark:bg-[#0f172a] transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-8 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          <a
            href="#about"
            onClick={() => setMenuOpen(false)}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ¿Quién soy?
          </a>
          <a
            href="#projects"
            onClick={() => setMenuOpen(false)}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            Proyectos
          </a>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            Contacto
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start pt-20 md:pt-24">
        {/* Background Text */}
        <div className="bg-text bg-text-1 left-0">
          PASSIONATE
        </div>
        <div className="bg-text bg-text-2 right-0">
          DEVELOPER
        </div>
        <div className="bg-text bg-text-3 left-1/4">
          CREATIVE
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8 grid md:grid-cols-2 gap-2 md:gap-12 items-center relative z-10">
          {/* Content */}
          <div className="space-y-3 md:space-y-6 text-center md:text-left order-2 md:order-1">
            <p className="text-red-400 text-base md:text-lg opacity-0 animate-fade-in">
              Hola, mi nombre es
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold opacity-0 animate-fade-in animation-delay-200">
              Paul Zaruma
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500 opacity-0 animate-fade-in animation-delay-400">
              Full-stack Developer
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-lg mx-auto md:mx-0 opacity-0 animate-fade-in animation-delay-600">
              Desarrollo aplicaciones web modernas con
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                React
              </span>
              ,
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                Next.js
              </span>{" "}
              y
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                Tailwind CSS
              </span>
              , enfocándome en la experiencia del usuario, el diseño limpio y las buenas prácticas en frontend.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-lg mx-auto md:mx-0 opacity-0 animate-fade-in animation-delay-600">
              En backend, trabajo con
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                Node.js
              </span>
              , creando soluciones orientadas al rendimiento, mantenibles y preparadas para escalar.
            </p>
            <div className="pt-4 opacity-0 animate-fade-in animation-delay-600">
              <a
                href="#contact"
                className="btn-gradient inline-block px-6 md:px-8 py-3 md:py-4 rounded-lg text-white font-semibold text-sm md:text-base"
              >
                ¡Contáctame!
              </a>
            </div>
          </div>

          {/* Avatar/Illustration placeholder */}
          <div className="flex justify-center items-center order-1 md:order-2">
            <div className="relative">
              <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 lg:w-[28rem] md:h-80 lg:h-[28rem] rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center animate-float">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 lg:w-96 md:h-72 lg:h-96 rounded-full bg-gradient-to-br from-red-500/30 to-red-900/30 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/paul.png"
                    alt="Paul Zaruma"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
              {/* Decorative elements - Interactive particles */}
              <div>
                <InteractiveParticles />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs md:text-sm">Scroll</span>
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-slate-400 dark:border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-slate-600 dark:bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* About Section Placeholder */}
      <section
        id="about"
        className="min-h-screen flex items-center justify-center px-4 md:px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            ¿Quién soy?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Esta sección estará próximamente disponible...
          </p>
        </div>
      </section>

      {/* Projects Section Placeholder */}
      <section
        id="projects"
        className="min-h-screen flex items-center justify-center px-4 md:px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            Mis Proyectos
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Esta sección estará próximamente disponible...
          </p>
        </div>
      </section>

      {/* Contact Section Placeholder */}
      <section
        id="contact"
        className="min-h-screen flex items-center justify-center px-4 md:px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            Contacto
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Esta sección estará próximamente disponible...
          </p>
        </div>
      </section>
    </div>
  );
}
