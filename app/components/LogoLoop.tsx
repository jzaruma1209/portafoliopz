"use client";

import { motion } from "motion/react";
import React from "react";

interface LogoItem {
  node?: React.ReactNode;
  title?: string;
  href?: string;
  src?: string;
  alt?: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
}

const LogoLoop = ({
  logos,
  speed = 100,
  direction = "left",
  logoHeight = 60,
  gap = 60,
  hoverSpeed = 0,
  scaleOnHover = true,
  fadeOut = true,
  fadeOutColor = "var(--background, #0f172a)",
  ariaLabel = "Technology partners",
}: LogoLoopProps) => {
  // Combine logos multiple times to create a seamless loop
  const loopLogos = [...logos, ...logos, ...logos, ...logos];
  
  return (
    <div
      aria-label={ariaLabel}
      className={`relative w-full overflow-hidden flex items-center ${fadeOut ? "mask-edges" : ""}`}
      style={{ height: `${logoHeight + 40}px` }}
    >
      {fadeOut && (
        <style dangerouslySetInnerHTML={{ __html: `
          .mask-edges {
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          }
        `}} />
      )}
      
      <motion.div
        className="flex whitespace-nowrap items-center"
        style={{ gap: `${gap}px` }}
        animate={{
          x: direction === "left" ? ["0%", "-25%"] : ["-25%", "0%"],
        }}
        transition={{
          duration: (logos.length * 100) / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {loopLogos.map((item, index) => (
          <a
            key={index}
            href={item.href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors duration-300 ${
              scaleOnHover ? "hover:scale-110" : ""
            }`}
            style={{ height: `${logoHeight}px`, minWidth: `${logoHeight}px` }}
            title={item.title}
          >
            {item.node ? (
              <div style={{ fontSize: `${logoHeight}px` }}>{item.node}</div>
            ) : item.src ? (
              <img src={item.src} alt={item.alt} style={{ height: "100%", width: "auto" }} />
            ) : (
              item.title
            )}
          </a>
        ))}
      </motion.div>
    </div>
  );
};

export default LogoLoop;
