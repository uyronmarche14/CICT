'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BookOpen, Users, Sparkles, Star, Heart } from 'lucide-react';

const values = [
  { label: 'Accessible Education', icon: BookOpen },
  { label: 'Student Community', icon: Users },
  { label: 'Innovation', icon: Sparkles },
  { label: 'Leadership', icon: Star },
  { label: 'Service', icon: Heart },
] as const;

export default function BrandSection() {
  return (
    <section className="relative bg-background py-24 md:py-32 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="The TechSkolar Identity"
          subtitle="More than a platform — a symbol of CICT's commitment to empowering Taguig's youth through technology, community, and excellence."
          centered
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Logo + Brand Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center lg:items-start"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
              <div className="relative p-8 sm:p-10 rounded-full border border-primary/20 bg-surface-elevated/80 backdrop-blur-sm shadow-[0_0_60px_rgba(110,41,246,0.12)]">
                <Image
                  src="/images/techskolar.png"
                  alt="TechSkolar Logo"
                  width={200}
                  height={200}
                  className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain"
                  priority
                />
              </div>
            </div>

            <div className="mt-8 text-center lg:text-left">
              <h3
                className="text-3xl sm:text-4xl md:text-5xl font-black text-primary leading-none tracking-tight"
                style={{ fontFamily: 'Blockletter, Inter, sans-serif' }}
              >
                TECHSKOLAR
              </h3>
              <p
                className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-none tracking-normal uppercase"
                style={{ fontFamily: 'Blockletter, Inter, sans-serif' }}
              >
                NG TAGUIG
              </p>
            </div>
          </motion.div>

          {/* Right: Explanation + Values */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.2 } },
            }}
            className="flex flex-col gap-8"
          >
            <div className="space-y-5">
              <p className="text-base sm:text-lg leading-loose text-muted-foreground">
                The TechSkolar logo represents the College of Information and Communication Technology&apos;s
                commitment to empowering Taguig&apos;s youth through technology education. The shield
                symbolizes knowledge and protection; the circuits represent innovation and digital
                transformation; the vibrant colors reflect the energy and creativity of the CICT
                student community.
              </p>
              <p className="text-base sm:text-lg leading-loose text-muted-foreground">
                <strong className="text-foreground font-semibold">TechSkolar</strong> &mdash; &ldquo;Tech Scholar&rdquo; &mdash;
                embodies the fusion of academic excellence and technological leadership that defines every
                CICT student. It stands for accessible education, community-driven growth, and the belief
                that every student has the potential to become a leader and innovator in the digital age.
              </p>
            </div>

            <motion.div
              className="flex flex-wrap gap-2.5"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
              }}
            >
              {values.map(({ label, icon: Icon }) => (
                <motion.span
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 hover:border-primary/30"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
