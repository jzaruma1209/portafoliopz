"use client";

import ThemeToggle from "@/app/components/ThemeToggle";
import InteractiveParticles from "@/app/components/InteractiveParticles";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/80 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="text-xl font-bold">
            Paul<span className="text-red-500">.dev</span>
          </a>
          <div className="flex items-center gap-8">
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Text */}
        <div className="bg-text left-0" style={{ top: "5%" }}>
          PASSIONATE
        </div>
        <div className="bg-text right-0" style={{ top: "30%" }}>
          DEVELOPER
        </div>
        <div className="bg-text left-1/4" style={{ bottom: "5%" }}>
          CREATIVE
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Content */}
          <div className="space-y-6">
            <p className="text-red-400 text-lg opacity-0 animate-fade-in">
              Hola, mi nombre es
            </p>
            <h1 className="text-5xl md:text-7xl font-bold opacity-0 animate-fade-in animation-delay-200">
              Paul Zaruma
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-red-500 opacity-0 animate-fade-in animation-delay-400">
              Full-stack Developer
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg opacity-0 animate-fade-in animation-delay-600">
              Apasionado por crear soluciones web excepcionales. Experiencia en
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
                Node.js
              </span>
              . Comprometido con el código limpio y las mejores prácticas.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg opacity-0 animate-fade-in animation-delay-600">
              Enfocado no solo en desarrollar software de calidad, sino también
              en compartir conocimiento y ayudar a otros desarrolladores a
              crecer.
            </p>
            <div className="pt-4 opacity-0 animate-fade-in animation-delay-600">
              <a
                href="#contact"
                className="btn-gradient inline-block px-8 py-4 rounded-lg text-white font-semibold"
              >
                ¡Contáctame!
              </a>
            </div>
          </div>

          {/* Avatar/Illustration placeholder */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center animate-float">
                <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-red-500/30 to-red-900/30 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/paul.png"
                    alt="Paul Zaruma"
                    width={400}
                    height={400}
                    className="w-100 h-100 md:w-100 md:h-100 rounded-full object-cover"
                    priority
                  />
                </div>
              </div>
              {/* Decorative elements - Interactive particles */}
              <InteractiveParticles />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-sm">Scroll</span>
          <div className="w-6 h-10 border-2 border-slate-400 dark:border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-slate-600 dark:bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* About Section Placeholder */}
      <section
        id="about"
        className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8">¿Quién soy?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Esta sección estará próximamente disponible...
          </p>
        </div>
      </section>

      {/* Projects Section Placeholder */}
      <section
        id="projects"
        className="min-h-screen flex items-center justify-center px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8">Mis Proyectos</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Esta sección estará próximamente disponible...
          </p>
        </div>
      </section>

      {/* Contact Section Placeholder */}
      <section
        id="contact"
        className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8">Contacto</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Esta sección estará próximamente disponible...
          </p>
        </div>
      </section>
    </div>
  );
}
