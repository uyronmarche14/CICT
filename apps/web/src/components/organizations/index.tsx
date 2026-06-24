'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lazy, Suspense, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useOrganizations } from '@/hooks/useOrganizations';
import { SectionHeader } from '@/components/ui/SectionHeader';

const OrganizationShowcase = lazy(() => import('@/components/organizations/OrganizationShowcase'));

/* ─────────────  Props  ───────────── */
interface AboutWithTabsProps {
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

/* ─────────────  Main Component  ───────────── */
export default function AboutWithTabs({
  achievementsTitle = 'Student Organizations',
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
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="pt-10 md:pt-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="mb-10">
            <SectionHeader title={achievementsTitle} subtitle="Meet the Team" centered />
          </div>

          <motion.div variants={fadeInUp}>
            <Tabs value={activeOrg} onValueChange={setActiveOrg} className="w-full">
              <div className="rounded-2xl border border-border/10 overflow-hidden bg-card">
                {/* Tab header bar */}
                <TabsList className="flex w-full bg-background rounded-none border-b border-border/10 p-0 h-auto">
                  {organizationRecords.map((org) => (
                    <TabsTrigger
                      key={org.id}
                      value={org.id}
                      className="relative flex-1 rounded-none border-0 bg-transparent px-4 py-4 text-xs font-semibold uppercase tracking-wider
                                 text-muted-foreground/60 transition-all duration-300
                                 data-[state=active]:text-foreground data-[state=active]:shadow-none
                                 hover:text-foreground/80"
                    >
                      {org.name}
                      {activeOrg === org.id && (
                        <span
                          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full transition-all duration-300"
                          style={{ backgroundColor: org.color.primary }}
                        />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tab Contents */}
                <Suspense
                  fallback={
                    <div
                      className="h-[400px] w-full animate-pulse"
                      style={{ backgroundColor: `${primaryColor}08` }}
                    />
                  }
                >
                  {loading && organizationRecords.length === 0 ? (
                    <div
                      className="h-[400px] w-full animate-pulse"
                      style={{ backgroundColor: `${primaryColor}08` }}
                    />
                  ) : null}
                  {organizationRecords.map((org) => (
                    <TabsContent
                      key={org.id}
                      value={org.id}
                      className="m-0 p-0 border-0 focus-visible:outline-none"
                    >
                      <OrganizationShowcase organizationId={org.id} />
                    </TabsContent>
                  ))}
                </Suspense>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
