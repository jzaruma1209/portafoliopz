"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface ScrollStackItemProps {
  children: React.ReactNode;
  index?: number;
  total?: number;
  className?: string;
}

export const ScrollStackItem = ({ 
  children, 
  index = 0, 
  total = 3,
  className = "" 
}: ScrollStackItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  // Subtle scale effect as the next card comes in
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1]); // Keeping it 1 to avoid complex overlap glitches without a main container scroll
  
  // Dynamic top to create the stacking effect where each card stacks slightly lower
  const topOffset = `calc(15vh + ${index * 30}px)`;

  return (
    <motion.div
      ref={ref}
      className="sticky w-full mb-[30vh]"
      style={{ 
        top: topOffset, 
        zIndex: index + 10,
        scale 
      }}
    >
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm dark:bg-slate-800/90 mx-auto w-full ${className}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default function ScrollStack({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={`relative w-full pb-10 ${className}`}>
      {childrenArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
            total: childrenArray.length,
          });
        }
        return child;
      })}
    </div>
  );
}
