import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, BookOpen, Code, Database, GraduationCap, Lightbulb, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Academics | CICT',
  description: 'Explore CICT academic programs, learning approach, and technology focus areas.',
};

const programs = [
  {
    title: 'BS Computer Science',
    description:
      'A computing-focused program for students who want to build strong foundations in algorithms, software engineering, artificial intelligence, cybersecurity, and systems development.',
    highlights: ['Software engineering', 'AI and machine learning', 'Cybersecurity foundations'],
    icon: Code,
  },
  {
    title: 'BS Information Systems',
    description:
      'A technology and business program for students who want to design, manage, and improve information systems that support organizations and real-world operations.',
    highlights: ['Business process design', 'Database and analytics', 'Systems analysis'],
    icon: Database,
  },
];

const learningApproach = [
  { title: 'Industry-Aligned Learning', description: 'Courses connect technical foundations with the tools and workflows used in modern technology teams.', icon: GraduationCap },
  { title: 'Project-Based Practice', description: 'Students build applications, prototypes, research outputs, and capstone projects that turn concepts into working solutions.', icon: Lightbulb },
  { title: 'Responsible Technology', description: 'The curriculum emphasizes ethics, collaboration, security awareness, and service to the campus community.', icon: Shield },
];

export default function AcademicsPage() {
  return (
    <main className="min-h-screen bg-background pt-28 text-foreground">
      <section className="border-b border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Academic Programs
            </p>
            <h1 className="text-4xl font-display font-black tracking-tight md:text-5xl">
              Build a strong foundation in technology.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              CICT offers degree programs designed to help students grow from core computing
              principles into practical, project-ready skills for software, systems, data, and
              technology-enabled organizations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Programs"
            subtitle="Two complementary paths for students preparing for technology careers."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <Card key={program.title}>
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm leading-7 text-muted-foreground">{program.description}</p>
                    <ul className="space-y-2">
                      {program.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
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
            title="Learning Approach"
            subtitle="CICT combines classroom foundations, hands-on practice, and community-driven technology work."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {learningApproach.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="space-y-3 p-6">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-foreground">{item.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admissions">
                View Admission Guidance
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact CICT</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
