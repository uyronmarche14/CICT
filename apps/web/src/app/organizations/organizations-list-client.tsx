'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useOrganizations } from '@/hooks/useOrganizations';

export default function OrganizationsListClient() {
  const { organizations, loading, error } = useOrganizations();

  return (
    <main className="min-h-screen bg-background pt-28 text-foreground">
      <section className="border-b border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Student Organizations
            </p>
            <h1 className="text-4xl font-display font-black tracking-tight md:text-5xl">
              Find your CICT community.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              Explore student-led organizations that support leadership, technology practice,
              campus service, events, and creative work across the CICT community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Organizations"
            subtitle="Open an organization profile to learn about its mission, activities, and public updates."
          />

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  Organizations could not be loaded right now. Please try again later or contact the CICT office.
                </p>
              </CardContent>
            </Card>
          ) : organizations.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  No public organizations are available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {organizations.map((organization) => (
                <Link key={organization.id} href={`/organization/${organization.id}`} className="group block h-full">
                  <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-md">
                    <div
                      className="h-2"
                      style={{ backgroundColor: organization.color?.primary ?? 'var(--primary)' }}
                    />
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                          {organization.logo ? (
                            <Image
                              src={organization.logo}
                              alt={`${organization.name} logo`}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Badge variant="outline" className="mb-2">
                            {organization.name}
                          </Badge>
                          <CardTitle className="line-clamp-2 text-lg">
                            {organization.fullName}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-5">
                      <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
                        {organization.description}
                      </p>
                      <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        View organization
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/student-life">Back to Student Life</Link>
            </Button>
            <Button asChild>
              <Link href="/events">
                Browse Events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
