"use client";

import { useState } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";
import InteractiveParticles from "@/app/components/InteractiveParticles";
import SplitText from "@/app/components/SplitText";
import TextType from "@/app/components/TextType";
import ShinyText from "@/app/components/ShinyText";
import ScrollStack, { ScrollStackItem } from '@/app/components/ScrollStack';
import LogoLoop from '@/app/components/LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiNodedotjs, SiMongodb } from 'react-icons/si';
import Image from "next/image";

const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiNodedotjs />, title: 'Node.js', href: 'https://nodejs.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { node: <SiMongodb />, title: 'MongoDB', href: 'https://www.mongodb.com' }
];

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
            <div className="opacity-0 animate-fade-in animation-delay-200">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold">
                <ShinyText
                  text="Paul Zaruma"
                  speed={2}
                  delay={0}
                  color="var(--color-foreground)"
                  shineColor="var(--color-accent)"
                  spread={120}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={false}
                  disabled={false}
                />
              </h1>
            </div>
            <div className="opacity-0 animate-fade-in animation-delay-400">
              <TextType
                texts={["Full-stack Developer", "Frontend Developer", "Backend Developer"]}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500 min-h-[40px] md:min-h-[48px]"
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="_"
                deletingSpeed={50}
              />
            </div>
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
        className="py-20 md:py-28 flex items-center justify-center px-4 md:px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300"
      >
          <div className="max-w-4xl text-center">
            <SplitText
              text="¿Quién soy?"
              className="text-3xl md:text-4xl font-bold mb-6 md:mb-8"
              tag="h2"
              delay={60}
              duration={0.8}
            />
          <div className="text-slate-600 dark:text-slate-300 text-lg md:text-xl space-y-4 text-left">
            <p>
              Soy desarrollador de software enfocado en crear herramientas digitales que ayuden a negocios y personas a trabajar mejor, automatizar procesos y crecer en el mundo digital.
            </p>
            <p>
              Utilizo tecnologías modernas y cuento con una amplia experiencia trabajando con inteligencia artificial y herramientas actuales del ecosistema tecnológico. Además, poseo fundamentos sólidos en desarrollo de software, lo que me permite construir soluciones escalables, mantenibles y orientadas a resultados.
            </p>
            <p>
              Me apasiona la programación porque combina lógica, creatividad y resolución de problemas reales. Disfruto convertir ideas en soluciones funcionales que aporten valor.
            </p>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 w-full overflow-hidden">
            <h3 className="text-center font-semibold text-slate-500 tracking-widest uppercase text-sm mb-8">Tecnologías Principales</h3>
            <LogoLoop
              logos={techLogos}
              speed={80}
              direction="left"
              logoHeight={45}
              gap={60}
              scaleOnHover
              fadeOut
              ariaLabel="Mi Stack Tecnológico"
            />
          </div>
        </div>
      </section>

      {/* Projects Section Placeholder */}
      <section
        id="projects"
        className="py-20 md:py-28 flex items-center justify-center px-4 md:px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-4xl text-center">
          <SplitText
            text="Mis Proyectos"
            className="text-3xl md:text-4xl font-bold mb-6 md:mb-8"
            tag="h2"
            delay={60}
            duration={0.8}
          />
          <ScrollStack className="mt-12 text-left">
            <ScrollStackItem>
              <h3 className="text-2xl font-bold mb-2">Card 1</h3>
              <p className="text-slate-600 dark:text-slate-400">This is the first card in the stack</p>
            </ScrollStackItem>
            <ScrollStackItem>
              <h3 className="text-2xl font-bold mb-2">Card 2</h3>
              <p className="text-slate-600 dark:text-slate-400">This is the second card in the stack</p>
            </ScrollStackItem>
            <ScrollStackItem>
              <h3 className="text-2xl font-bold mb-2">Card 3</h3>
              <p className="text-slate-600 dark:text-slate-400">This is the third card in the stack</p>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 md:py-28 flex items-center justify-center px-4 md:px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300"
      >
        <div className="max-w-4xl w-full text-center">
          <SplitText
            text="Contacto"
            className="text-3xl md:text-4xl font-bold mb-3 md:mb-4"
            tag="h2"
            delay={60}
            duration={0.8}
          />
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 md:mb-14">
            ¿Quieres trabajar conmigo? Encuéntrame aquí
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {/* Email */}
            <a
              href="mailto:jzaruma1209@gmail.com"
              className="group flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-red-400 dark:hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Email</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-red-400 transition-colors break-all">
                  jzaruma1209@gmail.com
                </p>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/paul-zaruma-lopez-93663b386/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-red-400 dark:hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">LinkedIn</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-red-400 transition-colors">
                  Paul Zaruma López
                </p>
              </div>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/jzaruma1209"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-red-400 dark:hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">GitHub</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-red-400 transition-colors">
                  jzaruma1209
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
