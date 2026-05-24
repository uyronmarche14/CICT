'use client';

import { motion } from 'framer-motion';
import { OrganizationPage } from '@/lib/data/organizationPages';

interface MissionVisionSectionProps {
  mission: string;
  vision: string;
  color: OrganizationPage['color'];
}

export default function MissionVisionSection({ mission, vision, color }: MissionVisionSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 mb-32">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 p-8 rounded-lg border border-border bg-card hover:bg-card/95 shadow-md transition-all duration-300 relative overflow-hidden group"
            style={{ boxShadow: `0 4px 6px -1px ${color.primary}20, 0 2px 4px -1px ${color.primary}10` }}
        >
            <div className="absolute inset-x-0 top-0 h-1 transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0" style={{ backgroundColor: color.primary }} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary" style={{ transition: 'color 300ms' }}>
                Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
                {mission}
            </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 p-8 rounded-lg border border-border bg-card hover:bg-card/95 shadow-md transition-all duration-300 relative overflow-hidden group"
            style={{ boxShadow: `0 4px 6px -1px ${color.secondary}20, 0 2px 4px -1px ${color.secondary}10` }}
        >
            <div className="absolute inset-x-0 top-0 h-1 transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0" style={{ backgroundColor: color.secondary }} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary" style={{ transition: 'color 300ms' }}>
                Our Vision
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
                {vision}
            </p>
        </motion.div>
    </div>
  );
}
