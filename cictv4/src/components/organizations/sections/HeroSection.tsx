'use client';

import { CldImage } from 'next-cloudinary';
import { motion, Variants } from 'framer-motion';
import { OrganizationPage } from '@/lib/data/organizationPages';

interface HeroSectionProps {
  org: OrganizationPage;
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] // Custom bezier for smooth easeOut
    } 
  }
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

export default function HeroSection({ org }: HeroSectionProps) {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-end">
      <div className="absolute inset-0">
        <CldImage
          src={org.heroImage}
          alt={org.fullName}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Adjusted gradients for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-5xl"
        >
          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide">
              Est. {org.established}
            </span>
            <span className="text-white/80 text-sm font-medium tracking-wide uppercase">Student Organization</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeIn}
            className="font-black text-white leading-[0.85] mb-6 tracking-tighter font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl select-none"
            style={{ 
              textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)'
            }}
          >
            {org.fullName}
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="text-xl sm:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mb-8"
          >
            {org.tagline}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
