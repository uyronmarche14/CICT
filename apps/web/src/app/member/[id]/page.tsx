'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { Mail, Calendar, Award, Users, Target, Sparkles, CheckCircle2, Briefcase, Code, TrendingUp, Loader2, ArrowLeft } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Timeline from '@/components/Timeline';
import ScrollingGallery from '@/components/ScrollingGallery';
import DetailPageCTA from '@/components/sections/DetailPageCTA';
import DetailPageFooter from '@/components/sections/DetailPageFooter';
import { memberAPI } from '@/lib/api/members';
import type { OrganizationMember, Organization } from '@/types';

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [organization, setOrganization] = useState<Pick<Organization, 'id' | 'name' | 'fullName' | 'color' | 'mission' | 'vision' | 'values' | 'description'> | null>(null);
  const [teamMembers, setTeamMembers] = useState<OrganizationMember[]>([]);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await memberAPI.getById(memberId);
        setMember(data.member);
        setOrganization(data.organization);
        setTeamMembers(data.teamMembers || []);
      } catch (err) {
        setError('Member not found');
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold mb-2">Member Not Found</h1>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calculateTenure = (joinedDate?: string) => {
    if (!joinedDate) return 'N/A';
    const joined = new Date(joinedDate);
    const now = new Date();
    const months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 mt-20">

        {/* Back to Organization */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/organization/${organization.id}`)}
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to {organization.name}
          </Button>
        </div>

        {/* Hero Section - Minimal Design */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 mb-20">
          {/* Profile Image - Clean */}
          <div className="relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-border/20">
              <CldImage
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                {member.name}
              </h1>
              <p
                className="text-xl sm:text-2xl font-medium"
                style={{ color: organization.color.primary }}
              >
                {member.position}
              </p>
              <Badge variant="outline" className="text-sm">
                {organization.name}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              {member.joinedDate && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Joined {formatDate(member.joinedDate)}
                  </span>
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {calculateTenure(member.joinedDate)} tenure
                </span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {member.bio}
              </p>
            </div>

            {member.social && (
              <div className="flex flex-wrap gap-3 pt-4">
                {member.social.linkedin && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 hover:border-[#0077B5] hover:bg-[#0077B5]/5 transition-all duration-200"
                  >
                    <FaLinkedin className="h-4 w-4 text-[#0077B5]" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                )}
                {member.social.github && (
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 hover:border-foreground hover:bg-muted transition-all duration-200"
                  >
                    <FaGithub className="h-4 w-4" />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                )}
                {member.social.email && (
                  <a
                    href={`mailto:${member.social.email}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 hover:border-foreground hover:bg-muted transition-all duration-200"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills & Expertise */}
        {member.skills && member.skills.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${organization.color.primary}15` }}
              >
                <Code className="h-5 w-5" style={{ color: organization.color.primary }} />
              </div>
              <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Skills & Expertise
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {member.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-5 py-2.5 text-sm font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    borderColor: `${organization.color.primary}30`,
                    backgroundColor: `${organization.color.primary}08`,
                    color: organization.color.primary,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Responsibilities */}
        {member.responsibilities && member.responsibilities.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${organization.color.primary}15` }}
              >
                <Briefcase className="h-5 w-5" style={{ color: organization.color.primary }} />
              </div>
              <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Key Responsibilities
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {member.responsibilities.map((responsibility, idx) => (
                <div
                  key={idx}
                  className="group relative p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    borderColor: `${organization.color.primary}20`,
                    backgroundColor: `${organization.color.primary}03`,
                  }}
                >
                  <div
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: organization.color.primary,
                      color: 'white',
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex items-start gap-3 pl-2">
                    <div
                      className="mt-1 p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${organization.color.primary}15` }}
                    >
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: organization.color.primary }}
                      />
                    </div>
                    <p className="text-base text-foreground leading-relaxed flex-1 font-medium">
                      {responsibility}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {member.achievements && member.achievements.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${organization.color.secondary}15` }}
              >
                <Award className="h-5 w-5" style={{ color: organization.color.secondary }} />
              </div>
              <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Achievements
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {member.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                  style={{
                    borderColor: `${organization.color.secondary}25`,
                    backgroundColor: `${organization.color.secondary}05`,
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-20 h-20 opacity-10 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at top right, ${organization.color.secondary}, transparent)`,
                    }}
                  />

                  <div className="relative flex items-start gap-4">
                    <div
                      className="flex-shrink-0 p-3 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                      style={{
                        backgroundColor: `${organization.color.secondary}20`,
                        boxShadow: `0 4px 12px ${organization.color.secondary}30`,
                      }}
                    >
                      <Sparkles
                        className="h-5 w-5"
                        style={{ color: organization.color.secondary }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-foreground leading-relaxed font-medium">
                        {achievement}
                      </p>
                    </div>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ backgroundColor: organization.color.secondary }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {member.timeline && member.timeline.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${organization.color.primary}15` }}
              >
                <Calendar className="h-5 w-5" style={{ color: organization.color.primary }} />
              </div>
              <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Journey & Milestones
              </h2>
            </div>
            <Timeline events={member.timeline} accentColor={organization.color.primary} />
          </div>
        )}

        {/* Gallery */}
        {member.gallery && member.gallery.length > 0 && (
          <div className="mb-20">
            <ScrollingGallery images={member.gallery} accentColor={organization.color.primary} />
          </div>
        )}

        {/* Organization Context */}
        <div className="mb-20 pt-12 border-t border-border/50">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${organization.color.primary}15` }}
            >
              <Target className="h-5 w-5" style={{ color: organization.color.primary }} />
            </div>
            <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              About {organization.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Mission
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                {organization.mission}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Vision
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                {organization.vision}
              </p>
            </div>
          </div>

          {organization.values && organization.values.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Core Values
              </h3>
              <div className="flex flex-wrap gap-3">
                {organization.values.map((value, idx) => (
                  <span
                    key={idx}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: `${organization.color.primary}08`,
                      color: organization.color.primary,
                      borderColor: `${organization.color.primary}30`
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other Team Members */}
        {teamMembers.length > 0 && (
          <div className="mb-16 pt-12 border-t border-border/50">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${organization.color.primary}15` }}
              >
                <Users className="h-5 w-5" style={{ color: organization.color.primary }} />
              </div>
              <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Other Team Members
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {teamMembers
                .filter(m => m.id !== memberId)
                .slice(0, 10)
                .map((teamMember) => (
                  <a
                    key={teamMember.id}
                    href={`/member/${teamMember.id}`}
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border/50 hover:border-foreground/30 transition-all duration-300"
                  >
                    <CldImage
                      src={teamMember.photo}
                      alt={teamMember.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-semibold text-sm line-clamp-1">{teamMember.name}</p>
                      <p className="text-xs opacity-90 line-clamp-1">{teamMember.position}</p>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        )}

      </article>

      <DetailPageCTA
        title={`Connect With Our Team`}
        subtitle="Get in Touch"
        description={`Interested in learning more about ${organization.name}? We'd love to hear from you!`}
        primaryButtonText={member.social?.email ? `Contact ${member.name.split(' ')[0]}` : 'Contact Us'}
        primaryButtonHref={member.social?.email ? `mailto:${member.social.email}` : 'mailto:cict@university.edu'}
        contactEmail={member.social?.email || 'cict@university.edu'}
        additionalLinks={[
          ...(member.social?.linkedin ? [{
            icon: <FaLinkedin className="w-4 h-4" />,
            label: 'LinkedIn',
            href: member.social.linkedin
          }] : [])
        ]}
      />

      <DetailPageFooter />
    </div>
  );
}
