import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, FileText, GraduationCap, HelpCircle, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Admissions | CICT',
  description: 'General admission guidance for students interested in CICT programs.',
};

const steps = [
  {
    title: 'Review your program path',
    description:
      'Start by comparing BS Computer Science and BS Information Systems so your application matches your interests and career direction.',
    icon: GraduationCap,
  },
  {
    title: 'Prepare school requirements',
    description:
      'Keep your academic records, identification documents, and other school-required forms ready for the official application process.',
    icon: FileText,
  },
  {
    title: 'Confirm details with the office',
    description:
      'Admission schedules and requirements can change by school year. Confirm the latest instructions with the CICT office or official TCU channels.',
    icon: HelpCircle,
  },
];

const reminders = [
  'Admission requirements, deadlines, and enrollment windows should be verified through official university channels.',
  'Program availability may depend on the current academic year and university enrollment guidelines.',
  'For urgent questions, visit or contact the CICT office instead of relying on older public posts.',
];

export default function AdmissionsPage() {
  return (
    <main className="min-h-screen bg-background pt-28 text-foreground">
      <section className="border-b border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Admissions Guidance
            </p>
            <h1 className="text-4xl font-display font-black tracking-tight md:text-5xl">
              Start your CICT application with the right information.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              This page gives general guidance for future CICT students. For official deadlines,
              complete requirements, and enrollment instructions, confirm with the CICT office or
              Taguig City University admission channels.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Before You Apply"
            subtitle="Use these steps to prepare before checking the latest official admission instructions."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold text-foreground">{step.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <SectionHeader
              title="Important Notes"
              subtitle="Keep the public page useful without replacing official admission announcements."
            />
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{reminder}</p>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Need the latest requirements?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Visit or contact the CICT office for confirmed admission schedules,
                document requirements, and enrollment instructions.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/contact">
                    Contact CICT
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/academics">Explore Programs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
