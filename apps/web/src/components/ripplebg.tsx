"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface MeshGradientBgProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
  interactive?: boolean;
}

const MeshGradientBg: React.FC<MeshGradientBgProps> = ({
  className = '',
  variant = 'default',
  interactive = true
}) => {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = interactive && !reduceMotion;

  const variantConfig = {
    default: {
      orbOpacity: 0.36,
      gridOpacity: 0.025,
      particleOpacity: 0.28
    },
    subtle: {
      orbOpacity: 0.2,
      gridOpacity: 0.015,
      particleOpacity: 0.2
    },
    vibrant: {
      orbOpacity: 0.46,
      gridOpacity: 0.03,
      particleOpacity: 0.34
    }
  };

  const config = variantConfig[variant];

  const colors = {
    primary: '#6e29f6',
    secondary: '#f629a8',
    accent: '#29f6d2',
  };

  const particles = React.useMemo(() => 
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 17 + 13) % 100,
      y: (i * 23 + 7) % 100,
      size: (i % 4) + 2,
      duration: 15 + (i % 10) * 2,
      delay: (i % 5) * 0.8
    })), []
  );

  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* Base gradient layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            rgba(110, 41, 246, 0.04) 0%, 
            transparent 50%, 
            rgba(246, 41, 168, 0.04) 100%)`
        }}
      />
      
      {/* Floating gradient orbs */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {/* 1. Primary orb - top right - very wide horizontal */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '1600px',
            height: '500px',
            background: `radial-gradient(ellipse at center, 
              ${colors.primary}${Math.round(config.orbOpacity * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.primary}33 35%, 
              ${colors.primary}11 55%, 
              transparent 70%)`,
            filter: 'blur(100px)',
            top: '-10%',
            right: '-12%',
          }}
          animate={shouldAnimate ? {
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.08, 0.95, 1]
          } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 2. Secondary orb - bottom left - very tall vertical */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '600px',
            height: '1800px',
            background: `radial-gradient(ellipse at center, 
              ${colors.secondary}${Math.round(config.orbOpacity * 0.85 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.secondary}33 35%, 
              ${colors.secondary}11 55%, 
              transparent 70%)`,
            filter: 'blur(120px)',
            bottom: '-25%',
            left: '-6%',
          }}
          animate={shouldAnimate ? {
            x: [0, -35, 45, 0],
            y: [0, 40, -35, 0],
            scale: [1, 0.96, 1.04, 1]
          } : {}}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* 3. Accent orb - center right - extremely tall */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '450px',
            height: '1500px',
            background: `radial-gradient(ellipse at center, 
              ${colors.accent}${Math.round(config.orbOpacity * 0.7 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.accent}22 40%, 
              ${colors.accent}08 60%, 
              transparent 75%)`,
            filter: 'blur(110px)',
            top: '20%',
            right: '10%',
          }}
          animate={shouldAnimate ? {
            x: [0, -30, 40, 0],
            y: [0, 35, -45, 0],
            scale: [1, 1.12, 0.92, 1]
          } : {}}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* 4. Small accent orb - top left - very wide flat */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '1400px',
            height: '350px',
            background: `radial-gradient(ellipse at center, 
              ${colors.primary}${Math.round(config.orbOpacity * 0.6 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.accent}22 45%, 
              transparent 70%)`,
            filter: 'blur(90px)',
            top: '2%',
            left: '5%',
            transform: 'rotate(12deg)',
          }}
          animate={shouldAnimate ? {
            x: [0, 50, -40, 0],
            y: [0, -30, 50, 0],
            opacity: [0.8, 1, 0.7, 0.8]
          } : {}}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* 5. Center orb - tall tilted */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '900px',
            height: '1300px',
            background: `radial-gradient(ellipse at center, 
              ${colors.secondary}${Math.round(config.orbOpacity * 0.5 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.primary}18 50%, 
              transparent 70%)`,
            filter: 'blur(120px)',
            top: '45%',
            left: '40%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
          }}
          animate={shouldAnimate ? {
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.6, 0.8, 0.5, 0.6]
          } : {}}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* 6. Deep vertical accent - left side - tallest thinnest */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '300px',
            height: '2000px',
            background: `radial-gradient(ellipse at center, 
              ${colors.primary}${Math.round(config.orbOpacity * 0.4 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.secondary}15 50%, 
              transparent 70%)`,
            filter: 'blur(120px)',
            top: '10%',
            left: '-3%',
          }}
          animate={shouldAnimate ? {
            x: [0, 20, -25, 0],
            y: [0, -15, 20, 0],
            opacity: [0.6, 0.8, 0.5, 0.6]
          } : {}}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />

        {/* 7. Rose diagonal - bottom center */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '800px',
            height: '800px',
            background: `radial-gradient(ellipse at center, 
              ${colors.secondary}${Math.round(config.orbOpacity * 0.55 * 255).toString(16).padStart(2, '0')} 0%, 
              transparent 70%)`,
            filter: 'blur(90px)',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(25deg)',
          }}
          animate={shouldAnimate ? {
            x: [0, 20, -20, 0],
            y: [0, -15, 20, 0],
            scale: [1, 1.06, 0.94, 1]
          } : {}}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />

        {/* 8. Teal wide - top center */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '1300px',
            height: '600px',
            background: `radial-gradient(ellipse at center, 
              ${colors.accent}${Math.round(config.orbOpacity * 0.45 * 255).toString(16).padStart(2, '0')} 0%, 
              transparent 70%)`,
            filter: 'blur(100px)',
            top: '5%',
            left: '30%',
          }}
          animate={shouldAnimate ? {
            x: [0, -20, 30, 0],
            y: [0, 15, -20, 0],
            scale: [1, 1.05, 0.95, 1]
          } : {}}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        />

        {/* 9. Purple crescent - right edge */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '600px',
            height: '1400px',
            background: `radial-gradient(ellipse at center, 
              ${colors.primary}${Math.round(config.orbOpacity * 0.5 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.accent}15 50%, 
              transparent 70%)`,
            filter: 'blur(95px)',
            top: '25%',
            right: '-5%',
            transform: 'rotate(-8deg)',
          }}
          animate={shouldAnimate ? {
            x: [0, -15, 20, 0],
            y: [0, 20, -15, 0],
            opacity: [0.6, 0.8, 0.5, 0.6]
          } : {}}
          transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        />

        {/* 10. Pink compact - bottom right */}
        <motion.div
          className="absolute rounded-[50%]"
          style={{
            width: '500px',
            height: '500px',
            background: `radial-gradient(ellipse at center, 
              ${colors.secondary}${Math.round(config.orbOpacity * 0.4 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.primary}12 50%, 
              transparent 70%)`,
            filter: 'blur(80px)',
            bottom: '10%',
            right: '15%',
          }}
          animate={shouldAnimate ? {
            x: [0, 15, -20, 0],
            y: [0, -10, 15, 0],
            scale: [1, 1.08, 0.92, 1]
          } : {}}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 9 }}
        />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.018,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          zIndex: 2
        }}
      />

      {/* Subtle dot grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(110, 41, 246, ${config.gridOpacity}) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          zIndex: 2
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.id % 3 === 0 ? colors.primary : 
                               particle.id % 3 === 1 ? colors.secondary : colors.accent,
              opacity: config.particleOpacity * 0.4
            }}
            animate={shouldAnimate ? {
              y: [0, -25, 0],
              opacity: [config.particleOpacity * 0.3, config.particleOpacity * 0.7, config.particleOpacity * 0.3]
            } : {}}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay
            }}
          />
        ))}
      </div>

      {/* Subtle radial vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, transparent 68%, rgba(0,0,0,0.045) 100%)`,
          zIndex: 4
        }}
      />

      {/* Bottom fade for smooth content transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(to top, var(--background) 0%, transparent 100%)`,
          zIndex: 5
        }}
      />
    </div>
  );
};

export default MeshGradientBg;
