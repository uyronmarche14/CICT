'use client';

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { Target, Eye, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/hooks/useOrganizations';
import OrganizationContentPreview from '@/components/organizations/OrganizationContentPreview';

interface OrganizationShowcaseProps {
  organizationId: string;
}

export default function OrganizationShowcase({ organizationId }: OrganizationShowcaseProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { organization, loading } = useOrganization(organizationId);

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[300px]">
           <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
     );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const { color, name, fullName, description, established, banner, mission, vision, values } = organization;

  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
        {/* Left: Content */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                className="px-3 py-1.5 text-xs font-semibold border-0"
                style={{
                  backgroundColor: color.primary,
                  color: '#fff'
                }}
              >
                {name}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                Est. {established}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
              {fullName}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Core Values */}
          {values && values.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Core Values</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.slice(0, 5).map((value, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/80 text-foreground border border-border/50 hover:border-border transition-colors"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Image */}
        <div className="relative h-[280px] lg:h-[340px] rounded-xl overflow-hidden order-1 lg:order-2 shadow-xl ring-1 ring-border/10">
          <CldImage
            src={banner}
            alt={`${name} banner`}
            fill
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            onLoad={() => setImageLoaded(true)}
            priority
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
          )}
          
          {/* Subtle overlay gradient */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" 
          />
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Mission */}
        <div className="group p-5 rounded-xl bg-card/80 border border-border/40 hover:border-border/60 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color.primary}15` }}
            >
              <Target className="h-4 w-4" style={{ color: color.primary }} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Mission</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {mission}
          </p>
        </div>

        {/* Vision */}
        <div className="group p-5 rounded-xl bg-card/80 border border-border/40 hover:border-border/60 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color.secondary}15` }}
            >
              <Eye className="h-4 w-4" style={{ color: color.secondary }} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Vision</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {vision}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <OrganizationContentPreview
          organizationId={organization.id}
          organizationName={organization.name}
          compact
        />
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <a
          href={`/organization/${organization.id}`}
          className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:gap-3"
          style={{ backgroundColor: color.primary }}
        >
          <span>Explore {name}</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
