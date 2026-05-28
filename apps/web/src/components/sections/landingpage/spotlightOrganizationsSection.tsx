'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrganizations } from '@/hooks/useOrganizations';
import PublicSectionHeader from '@/components/sections/landingpage/PublicSectionHeader';

export default function SpotlightOrganizationsSection() {
  const { organizations, loading } = useOrganizations();

  const activeOrgs = organizations
    .filter((org) => org.isActive !== false)
    .slice(0, 4);

  if (loading) {
    return (
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (activeOrgs.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <PublicSectionHeader
          eyebrow="Organizations"
          title="Explore Our Organizations"
          description="Discover the diverse student organizations under CICT — each with its own mission, vision, and community."
          align="center"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeOrgs.map((org) => (
            <Link
              key={org.id}
              href={`/organization/${org.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Banner */}
              <div className="relative h-32 overflow-hidden">
                {org.banner ? (
                  <div
                    className="h-full w-full object-cover"
                    style={{
                      backgroundImage: `url(${org.banner})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ backgroundColor: `${org.color?.primary || '#6366f1'}20` }}
                  />
                )}
              </div>

              {/* Logo + Content */}
              <div className="relative flex flex-1 flex-col px-5 pb-5">
                {/* Logo */}
                <div className="-mt-8 mb-3 flex items-center gap-3">
                  <div
                    className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-background shadow-md"
                  >
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <Building2
                        className="h-6 w-6"
                        style={{ color: org.color?.primary }}
                      />
                    )}
                  </div>
                </div>

                {/* Name + Tagline */}
                <h3
                  className="text-lg font-bold leading-tight"
                  style={{ color: org.color?.primary }}
                >
                  {org.fullName || org.name}
                </h3>
                {org.tagline && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {org.tagline}
                  </p>
                )}

                {/* Type Badge */}
                <div className="mt-3 flex items-center gap-2">
                  {org.organizationType && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {org.organizationType.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {org.membershipSize && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {org.membershipSize}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ backgroundColor: org.color?.primary || '#6366f1' }}
              />
            </Link>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/organizations">
              View All Organizations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
