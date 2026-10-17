"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";
import PaulAvatar3D from "@/app/components/PaulAvatar3D";
import SplitText from "@/app/components/SplitText";
import TextType from "@/app/components/TextType";
import ShinyText from "@/app/components/ShinyText";

import LogoLoop from '@/app/components/LogoLoop';
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiNodedotjs, SiMongodb, SiN8N, SiSupabase, SiPostgresql, SiDocker, SiLinux, SiWhatsapp } from 'react-icons/si';
import { FiLayers, FiCode, FiZap, FiMessageCircle, FiShoppingCart, FiServer, FiMapPin, FiChevronDown } from 'react-icons/fi';
import Image from "next/image";
import { siteConfig, faqList } from "@/lib/seo";

const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiNodedotjs />, title: 'Node.js', href: 'https://nodejs.org' },
  { node: <SiN8N />, title: 'n8n', href: 'https://n8n.io' },
  { node: <SiSupabase />, title: 'Supabase', href: 'https://supabase.com' },
  { node: <SiPostgresql />, title: 'PostgreSQL', href: 'https://www.postgresql.org' },
  { node: <SiWhatsapp />, title: 'WhatsApp Business API', href: 'https://business.whatsapp.com' },
  { node: <SiDocker />, title: 'Docker', href: 'https://www.docker.com' },
  { node: <SiLinux />, title: 'Linux', href: 'https://www.linux.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { node: <SiMongodb />, title: 'MongoDB', href: 'https://www.mongodb.com' }
];

const servicesList = [
  {
    icon: <FiLayers />,
    title: "Arquitectura de Software",
    description: "Diseño sistemas sólidos desde el inicio: estructura de capas, modelado de datos, APIs bien definidas y decisiones técnicas pensadas para que tu producto crezca sin reescribirse."
  },
  {
    icon: <FiCode />,
    title: "Desarrollo Web Full-stack",
    description: "Aplicaciones web y plataformas a medida con React, Next.js y Node.js. Interfaces rápidas y cuidadas, conectadas a un backend seguro y mantenible."
  },
  {
    icon: <FiZap />,
    title: "Automatización con n8n",
    description: "Automatizo procesos repetitivos de tu negocio: ventas, notificaciones, reportes, CRM y flujos entre herramientas. Corriendo en mi propio servidor n8n, sin depender de planes limitados."
  },
  {
    icon: <FiMessageCircle />,
    title: "Chatbots de WhatsApp con IA",
    description: "Asistentes inteligentes en WhatsApp y Messenger que responden, venden y atienden 24/7, conectados a tu base de conocimiento, catálogo e inventario."
  },
  {
    icon: <FiShoppingCart />,
    title: "E-commerce Integrado",
    description: "Tiendas online completas, con pagos, gestión de pedidos y atención automatizada por WhatsApp. Tu cliente compra, consulta y recibe seguimiento sin fricción."
  },
  {
    icon: <FiServer />,
    title: "APIs, Infraestructura y Testing",
    description: "Integración de APIs y webhooks, despliegue en servidores propios con Docker y Linux, y pruebas para que cada entrega llegue a producción estable y confiable."
  }
];

