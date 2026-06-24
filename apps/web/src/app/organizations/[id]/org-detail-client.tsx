'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MapPin, Mail, Globe, Users, Calendar, ExternalLink, Clock, Star, Award, Target, UserPlus, BookOpen, HeartHandshake, Building2, Shield, ChevronRight } from 'lucide-react';
import { Organization } from '@/types';
import { organizationService } from '@/services/organizationService';

export function PublicOrganizationPageClient({ id }: { id: string }) {
  const router = useRouter();

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationService.getById(id) as Promise<Organization>,
    enabled: !!id,
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
  const advisers = activeMembers.filter(m => m.memberType === 'advisor' || m.isAdviser);
  const general = activeMembers.filter(m => m.memberType !== 'officer' && m.memberType !== 'advisor' && !m.isAdviser);

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          {org.logo && (
            <div className="w-20 h-20 rounded-xl overflow-hidden border bg-muted shrink-0">
              <Image src={org.logo} alt={org.name} width={80} height={80} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-3xl font-bold">{org.fullName}</h1>
              {org.organizationType && (
                <Badge variant="outline">{org.organizationType}</Badge>
              )}
              {org.isActive === false && <Badge variant="secondary">Inactive</Badge>}
            </div>
            <p className="text-muted-foreground">{org.name}</p>
            {org.tagline && (
              <p className="italic text-muted-foreground/70 text-sm mt-1">{org.tagline}</p>
            )}
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
          {org.officialEmail && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground mr-1">Official:</span>
              <a href={`mailto:${org.officialEmail}`} className="text-sm hover:underline">{org.officialEmail}</a>
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
              {org.officeLocation && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({[org.officeLocation.building, org.officeLocation.room, org.officeLocation.campus].filter(Boolean).join(', ')})
                </span>
              )}
            </div>
          )}
          {org.meetingSchedule && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm">{org.meetingSchedule}</span>
            </div>
          )}
        </div>

        {/* Office Location Map Link */}
        {org.officeLocation?.mapUrl && (
          <div className="mb-8">
            <a href={org.officeLocation.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <MapPin className="w-4 h-4" /> View on Map <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{org.description}</p>
          </CardContent>
        </Card>

        {/* Long Description / About */}
        {org.longDescription && org.longDescription !== org.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{org.longDescription}</p>
            </CardContent>
          </Card>
        )}

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5" /> Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{org.mission}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5" /> Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{org.vision}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        {org.tags && org.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {org.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Two-column: Membership + Advisers/Programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Membership Info */}
          {(org.membershipSize || org.joinRequirements || org.joinSteps?.length || org.benefits || org.joinUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus className="w-5 h-5" /> Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {org.membershipSize && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span><strong>{org.membershipSize}</strong> members</span>
                  </div>
                )}
                {org.joinRequirements && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Requirements</p>
                    <p className="text-muted-foreground">{org.joinRequirements}</p>
                  </div>
                )}
                {org.joinSteps && org.joinSteps.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">How to Join</p>
                    <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                      {org.joinSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {org.benefits && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Benefits</p>
                    <p className="text-muted-foreground">{org.benefits}</p>
                  </div>
                )}
                {org.joinUrl && (
                  <a href={org.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    Apply Now <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Advisers */}
          {org.adviserItems && org.adviserItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="w-5 h-5" /> Advisers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {org.adviserItems.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    {a.photo && (
                      <Image src={a.photo} alt={a.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{a.name}</p>
                      {a.role && <p className="text-xs text-muted-foreground">{a.role}</p>}
                      {a.email && <a href={`mailto:${a.email}`} className="text-xs text-primary hover:underline">{a.email}</a>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Programs */}
        {org.programs && org.programs.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5" /> Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {org.programs.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      {p.icon && <span className="text-lg">{p.icon}</span>}
                      <h3 className="font-medium text-sm">{p.name}</h3>
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                    {p.schedule && <p className="text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3 inline" /> {p.schedule}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flagship Events */}
        {org.flagshipEvents && org.flagshipEvents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5" /> Flagship Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {org.flagshipEvents.map((e, i) => (
                  <div key={i} className="p-4 rounded-lg border flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">{e.name}</h3>
                      {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                      {e.frequency && <p className="text-xs text-muted-foreground mt-1">{e.frequency}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partners + Committees grid */}
        {(org.partnerItems?.length || org.committeeItems?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {org.partnerItems && org.partnerItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HeartHandshake className="w-5 h-5" /> Partners
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {org.partnerItems.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      {p.logo && <Image src={p.logo} alt={p.name} width={40} height={40} className="w-10 h-10 rounded object-contain" />}
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                        {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Visit <ExternalLink className="w-3 h-3 inline" /></a>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {org.committeeItems && org.committeeItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="w-5 h-5" /> Committees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {org.committeeItems.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{c.name}</p>
                        {c.memberCount && <Badge variant="outline" className="text-xs">{c.memberCount} members</Badge>}
                      </div>
                      {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                      {c.headName && <p className="text-xs text-muted-foreground mt-1">Head: {c.headName}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Structured Achievements */}
        {org.structuredAchievements && org.structuredAchievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-5 h-5" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {org.structuredAchievements.map((a, i) => (
                  <div key={i} className="p-4 rounded-lg border flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={a.category === 'award' ? 'default' : 'secondary'} className="text-[10px]">
                        {a.category || 'Achievement'}
                      </Badge>
                      {a.date && <span className="text-xs text-muted-foreground">{a.date}</span>}
                    </div>
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Old plain achievements */}
        {org.achievements && org.achievements.length > 0 && !org.structuredAchievements && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-5 h-5" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {org.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Officers (enhanced) */}
        {officers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Officers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officers.map((member) => (
                <div key={member.id} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    {member.photo ? (
                      <Image src={member.photo} alt={member.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
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
                  {(member.department || member.committee || member.termStart) && (
                    <div className="border-t pt-2 text-xs text-muted-foreground space-y-0.5">
                      {member.department && <p>Dept: {member.department}</p>}
                      {member.committee && <p>Committee: {member.committee}</p>}
                      {member.termStart && (
                        <p>Term: {member.termStart}{member.termEnd ? ` - ${member.termEnd}` : ''}</p>
                      )}
                      {member.leadershipStatus && (
                        <Badge variant="outline" className="text-[10px]">{member.leadershipStatus}</Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adviser Members (from member list with isAdviser flag) */}
        {advisers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Advisers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-lg border">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.position}</p>
                    {member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}
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
                    <Image src={member.photo} alt={member.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
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
