import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, CalendarDays, QrCode, Trophy, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Student Life | CICT',
  description: 'Discover student organizations, events, activities, and campus involvement at CICT.',
};

const studentLifeAreas = [
  {
    title: 'Student Organizations',
    description:
      'Find your community through CICT student organizations focused on leadership, computing, systems, robotics, service, media, and campus engagement.',
    icon: Users,
    href: '/organizations',
    cta: 'Explore organizations',
  },
  {
    title: 'Campus Events',
    description:
      'Join workshops, seminars, competitions, organization activities, and college-wide events that help students learn and connect.',
    icon: CalendarDays,
    href: '/events',
    cta: 'Browse events',
  },
  {
    title: 'Participation Records',
    description:
      'Students can use the CICT platform to register for events, access QR passes, and keep track of event participation when signed in.',
    icon: QrCode,
    href: '/login',
    cta: 'Student login',
  },
];

const benefits = [
  'Build friendships and professional networks through organization work.',
  'Develop leadership, collaboration, and event management experience.',
  'Stay connected with announcements, activities, and campus updates.',
  'Turn classroom learning into projects, workshops, and community initiatives.',
];

export default function StudentLifePage() {
  return (
    <main className="min-h-screen bg-background pt-28 text-foreground">
      <section className="border-b border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Student Life
            </p>
            <h1 className="text-4xl font-display font-black tracking-tight md:text-5xl">
              Learn, lead, and belong at CICT.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              CICT student life connects academics with organizations, events, leadership
              opportunities, and community experiences that help students grow beyond the classroom.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Ways To Get Involved"
            subtitle="Public entry points for students who want to participate in the CICT community."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {studentLifeAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.title}>
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm leading-7 text-muted-foreground">{area.description}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={area.href}>
                        {area.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="What Students Gain"
            subtitle="Student life at CICT is designed to support both academic and personal growth."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
