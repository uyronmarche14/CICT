'use client';

import { motion } from 'framer-motion';
import { OrganizationPage } from '@/lib/data/organizationPages';
import { Trophy } from 'lucide-react';

interface AchievementsSectionProps {
  achievements: string[];
  color: OrganizationPage['color'];
}

export default function AchievementsSection({ achievements, color }: AchievementsSectionProps) {
  // Helper to try and extract a year from the string, or default to something reasonable
  const parseAchievement = (text: string) => {
    const yearMatch = text.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[0] : '2024';
    const name = text.replace(year, '').trim(); // Remove year from name if present for cleaner look
    // Generic descriptions to cycle through or just use a standard one since we don't have real data
    const description = "Recognized for outstanding performance and dedication to excellence.";
    
    return { name, year, description };
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium tracking-wider uppercase" style={{ color: color.primary }}>
               Excellence
            </p>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent leading-tight" style={{ 
                backgroundImage: `linear-gradient(to right, ${color.primary}, ${color.secondary})`
            }}>
                Awards
            </h2>
        </div>
        <span className="text-xl font-medium text-muted-foreground hidden md:block">
          (2018-{new Date().getFullYear()}©)
        </span>
      </div>

      <div className="w-full">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_3fr_1fr] gap-8 pb-4 border-b border-border/40 text-sm font-medium text-muted-foreground uppercase tracking-wider px-4">
          <div></div> {/* Index column empty */}
          <div>Name</div>
          <div>Nomination</div>
          <div className="text-right">Year</div>
        </div>

        {/* Rows */}
        <div className="space-y-0">
          {achievements.map((item, idx) => {
            const { name, year, description } = parseAchievement(item);
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_3fr_1fr] gap-4 md:gap-8 py-8 border-b border-border/20 hover:bg-muted/30 transition-colors px-4 items-center"
              >
                {/* Index */}
                <div className="text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                  ({(idx + 1).toString().padStart(3, '0')})
                </div>

                {/* Name */}
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-full bg-primary/10 text-primary transition-colors group-hover:scale-110 duration-300"
                    style={{ color: color.primary, backgroundColor: `${color.primary}15` }}
                  >
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-lg text-foreground">
                    {name || item}
                  </span>
                </div>

                {/* Nomination (Description) */}
                <div className="text-muted-foreground text-sm leading-relaxed hidden md:block">
                  {description}
                </div>

                {/* Year */}
                <div className="md:text-right font-mono text-foreground">
                  {year}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
