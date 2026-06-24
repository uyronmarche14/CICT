'use client';

import { Github, Linkedin, Globe, Mail } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface DevMember {
  name: string;
  role: string;
  category: string;
  bio: string;
  tags: string[];
  initials: string;
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    email?: string;
  };
}

const devTeam: DevMember[] = [
  {
    name: 'Ron Marche Rhyss Q. Uy',
    role: 'Project Lead / Full Stack Developer',
    category: 'Leadership',
    bio: 'Leads system planning, architecture, and full-stack development of the CICT digital platform across web and mobile.',
    tags: ['Full Stack', 'System Design', 'UI/UX'],
    initials: 'RU',
  },
  {
    name: 'Development Team',
    role: 'Frontend Developer',
    category: 'Frontend',
    bio: 'Builds responsive interfaces, reusable components, and user-friendly pages using modern frameworks and design systems.',
    tags: ['React', 'Next.js', 'Tailwind CSS'],
    initials: 'DT',
  },
  {
    name: 'Development Team',
    role: 'Backend Developer',
    category: 'Backend',
    bio: 'Develops APIs, database architecture, authentication, and server-side logic powering the CICT platform.',
    tags: ['Node.js', 'MongoDB', 'API Design'],
    initials: 'DT',
  },
  {
    name: 'Development Team',
    role: 'Mobile Developer',
    category: 'Mobile',
    bio: 'Creates the cross-platform mobile experience for students, enabling attendance, events, and organization access on the go.',
    tags: ['React Native', 'Expo', 'Mobile UI'],
    initials: 'DT',
  },
  {
    name: 'Development Team',
    role: 'UI/UX Designer',
    category: 'Design',
    bio: 'Designs intuitive interfaces, user flows, and visual systems that make the platform accessible and engaging for students.',
    tags: ['Figma', 'Design Systems', 'Prototyping'],
    initials: 'DT',
  },
  {
    name: 'Development Team',
    role: 'QA & Documentation',
    category: 'Quality',
    bio: 'Ensures platform reliability through testing, bug tracking, and maintaining comprehensive documentation for developers and users.',
    tags: ['Testing', 'Documentation', 'CI/CD'],
    initials: 'DT',
  },
];

const linkIcons = [
  { key: 'github' as const, icon: Github, label: 'GitHub' },
  { key: 'linkedin' as const, icon: Linkedin, label: 'LinkedIn' },
  { key: 'portfolio' as const, icon: Globe, label: 'Portfolio' },
  { key: 'email' as const, icon: Mail, label: 'Email' },
];

function DevTeamMember({ member }: { member: DevMember }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md duration-200">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
        <span className="text-xl font-bold text-primary">{member.initials}</span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-foreground">{member.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>

      <span className="mt-3 inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
        {member.category}
      </span>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">{member.bio}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {member.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {member.links && (
        <div className="mt-4 flex justify-center gap-2 pt-3 border-t border-border">
          {linkIcons.map(({ key, icon: Icon, label }) =>
            member.links?.[key] ? (
              <a
                key={key}
                href={member.links[key]}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label={`${label} — ${member.name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="w-4 h-4" />
              </a>
            ) : null
          )}
        </div>
      )}
    </article>
  );
}

export default function DevTeamSection() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="CICT Dev Team"
          subtitle="Meet the team behind the CICT digital platform — a group of student developers building, maintaining, and improving the web and mobile experience."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devTeam.map((member) => (
            <DevTeamMember key={`${member.role}-${member.category}`} member={member} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Want to collaborate or report an issue?{' '}
            <a href="#contact" className="text-primary font-semibold hover:underline">
              Contact the development team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
