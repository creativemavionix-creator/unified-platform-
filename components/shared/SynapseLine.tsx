"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SynapsePoint {
  x: number;
  y: number;
}

interface SynapseLineProps {
  points?: SynapsePoint[];
  className?: string;
  color?: string;
  duration?: number;
  pulseDelay?: number;
}

export function SynapseLine({
  points = [
    { x: 10, y: 15 },
    { x: 100, y: 15 },
    { x: 160, y: 35 },
    { x: 260, y: 35 },
  ],
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  color = "signal",
  duration = 4,
  pulseDelay = 0,
}: SynapseLineProps) {
  const strokeColor = "var(--signal)";

  const pathD = points
    .map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - 10;
  const minY = Math.min(...ys) - 10;
  const width = Math.max(Math.max(...xs) - minX + 10, 1);
  const height = Math.max(Math.max(...ys) - minY + 10, 1);

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className={cn("overflow-visible select-none pointer-events-none w-full h-full opacity-30 z-0", className)}
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1}
        strokeOpacity={0.4}
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.2}
        strokeDasharray="4 6"
        vectorEffect="non-scaling-stroke"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -20 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
        }}
      />
      {points.map((p, idx) => (
        <g key={idx}>
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={5}
            fill={strokeColor}
            vectorEffect="non-scaling-stroke"
            initial={{ scale: 0.8, opacity: 0.1 }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.15, 0.6, 0.15] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pulseDelay + idx * 0.4,
            }}
          />
          <circle cx={p.x} cy={p.y} r={2} fill={strokeColor} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HeaderDivider({ color = "signal" }: { color?: string }) {
  const strokeColor = "var(--signal)";
  const shouldReduceMotion = useReducedMotion();

  const cxKeyframes = [0, 400, 400, 420, 420, 780, 780, 800, 800, 1200];
  const cyKeyframes = [12, 12, 12, 18, 18, 18, 18, 12, 12, 12];
  const timesKeyframes = [0, 0.3, 0.35, 0.4, 0.45, 0.65, 0.7, 0.75, 0.8, 1.0];

  return (
    <div className="h-5 w-full relative overflow-hidden pointer-events-none z-10 opacity-30">
      <svg
        viewBox="0 0 1200 24"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 12 L 400 12 L 420 18 L 780 18 L 800 12 L 1200 12"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        {!shouldReduceMotion && (
          <motion.circle
            r={3}
            fill={strokeColor}
            animate={{
              cx: cxKeyframes,
              cy: cyKeyframes,
            }}
            transition={{
              duration: 5,
              ease: "linear",
              repeat: Infinity,
              times: timesKeyframes,
            }}
            style={{
              filter: `drop-shadow(0 0 3px ${strokeColor})`,
            }}
          />
        )}
      </svg>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ActiveItemTrace({ color = "signal" }: { color?: string }) {
  const strokeColor = "var(--signal)";

  return (
    <div className="absolute left-1.5 top-2 bottom-2 w-3 pointer-events-none z-0 opacity-40">
      <svg className="w-full h-full" viewBox="0 0 12 40" preserveAspectRatio="none">
        <line
          x1="6"
          y1="0"
          x2="6"
          y2="40"
          stroke={strokeColor}
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute top-1/2 left-1.5 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-signal" />
    </div>
  );
}
