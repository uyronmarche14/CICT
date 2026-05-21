import { Permission, PermissionMetadataGroup } from '@/types';

export const fallbackPermissionMetadataGroups: PermissionMetadataGroup[] = [
  {
    key: 'users',
    label: 'Users',
    permissions: [
      { value: Permission.VIEW_USERS, label: 'View users', description: 'See the admin user list.' },
      { value: Permission.CREATE_USER, label: 'Create users', description: 'Create admin CMS users.' },
      { value: Permission.EDIT_USER, label: 'Edit users', description: 'Edit non-privileged profile fields.' },
      { value: Permission.DELETE_USER, label: 'Delete users', description: 'Delete admin users.' },
      { value: Permission.SET_USER_STATUS, label: 'Set user status', description: 'Activate or deactivate users.' },
      { value: Permission.ASSIGN_ROLE, label: 'Assign roles', description: 'Assign system or custom roles.' },
    ],
  },
  {
    key: 'students',
    label: 'Students',
    permissions: [
      { value: Permission.VIEW_STUDENT, label: 'View students', description: 'See student records in admin.' },
      { value: Permission.CREATE_STUDENT, label: 'Create students', description: 'Provision student accounts.' },
      { value: Permission.EDIT_STUDENT, label: 'Edit students', description: 'Update student identity and academic data.' },
      { value: Permission.SET_STUDENT_STATUS, label: 'Set student status', description: 'Activate, deactivate, or suspend student accounts.' },
    ],
  },
  {
    key: 'academic',
    label: 'Academic Groups',
    permissions: [
      {
        value: Permission.VIEW_ACADEMIC_GROUPS,
        label: 'View academic groups',
        description: 'See programs, year levels, and sections.',
      },
      {
        value: Permission.MANAGE_ACADEMIC_GROUPS,
        label: 'Manage academic groups',
        description: 'Create and update programs, year levels, and sections.',
      },
    ],
  },
  {
    key: 'roles',
    label: 'Roles',
    permissions: [
      { value: Permission.VIEW_ROLE, label: 'View roles', description: 'See custom and system roles.' },
      { value: Permission.CREATE_ROLE, label: 'Create roles', description: 'Create custom roles.' },
      { value: Permission.EDIT_ROLE, label: 'Edit roles', description: 'Edit custom roles.' },
      { value: Permission.DELETE_ROLE, label: 'Delete roles', description: 'Delete custom roles.' },
    ],
  },
  {
    key: 'organizations',
    label: 'Organizations',
    permissions: [
      { value: Permission.VIEW_ORGANIZATION, label: 'View organizations', description: 'See organizations in admin.' },
      { value: Permission.CREATE_ORGANIZATION, label: 'Create organizations', description: 'Create organizations.' },
      { value: Permission.EDIT_ORGANIZATION, label: 'Edit organizations', description: 'Edit organization details.' },
      { value: Permission.DELETE_ORGANIZATION, label: 'Delete organizations', description: 'Delete organizations.' },
    ],
  },
  {
    key: 'members',
    label: 'Members',
    permissions: [
      { value: Permission.VIEW_MEMBER, label: 'View members', description: 'See organization members.' },
      { value: Permission.CREATE_MEMBER, label: 'Create members', description: 'Add organization members.' },
      { value: Permission.EDIT_MEMBER, label: 'Edit members', description: 'Update organization members.' },
      { value: Permission.DELETE_MEMBER, label: 'Delete members', description: 'Remove organization members.' },
    ],
  },
  {
    key: 'news',
    label: 'News',
    permissions: [
      { value: Permission.VIEW_NEWS, label: 'View news', description: 'See news in admin.' },
      { value: Permission.CREATE_NEWS, label: 'Create news', description: 'Create draft news.' },
      { value: Permission.EDIT_NEWS, label: 'Edit news', description: 'Edit draftable news content.' },
      { value: Permission.DELETE_NEWS, label: 'Delete news', description: 'Delete news records.' },
      { value: Permission.PUBLISH_NEWS, label: 'Publish news', description: 'Publish draft news.' },
      { value: Permission.ARCHIVE_NEWS, label: 'Archive news', description: 'Archive published news.' },
    ],
  },
  {
    key: 'announcements',
    label: 'Announcements',
    permissions: [
      { value: Permission.VIEW_ANNOUNCEMENT, label: 'View announcements', description: 'See announcements in admin.' },
      { value: Permission.CREATE_ANNOUNCEMENT, label: 'Create announcements', description: 'Create draft announcements.' },
      { value: Permission.EDIT_ANNOUNCEMENT, label: 'Edit announcements', description: 'Edit announcement content.' },
      { value: Permission.DELETE_ANNOUNCEMENT, label: 'Delete announcements', description: 'Delete announcements.' },
      { value: Permission.PUBLISH_ANNOUNCEMENT, label: 'Publish announcements', description: 'Publish draft announcements.' },
      { value: Permission.ARCHIVE_ANNOUNCEMENT, label: 'Archive announcements', description: 'Archive published announcements.' },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    permissions: [
      { value: Permission.VIEW_EVENT, label: 'View events', description: 'See events in admin.' },
      { value: Permission.CREATE_EVENT, label: 'Create events', description: 'Create draft events.' },
      { value: Permission.EDIT_EVENT, label: 'Edit events', description: 'Edit event content.' },
      { value: Permission.DELETE_EVENT, label: 'Delete events', description: 'Delete events.' },
      { value: Permission.PUBLISH_EVENT, label: 'Publish events', description: 'Publish draft events.' },
      { value: Permission.CANCEL_EVENT, label: 'Cancel events', description: 'Cancel published events.' },
      { value: Permission.COMPLETE_EVENT, label: 'Complete events', description: 'Complete published events.' },
      {
        value: Permission.VIEW_EVENT_REGISTRATIONS,
        label: 'View registrations',
        description: 'See event registration and attendance lists.',
      },
      {
        value: Permission.MANAGE_EVENT_REGISTRATIONS,
        label: 'Manage registrations',
        description: 'Manage event registrations and walk-ins.',
      },
      {
        value: Permission.SCAN_EVENT_ATTENDANCE,
        label: 'Scan attendance',
        description: 'Use the event attendance scanner.',
      },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    permissions: [
      {
        value: Permission.SUBMIT_CONTENT_FOR_APPROVAL,
        label: 'Submit for approval',
        description: 'Submit content drafts into the approval queue.',
      },
      {
        value: Permission.APPROVE_CONTENT,
        label: 'Approve content',
        description: 'Approve submitted content.',
      },
      {
        value: Permission.REJECT_CONTENT,
        label: 'Reject content',
        description: 'Reject submitted content with a reason.',
      },
    ],
  },
  {
    key: 'process',
    label: 'Process',
    permissions: [
      {
        value: Permission.VIEW_PROCESS,
        label: 'View process module',
        description: 'See process templates and instances.',
      },
      {
        value: Permission.CREATE_PROCESS,
        label: 'Create process',
        description: 'Create process templates or instances.',
      },
      {
        value: Permission.EDIT_PROCESS,
        label: 'Edit process',
        description: 'Update process templates or instances.',
      },
      {
        value: Permission.COMMENT_PROCESS,
        label: 'Comment on process',
        description: 'Add process comments and review notes.',
      },
      {
        value: Permission.APPROVE_PROCESS_STEP,
        label: 'Approve process steps',
        description: 'Approve workflow steps inside a process instance.',
      },
    ],
  },
  {
    key: 'logs',
    label: 'Activity Logs',
    permissions: [
      {
        value: Permission.VIEW_LOGS,
        label: 'View activity logs',
        description: 'See and search the admin activity audit trail.',
      },
    ],
  },
  {
    key: 'site',
    label: 'Site',
    permissions: [
      {
        value: Permission.MANAGE_SETTINGS,
        label: 'Manage site settings',
        description: 'Update shared site content such as FAQ entries.',
      },
    ],
  },
];
