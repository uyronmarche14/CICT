'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Loader2, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentOwnerType, NewsStatus } from '@/types';
import type { News, Announcement } from '@/types';
import { useNews } from '@/hooks/use-news';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { getOwnershipLabel } from '@/lib/content-ownership';

const TABS = [
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'announcements', label: 'Announcements', icon: Bell },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

export default function NewsSection() {
  const [activeTab, setActiveTab] = useState('news');

  const { data: officialNewsData, isLoading: officialNewsLoading } = useNews(1, 6, NewsStatus.PUBLISHED, { ownerType: ContentOwnerType.SYSTEM });
  const { data: orgNewsData, isLoading: orgNewsLoading } = useNews(1, 6, NewsStatus.PUBLISHED, { ownerType: ContentOwnerType.ORGANIZATION });
  const { data: announcementsData, isLoading: announcementsLoading } = useGetAnnouncements(1, 6, undefined, undefined, true, ContentOwnerType.ORGANIZATION);

  const allNews = [...(officialNewsData?.news ?? []), ...(orgNewsData?.news ?? [])];
  const announcements = announcementsData?.data ?? [];

  const isLoading = officialNewsLoading || orgNewsLoading || announcementsLoading;

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <SectionHeader title="Latest Updates" subtitle="Fresh updates from CICT and the campus community" centered />
        </motion.div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <TabsList className="mb-10">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </motion.div>

            <TabsContent value="news" className="w-full">
              {allNews.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">No news available at this time.</p>
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allNews.slice(0, 6).map((item: News) => (
                      <motion.div key={item._id} variants={cardVariant}>
                        <Link
                          href={`/news/${item._id}`}
                          className="group block h-full"
                        >
                          <Card className="h-full gap-0 overflow-hidden py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-md">
                            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10">
                              <Newspaper className="h-10 w-10 text-primary/30" />
                            </div>
                            <CardHeader className="gap-3 p-5 pb-2">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                  {getOwnershipLabel(item, 'CICT Official')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(item.publishedAt ?? item.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <CardTitle className="line-clamp-2 text-base transition-colors group-hover:text-primary">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                              <p className="line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div variants={fadeUp} className="flex justify-center mt-8">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href="/news">View all news <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="announcements" className="w-full">
              {announcements.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">No announcements available.</p>
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {announcements.slice(0, 6).map((a: Announcement) => (
                      <motion.div key={a._id} variants={cardVariant}>
                        <Card className="group gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md">
                          <div className="flex">
                            <div className="w-1.5 bg-primary shrink-0" />
                            <CardContent className="flex-1 p-5">
                              <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-primary" />
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                  {getOwnershipLabel(a, 'Official')}
                                </Badge>
                              </div>
                              <h3 className="mt-2 line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary">{a.title}</h3>
                              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.content}</p>
                            </CardContent>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div variants={fadeUp} className="flex justify-center mt-8">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href="/announcements">View all announcements <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
}
