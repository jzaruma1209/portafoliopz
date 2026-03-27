"use client";

import { motion } from "motion/react";

interface ShinyTextProps {
  text?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: "left" | "right";
  yoyo?: boolean;
  pauseOnHover?: boolean;
  delay?: number;
}

const ShinyText = ({
  text,
  children,
  disabled = false,
  speed = 5,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  direction = "left",
  yoyo = true,
  pauseOnHover = true,
  delay = 0,
}: ShinyTextProps) => {
  const content = children || text;

  if (disabled) return <span className={className}>{content}</span>;

  return (
    <span
      className={`inline-block text-transparent bg-clip-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(${
          direction === "left" ? "270deg" : "90deg"
        }, ${color} 0%, ${color} ${50 - (spread/4)}%, ${shineColor} 50%, ${color} ${50 + (spread/4)}%, ${color} 100%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}
    >
      <motion.span
        animate={{
          backgroundPosition: direction === "left" ? ["100% 0", "-100% 0"] : ["-100% 0", "100% 0"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          repeatType: yoyo ? "reverse" : "loop",
          ease: "linear",
          delay: delay,
        }}
        style={{
          display: "inline-block",
          width: "100%",
          backgroundImage: "inherit",
          backgroundSize: "inherit",
          WebkitBackgroundClip: "text",
          color: "transparent",
          pointerEvents: "none"
        }}
        whileHover={pauseOnHover ? { animationPlayState: "paused" } : {}}
      >
        <span style={{ pointerEvents: "auto" }}>{content}</span>
      </motion.span>
    </span>
  );
};


export default ShinyText;
