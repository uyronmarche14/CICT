'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MapPin, Mail, Globe, Users, Calendar, ExternalLink } from 'lucide-react';
import api from '@/lib/api/axios';
import { Organization } from '@/types';
import { format } from 'date-fns';
import { SEOHead } from '@/components/SEOHead';

export default function PublicOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}`);
      return res.data.data as Organization;
    },
    enabled: !!orgId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Organization Not Found</h1>
          <Button onClick={() => router.push('/updates')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  const activeMembers = org.members?.filter(m => !m.status || m.status === 'active') || [];
  const officers = activeMembers.filter(m => m.memberType === 'officer');
  const general = activeMembers.filter(m => m.memberType !== 'officer');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={org.fullName || org.name}
        description={org.seoDescription || org.description || ''}
        ogImage={org.logo}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          {org.logo && (
            <div className="w-20 h-20 rounded-xl overflow-hidden border bg-muted shrink-0">
              <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{org.fullName}</h1>
              {org.organizationType && (
                <Badge variant="outline">{org.organizationType}</Badge>
              )}
              {org.isActive === false && <Badge variant="secondary">Inactive</Badge>}
            </div>
            <p className="text-muted-foreground">{org.name}</p>
            {org.established && (
              <p className="text-sm text-muted-foreground mt-1">Est. {org.established}</p>
            )}
          </div>
        </div>

        {/* Contact & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {org.email && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <a href={`mailto:${org.email}`} className="text-sm hover:underline">{org.email}</a>
            </div>
          )}
          {org.phone && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20">
              <span className="text-sm">{org.phone}</span>
            </div>
          )}
          {org.website && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                Website <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
          )}
          {(org.building || org.campus) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm">{[org.building, org.room, org.campus].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{org.description}</p>
          </CardContent>
        </Card>

        {/* Tags */}
        {org.tags && org.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {org.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Officers */}
        {officers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Officers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-lg border">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Members */}
        {general.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Members ({general.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {general.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-lg border">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
