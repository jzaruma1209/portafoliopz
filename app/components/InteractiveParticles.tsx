"use client";

import { useCallback, useState } from "react";

interface ParticleData {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  color: string;
  delay: string;
}

const particlesData: ParticleData[] = [
  // Las 3 originales
  {
    top: "-16px",
    right: "-16px",
    size: 32,
    color: "bg-red-500",
    delay: "0.5s",
  },
  { bottom: "-8px", left: "-24px", size: 24, color: "bg-red-400", delay: "1s" },
  { top: "50%", right: "-32px", size: 16, color: "bg-red-300", delay: "1.5s" },
  // 2 nuevas
  { top: "15%", left: "-20px", size: 20, color: "bg-red-400", delay: "0.8s" },
  {
    bottom: "20%",
    right: "-20px",
    size: 28,
    color: "bg-red-500",
    delay: "1.2s",
  },
];

export default function InteractiveParticles() {
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>(
    particlesData.map(() => ({ x: 0, y: 0 })),
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const newOffsets = particlesData.map((_, idx) => {
      const intensity = 0.1 + idx * 0.03;
      return {
        x: dx * intensity,
        y: dy * intensity,
      };
    });

    setOffsets(newOffsets);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffsets(particlesData.map(() => ({ x: 0, y: 0 })));
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute -inset-12"
      style={{ zIndex: 5 }}
    >
      {particlesData.map((p, idx) => (
        <div
          key={idx}
          className={`absolute rounded-full ${p.color} animate-float`}
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            animationDelay: p.delay,
            transform: `translate(${offsets[idx].x}px, ${offsets[idx].y}px)`,
            transition: "transform 0.25s ease-out",
          }}
        />
      ))}
    </div>
  );
}