const projectsList = [
  {
    id: 1,
    title: "Fortune Cookie 3D",
    description: "Experiencia web interactiva con gráficos 3D en tiempo real y animaciones fluidas. El proyecto combina renderizado 3D mediante Three.js con animaciones dinámicas creadas con GSAP, todo gestionado con React y estilizado con Tailwind CSS para un diseño responsive y moderno.",
    image: "/proyect1.png",
    link: "https://galleta-de-la-fortuna-red.vercel.app/",
    tags: [
      "React 18.3.1", 
      "Vite 5.3.4", 
      "Three.js 0.167.0", 
      "@react-three/fiber", 
      "GSAP 3.14.2", 
      "@gsap/react", 
      "Tailwind CSS 3.4.6", 
      "PostCSS", 
      "Autoprefixer", 
      "ESLint"
    ]
  },
  {
    id: 2,
    title: "Proyecto 2",
    description: "Descripción del proyecto 2. Una solución moderna desarrollada para resolver problemas complejos con tecnologías de última generación.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    link: "#",
    tags: ["Next.js", "Tailwind"]
  },
  {
    id: 3,
    title: "Proyecto 3",
    description: "Descripción del proyecto 3. Una solución moderna desarrollada para resolver problemas complejos con tecnologías de última generación.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    link: "#",
    tags: ["Next.js", "Tailwind"]
  }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;

    const controlNavbar = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrolled = currentY > 0;
        const visible = !(currentY > lastScrollY.current && currentY > 100);

        // Only update state when values actually change
        setIsScrolled(prev => prev !== scrolled ? scrolled : prev);
        setIsVisible(prev => {
          if (prev !== visible) {
            if (!visible) setMenuOpen(false);
            return visible;
          }
          return prev;
        });

        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => window.removeEventListener("scroll", controlNavbar);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 transition-all duration-300 ${isScrolled ? "backdrop-blur-md bg-white/90 dark:bg-[#0f172a]/90 shadow-sm" : "bg-transparent"
          } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="text-xl font-bold z-50">
            Paul<span className="text-red-500">.dev</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="hover:text-red-400 transition-colors">
              ¿Quién soy?
            </a>
            <a href="#services" className="hover:text-red-400 transition-colors">
              Servicios
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
            href="#services"
            onClick={() => setMenuOpen(false)}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            Servicios
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
        <div className="bg-text bg-text-1 left-0" aria-hidden="true">
          ARCHITECT
        </div>
        <div className="bg-text bg-text-2 right-0" aria-hidden="true">
          AUTOMATION
        </div>
        <div className="bg-text bg-text-3 left-1/4" aria-hidden="true">
          FULL-STACK
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
                texts={["Arquitecto de Software", "Full-stack Developer", "Experto en Automatización", "Chatbots con IA"]}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500 min-h-[40px] md:min-h-[48px]"
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="_"
                deletingSpeed={50}
              />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-lg mx-auto md:mx-0 opacity-0 animate-fade-in animation-delay-600">
              Diseño y construyo sistemas digitales completos: desde la
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                arquitectura
              </span>{" "}
              y el backend hasta aplicaciones en
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                React
              </span>{" "}
              y
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                Next.js
              </span>
              , automatizaciones con
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                n8n
              </span>{" "}
              y chatbots de
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                WhatsApp
              </span>{" "}
              con inteligencia artificial.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-lg mx-auto md:mx-0 opacity-0 animate-fade-in animation-delay-600">
              Administro mi propia infraestructura: servidores, n8n self-hosted, APIs y bases de datos. Entrego soluciones
              <span className="text-slate-900 dark:text-white font-medium">
                {" "}
                listas para producción
              </span>
              : probadas, seguras y preparadas para escalar con tu negocio.
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2 text-sm md:text-base text-slate-500 dark:text-slate-400 opacity-0 animate-fade-in animation-delay-600">
              <FiMapPin className="text-red-500 shrink-0" aria-hidden="true" />
              <span>
                Desarrollador web en <span className="text-slate-900 dark:text-white font-medium">La Troncal, Cañar</span> · Proyectos en todo Ecuador
              </span>
            </p>
            <div className="pt-4 opacity-0 animate-fade-in animation-delay-600">
              <a
                href="#contact"
                className="btn-gradient inline-block px-6 md:px-8 py-3 md:py-4 rounded-lg text-white font-semibold text-sm md:text-base"
              >
                ¡Hablemos de tu proyecto!
              </a>
            </div>
          </div>

          {/* Avatar: personaje voxel 3D animado */}
          <div className="flex justify-center items-center order-1 md:order-2">
            <PaulAvatar3D />
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
              Soy desarrollador de software full-stack con enfoque en arquitectura y automatización. Ayudo a empresas y emprendedores a convertir procesos manuales en sistemas que trabajan solos: más ventas, menos tareas repetitivas y una operación que escala.
            </p>
            <p>
              Mi trabajo abarca todo el ciclo: diseño la arquitectura, desarrollo el frontend y el backend, integro APIs y webhooks, construyo flujos de automatización en n8n y conecto chatbots de WhatsApp con inteligencia artificial a tiendas online, CRMs y bases de datos. Todo corre sobre mi propio servidor, con control total sobre rendimiento, seguridad y costos.
            </p>
            <p>
              Trabajo desde La Troncal, en la provincia del Cañar, con negocios de la zona a los que puedo visitar en persona, y con clientes de todo Ecuador de forma remota.
            </p>
            <p>
              No solo escribo código: pruebo, despliego y mantengo. Mi objetivo es que cada solución resuelva un problema real del negocio y siga funcionando el día que más la necesitas.
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

      {/* Services Section */}
      <section
        id="services"
        className="py-20 md:py-28 px-4 md:px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-6xl w-full mx-auto text-center">
          <SplitText
            text="¿Qué puedo hacer por ti?"
            className="text-3xl md:text-4xl font-bold mb-3 md:mb-4"
            tag="h2"
            delay={60}
            duration={0.8}
          />
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 md:mb-14 max-w-2xl mx-auto">
            Soluciones de punta a punta: desde la idea y la arquitectura hasta un sistema automatizado funcionando en producción.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">
            {servicesList.map((service) => (
              <div
                key={service.title}
                className="group flex flex-col gap-4 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-red-400 dark:hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500 text-2xl group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-20 md:py-28 px-4 md:px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-5xl w-full mx-auto text-center">
          <SplitText
            text="Mis Proyectos"
            className="text-3xl md:text-4xl font-bold mb-6 md:mb-12"
            tag="h2"
            delay={60}
            duration={0.8}
          />
        </div>

        <div className="w-full max-w-5xl mx-auto">
          <ScrollStack
            itemDistance={120}
            itemScale={0.04}
            itemStackDistance={40}
            stackPosition="25%"
            scaleEndPosition="10%"
            baseScale={0.9}
            rotationAmount={0}
            blurAmount={2}
            useWindowScroll={true}
          >
            {projectsList.map((project) => (
              <ScrollStackItem key={project.id}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col md:flex-row min-h-[380px]">
                  <div className="w-full md:w-1/2 relative h-56 md:h-auto bg-slate-100 dark:bg-slate-700">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-left">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-3 py-1 text-xs font-semibold bg-red-500/10 text-red-500 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">{project.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex gap-4">
                      {project.link !== "#" ? (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors">
                          Ver proyecto
                        </a>
                      ) : (
                        <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors">
                          Ver proyecto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-20 md:py-28 px-4 md:px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-3xl w-full mx-auto">
          <div className="text-center">
            <SplitText
              text="Preguntas frecuentes"
              className="text-3xl md:text-4xl font-bold mb-10 md:mb-14"
              tag="h2"
              delay={60}
              duration={0.8}
            />
          </div>
          <div className="space-y-4">
            {faqList.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 open:border-red-400 dark:open:border-red-500 transition-colors duration-300"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 font-semibold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base md:text-lg">{faq.question}</h3>
                  <FiChevronDown className="shrink-0 text-red-500 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 md:px-6 pb-5 md:pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
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
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">
            ¿Tienes un proceso que automatizar, una tienda que lanzar o un sistema que escalar? Escríbeme y lo convertimos en una solución real.
          </p>
          <p className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-10 md:mb-14">
            <FiMapPin className="text-red-500 shrink-0" aria-hidden="true" />
            {siteConfig.city}, {siteConfig.region} · Atiendo en todo {siteConfig.country}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {/* Email */}
            <a
              href={`mailto:${siteConfig.email}`}
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
                  {siteConfig.email}
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
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
