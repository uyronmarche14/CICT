'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lazy, Suspense, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { isLightColor, createOrgGradient } from '@/components/organizations/utils';
import { useOrganizations } from '@/hooks/useOrganizations';
import PublicSectionHeader from '@/components/sections/landingpage/PublicSectionHeader';
import AboutCarousel from '@/components/organizations/AboutCarousel';

const OrganizationShowcase = lazy(() => import('@/components/organizations/OrganizationShowcase'));

/* ─────────────  Props  ───────────── */
interface AboutWithTabsProps {
  title?: string;
  description?: string;
  mainImage?: { src: string; alt: string };
  secondaryImage?: { src: string; alt: string };
  breakout?: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  achievementsTitle?: string;
  achievementsDescription?: string;
}

/* ─────────────  Animation Variants  ───────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/* ─────────────  Main Component  ───────────── */
export default function AboutWithTabs({
  title = 'About CICT',
  description = 'The College of Information and Communication Technology is dedicated to nurturing future tech leaders through innovative programs, cutting-edge research, and strong industry partnerships.',
  mainImage = {
    src: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    alt: 'CICT Campus',
  },
  secondaryImage = {
    src: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
    alt: 'CICT Students',
  },
  breakout = {
    src: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1757693130/CICT_Logo_m5ztoa.png',
    alt: 'CICT Logo',
    title: 'Excellence in Technology Education',
    description: 'Empowering students with world-class education and industry connections.',
    buttonText: 'Learn More',
    buttonUrl: '#',
  },
  achievementsTitle = 'Student Organizations',
  achievementsDescription = 'Discover the vibrant student organizations that make CICT a thriving community of innovation and collaboration.',
}: AboutWithTabsProps) {
  const { organizations: organizationRecords, loading } = useOrganizations();
  const [activeOrg, setActiveOrg] = useState('');

  useEffect(() => {
    if (!activeOrg && organizationRecords.length > 0) {
      setActiveOrg(organizationRecords[0].id);
    }
  }, [activeOrg, organizationRecords]);

  const currentOrg = organizationRecords.find((org) => org.id === activeOrg) ?? organizationRecords[0];
  const primaryColor = currentOrg?.color.primary || '#6e29f6';

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          className="mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <PublicSectionHeader
            eyebrow="Our Story"
            title={title}
            description={description}
          />
        </motion.div>
      </div>

      {/* ── Moving Banner / Carousel ── */}
      <motion.div
        className="mb-12 md:mb-20 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <AboutCarousel 
          slides={[
            {
              image: mainImage.src,
              alt: mainImage.alt,
              title: 'Campus Community',
              description: 'Where learning meets leadership in an environment designed for collaboration and growth.',
            },
            {
              image: secondaryImage.src,
              alt: secondaryImage.alt,
              title: 'Coding & Build Sessions',
              description: 'A big part of our life outside classes and events has always been building and innovating.',
            },
            {
              image: breakout.src,
              alt: breakout.alt,
              title: breakout.title || 'Excellence in Technology',
              description: breakout.description || 'Pushing the boundaries of technology with cutting edge student research.',
            }
          ]} 
        />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Organizations Tabs ── */}
        <motion.div
          className="pt-20 md:pt-28"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-10 text-center">
            <h2 className="mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              {achievementsTitle}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {achievementsDescription}
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Tabs value={activeOrg} onValueChange={setActiveOrg} className="w-full">
              {/* Tab Triggers */}
              <TabsList className="mx-auto mb-8 flex max-w-4xl flex-wrap justify-center gap-2 border-0 bg-transparent">
                {organizationRecords.map((org) => (
                  <TabsTrigger
                    key={org.id}
                    value={org.id}
                    className="rounded-full border border-border/40 bg-background px-4 py-2 text-xs font-medium transition-all duration-300 hover:bg-muted/50 data-[state=active]:border-0 data-[state=active]:shadow-lg sm:text-sm"
                    style={{
                      ...(activeOrg === org.id && {
                        backgroundColor: org.color.primary,
                        color: isLightColor(org.color.primary) ? '#000' : '#fff',
                      }),
                    }}
                  >
                    {org.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Contents */}
              <Suspense
                fallback={
                  <div
                    className="h-[400px] w-full animate-pulse rounded-2xl"
                    style={{ backgroundColor: `${primaryColor}08` }}
                  />
                }
              >
                {loading && organizationRecords.length === 0 ? (
                  <div
                    className="h-[400px] w-full animate-pulse rounded-2xl"
                    style={{ backgroundColor: `${primaryColor}08` }}
                  />
                ) : null}
                {organizationRecords.map((org) => (
                  <TabsContent
                    key={org.id}
                    value={org.id}
                    className="mt-0 focus-visible:outline-none"
                  >
                    <div
                      className="overflow-hidden rounded-2xl border border-border/20 transition-all duration-500"
                      style={{
                        background: createOrgGradient(org.color.primary, org.color.secondary),
                      }}
                    >
                      <OrganizationShowcase organizationId={org.id} />
                    </div>
                  </TabsContent>
                ))}
              </Suspense>
            </Tabs>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}