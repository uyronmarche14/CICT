import Organization from '../../models/Organization';
import OrganizationMember from '../../models/OrganizationMember';
import logger from '../../utils/logger';

export async function up(): Promise<void> {
  logger.info('Running migration 002: Extracting organization members...');

  const orgs = await Organization.aggregate([
    { $match: {} },
    { $project: { _id: 1, members: 1 } },
  ]);
  let totalMigrated = 0;

  for (const org of orgs) {
    if (!org.members || !Array.isArray(org.members) || org.members.length === 0) {
      continue;
    }

    const memberDocs = org.members.map((member: any) => ({
      organizationId: org._id,
      id: member.id,
      name: member.name,
      position: member.position,
      photo: member.photo,
      bio: member.bio,
      joinedDate: member.joinedDate,
      achievements: member.achievements || [],
      responsibilities: member.responsibilities || [],
      skills: member.skills || [],
      timeline: member.timeline || [],
      gallery: member.gallery || [],
      social: member.social || {},
      phone: member.phone,
      personalEmail: member.personalEmail,
      program: member.program,
      yearLevel: member.yearLevel,
      startDate: member.startDate,
      endDate: member.endDate,
      memberType: member.memberType,
      status: member.status || 'active',
      sortOrder: member.sortOrder ?? 0,
      batch: member.batch,
      termStart: member.termStart,
      termEnd: member.termEnd,
      leadershipStatus: member.leadershipStatus,
      course: member.course,
      department: member.department,
      committee: member.committee,
      displayOrder: member.displayOrder,
      isAdviser: member.isAdviser,
      contactNumber: member.contactNumber,
      projectItems: member.projectItems || [],
      milestoneItems: member.milestoneItems || [],
    }));

    await OrganizationMember.insertMany(memberDocs, { ordered: false });
    totalMigrated += memberDocs.length;
  }

  logger.info(`  ✓ Migrated ${totalMigrated} members across ${orgs.length} organizations`);

  await Organization.updateMany({}, { $unset: { members: '' } }).lean();
  logger.info('  ✓ Removed embedded members field from Organization documents');

  logger.info('Migration 002 complete.');
}

export async function down(): Promise<void> {
  logger.info('Rolling back migration 002...');

  const members = await OrganizationMember.find().lean();
  const byOrg: Record<string, any[]> = {};

  for (const member of members) {
    const orgId = String(member.organizationId);
    if (!byOrg[orgId]) {byOrg[orgId] = [];}
    byOrg[orgId].push(member);
  }

  for (const [orgId, orgMembers] of Object.entries(byOrg)) {
    const mappedMembers = orgMembers.map((m: any) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      photo: m.photo,
      bio: m.bio,
      joinedDate: m.joinedDate,
      achievements: m.achievements || [],
      responsibilities: m.responsibilities || [],
      skills: m.skills || [],
      timeline: m.timeline || [],
      gallery: m.gallery || [],
      social: m.social || {},
      phone: m.phone,
      personalEmail: m.personalEmail,
      program: m.program,
      yearLevel: m.yearLevel,
      startDate: m.startDate,
      endDate: m.endDate,
      memberType: m.memberType,
      status: m.status || 'active',
      sortOrder: m.sortOrder ?? 0,
      batch: m.batch,
      termStart: m.termStart,
      termEnd: m.termEnd,
      leadershipStatus: m.leadershipStatus,
      course: m.course,
      department: m.department,
      committee: m.committee,
      displayOrder: m.displayOrder,
      isAdviser: m.isAdviser,
      contactNumber: m.contactNumber,
      projectItems: m.projectItems || [],
      milestoneItems: m.milestoneItems || [],
    }));

    await Organization.findByIdAndUpdate(orgId, { $set: { members: mappedMembers } });
  }

  await OrganizationMember.deleteMany({});
  logger.info(`  ✓ Restored ${members.length} members back to embedded documents`);
  logger.info('Migration 002 rolled back.');
}
