"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

interface CleanGridBackgroundProps {
  cellSize?: number;
  className?: string;
}

/**
 * Theme-aware brutalist background component
 * - Light theme: Dot grid pattern
 * - Dark/BW themes: Dot grid pattern with adjusted opacity
 */
export const CleanGridBackground: React.FC<CleanGridBackgroundProps> = ({
  cellSize = 24,
  className = "",
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`absolute inset-0 h-full w-full pointer-events-none ${className}`} />;
  }

  const isLightTheme = resolvedTheme === "light";
  const dotColor = isLightTheme ? "0, 0, 0" : "255, 255, 255";

  return (
    <div className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}>
      {/* Dot Grid Pattern — brutalist classic */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(${dotColor}, var(--grid-dot-opacity, 0.1)) 1px, transparent 1px)`,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      />
    </div>
  );
};