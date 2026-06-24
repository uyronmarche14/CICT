'use client';

import Link from 'next/link';
import { Award, Calendar, Loader2, Sparkles, Trophy } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import PublicSectionHeader from '@/components/sections/landingpage/PublicSectionHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type AchievementItem = {
  title: string;
  category?: string;
  date?: string;
  description?: string;
  organizationName: string;
  organizationSlug: string;
  orgColor: string;
};

export default function SpotlightAchievementsSection() {
  const { organizations, loading } = useOrganizations();

  if (loading) {
    return (
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  const achievements: AchievementItem[] = [];

  for (const org of organizations) {
    if (!org.isActive && org.isActive !== undefined) continue;

    if (org.structuredAchievements && org.structuredAchievements.length > 0) {
      for (const achievement of org.structuredAchievements.slice(0, 3)) {
        achievements.push({
          title: achievement.title,
          category: achievement.category,
          date: achievement.date,
          description: achievement.description,
          organizationName: org.fullName || org.name,
          organizationSlug: org.id,
          orgColor: org.color?.primary || '#6366f1',
        });
      }
    }

    if (org.achievements && org.achievements.length > 0) {
      for (const achievement of org.achievements.slice(0, 2)) {
        achievements.push({
          title: achievement,
          organizationName: org.fullName || org.name,
          organizationSlug: org.id,
          orgColor: org.color?.primary || '#6366f1',
        });
      }
    }
  }

  const sorted = achievements.sort((a, b) => {
    if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  const displayed = sorted.slice(0, 6);

  if (displayed.length === 0) return null;

  const categoryIcons: Record<string, React.ReactNode> = {
    award: <Trophy className="h-5 w-5" />,
    achievement: <Sparkles className="h-5 w-5" />,
    project: <Award className="h-5 w-5" />,
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <PublicSectionHeader
          eyebrow="Achievements"
          title="Recent Milestones"
          description="Celebrating the accomplishments of our student organizations and their members."
          align="center"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((item, idx) => (
            <Link
              key={`${item.organizationSlug}-${idx}`}
              href={`/organization/${item.organizationSlug}`}
              className="group block h-full"
            >
              <Card className="relative h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-md">
                <div
                  className="absolute left-0 top-0 h-full w-1 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                  style={{ backgroundColor: item.orgColor }}
                />

                <CardContent className="px-6">
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.orgColor}15` }}
                  >
                    <span style={{ color: item.orgColor }}>
                      {item.category
                        ? categoryIcons[item.category.toLowerCase()] || <Award className="h-5 w-5" />
                        : <Trophy className="h-5 w-5" />
                      }
                    </span>
                  </div>

                  <h3 className="font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium"
                      style={{
                        borderColor: `${item.orgColor}30`,
                        color: item.orgColor,
                      }}
                    >
                      {item.organizationName}
                    </Badge>
                    {item.date && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
