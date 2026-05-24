'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/hooks/useOrganizations';
import { Loader2 } from 'lucide-react';

// Layout Components
import HeroSection from '@/components/organizations/sections/HeroSection';
import BlogDescription from '@/components/organizations/sections/BlogDescription';
import MissionVisionSection from '@/components/organizations/sections/MissionVisionSection';
import AchievementsSection from '@/components/organizations/sections/AchievementsSection';
import TeamSection from '@/components/organizations/sections/TeamSection';
import OrganizationContentPreview from '@/components/organizations/OrganizationContentPreview';
import type { OrganizationPage } from '@/lib/data/organizationPages';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  
  const { organization, loading, error } = useOrganization(orgId);
  const organizationPage: OrganizationPage | null = organization
    ? {
        id: organization.id,
        name: organization.name,
        fullName: organization.fullName,
        tagline: organization.description,
        description: organization.description,
        mission: organization.mission,
        vision: organization.vision,
        established: organization.established,
        heroImage: organization.banner,
        logo: organization.logo,
        color: {
          primary: organization.color.primary,
          secondary: organization.color.secondary,
        },
        programs: [],
        achievements: organization.achievements,
        events: [],
        benefits: [],
        joinInfo: {
          requirements: [],
          process: [],
          contact: '',
        },
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !organization || !organizationPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Not Found</h1>
          <p className="text-muted-foreground">The organization you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      
      {/* 1. Hero Section */}
      <HeroSection org={organizationPage} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-24 pb-24">
        
        {/* 2. Blog Style Description */}
        <BlogDescription 
            description={organization.description} 
            name={organization.fullName} 
            color={organization.color} 
        />

        {/* 3. Mission & Vision */}
        <MissionVisionSection 
            mission={organization.mission} 
            vision={organization.vision} 
            color={organization.color} 
        />

        {/* 4. Achievements */}
        <AchievementsSection 
            achievements={organization.achievements} 
            color={organization.color} 
        />

        <OrganizationContentPreview
          organizationId={organization.id}
          organizationName={organization.name}
        />

        {/* 5. Team */}
        <TeamSection 
            members={organization.members} 
            color={organization.color} 
            orgName={organization.name}
        />
        
      </div>

      
    </main>
  );
}
