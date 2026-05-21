"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MeshGradientBgProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
  interactive?: boolean;
}

/**
 * MeshGradientBg - A modern, clean animated background component
 * Features: Animated mesh gradients, floating orbs with blur, particle effects
 * Designed to complement hero sections with a premium, state-of-the-art look
 */
const MeshGradientBg: React.FC<MeshGradientBgProps> = ({
  className = '',
  variant = 'default',
  interactive = true
}) => {
  // Variant-based opacity configurations
  const variantConfig = {
    default: {
      orbOpacity: 0.7,
      gridOpacity: 0.04,
      particleOpacity: 0.6
    },
    subtle: {
      orbOpacity: 0.5,
      gridOpacity: 0.02,
      particleOpacity: 0.4
    },
    vibrant: {
      orbOpacity: 0.9,
      gridOpacity: 0.06,
      particleOpacity: 0.8
    }
  };

  const config = variantConfig[variant];

  // Brand colors (matching your globals.css)
  const colors = {
    primary: '#6e29f6',      // Purple
    secondary: '#f629a8',    // Pink
    accent: '#29f6d2',       // Teal
  };

  // Generate random particles with fixed seed for consistency
  const particles = React.useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
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
            rgba(110, 41, 246, 0.03) 0%, 
            transparent 50%, 
            rgba(246, 41, 168, 0.03) 100%)`
        }}
      />
      
      {/* Floating gradient orbs with animations */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {/* Primary orb - top right - PURPLE */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '700px',
            height: '700px',
            background: `radial-gradient(circle at center, 
              ${colors.primary}${Math.round(config.orbOpacity * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.primary}33 35%, 
              ${colors.primary}11 55%, 
              transparent 70%)`,
            filter: 'blur(60px)',
            top: '-15%',
            right: '-10%',
          }}
          animate={interactive ? {
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.08, 0.95, 1]
          } : {}}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Secondary orb - bottom left - PINK */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle at center, 
              ${colors.secondary}${Math.round(config.orbOpacity * 0.85 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.secondary}33 35%, 
              ${colors.secondary}11 55%, 
              transparent 70%)`,
            filter: 'blur(70px)',
            bottom: '-20%',
            left: '-8%',
          }}
          animate={interactive ? {
            x: [0, -35, 45, 0],
            y: [0, 40, -35, 0],
            scale: [1, 0.96, 1.04, 1]
          } : {}}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Accent orb - center right - TEAL */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle at center, 
              ${colors.accent}${Math.round(config.orbOpacity * 0.7 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.accent}22 40%, 
              ${colors.accent}08 60%, 
              transparent 75%)`,
            filter: 'blur(80px)',
            top: '30%',
            right: '20%',
          }}
          animate={interactive ? {
            x: [0, -30, 40, 0],
            y: [0, 35, -45, 0],
            scale: [1, 1.12, 0.92, 1]
          } : {}}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Small accent orb - top left - PURPLE/TEAL mix */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '350px',
            height: '350px',
            background: `radial-gradient(circle at center, 
              ${colors.primary}${Math.round(config.orbOpacity * 0.6 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.accent}22 45%, 
              transparent 70%)`,
            filter: 'blur(50px)',
            top: '8%',
            left: '10%',
          }}
          animate={interactive ? {
            x: [0, 50, -40, 0],
            y: [0, -30, 50, 0],
            opacity: [0.8, 1, 0.7, 0.8]
          } : {}}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Extra center orb for more depth */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle at center, 
              ${colors.secondary}${Math.round(config.orbOpacity * 0.5 * 255).toString(16).padStart(2, '0')} 0%, 
              ${colors.primary}18 50%, 
              transparent 70%)`,
            filter: 'blur(90px)',
            top: '50%',
            left: '40%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={interactive ? {
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.6, 0.8, 0.5, 0.6]
          } : {}}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Noise texture overlay for organic feel */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
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
            animate={interactive ? {
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
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.08) 100%)`,
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
