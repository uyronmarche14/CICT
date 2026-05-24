'use client';

import { motion } from 'framer-motion';
import { OrganizationPage } from '@/lib/data/organizationPages';
import { OrganizationMember } from '@/types';
import MemberCard from '@/components/organizations/MemberCard';

interface TeamSectionProps {
  members: OrganizationMember[];
  color: OrganizationPage['color'];
  orgName: string;
}

export default function TeamSection({ members, color, orgName }: TeamSectionProps) {
  if (!members || members.length === 0) return null;

  const handleMemberClick = (memberId: string) => {
    window.location.href = `/member/${memberId}`;
  };

  return (
    <section className="py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Leadership</h2>
        <p className="text-muted-foreground text-lg">Meet the team behind {orgName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((member, idx) => (
          <motion.div 
            key={member.id} 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
          >
            <MemberCard
              member={member}
              organizationColor={color}
              onClick={() => handleMemberClick(member.id)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
