'use client';

import { motion } from 'framer-motion';
import { OrganizationPage } from '@/lib/data/organizationPages';

interface BlogDescriptionProps {
  description: string;
  name: string;
  color: OrganizationPage['color'];
}

export default function BlogDescription({ description, name, color }: BlogDescriptionProps) {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 relative">
       {/* Decorative Elements */}
       <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" 
         style={{ backgroundColor: `${color.primary}0D` }} 
       />
       <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" 
         style={{ backgroundColor: `${color.secondary}0D` }} 
       />

      <div className="space-y-8">
        <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] rounded-full" style={{ backgroundColor: color.primary }} />
            <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">About {name}</span>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8 text-foreground">
                Where passion meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary" style={{
                    backgroundImage: `linear-gradient(to right, ${color.primary}, ${color.secondary})`
                }}>innovation</span>.
            </h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-muted-foreground leading-relaxed">
                    {description}
                </p>
                <p className="text-lg text-muted-foreground/80 leading-relaxed mt-6">
                    We believe in fostering a community where every student has the opportunity to grow, 
                    lead, and excel. By bridging the gap between academic theory and real-world application, 
                    {name} creates a dynamic environment for future leaders in technology.
                </p>
            </div>
        </motion.div>
      </div>
    </section>
  );
}
