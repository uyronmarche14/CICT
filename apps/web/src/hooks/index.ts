// ─── Root-level hooks ────────────────────────────────────────────────────
export { useDebounce } from './useDebounce';
export { useFAQContent } from './use-faq-content';
export { useNews, useLatestNews } from './use-news';
export { useNewsById } from './use-news-by-id';
export { usePermissionMetadata } from './use-permission-metadata';
export { useUpdatesHub } from './use-updates-hub';
export { useOrganizations, useOrganization, useAdminOrganizations, useAdminOrganization } from './useOrganizations';

// ─── Auth hooks ─────────────────────────────────────────────────────────
export { useLogout } from './auth/use-auth';

// ─── Permission hooks ───────────────────────────────────────────────────
export { useAdminPageAccess } from './permissions/use-admin-page-access';
export { usePermissions } from './permissions/use-permissions';

// ─── UI hooks ───────────────────────────────────────────────────────────
export { useCountdown } from './ui/use-countdown';
export { useIsMobile } from './ui/use-mobile';
export { useSidebar, SidebarContext } from './ui/use-sidebar';
export type { SidebarContextProps } from './ui/use-sidebar';
export { useTheme } from './ui/use-theme';

// ─── Announcement hooks ─────────────────────────────────────────────────
export { useGetAnnouncementById } from './ui/announcement/get-announcement-by-id.hook';
export { useGetAnnouncements } from './ui/announcement/get-announcements.hook';

// ─── Context hooks (re-exported for convenience) ────────────────────────
export { useAuth } from '../context/AuthContext';
export { useStudentAuth } from '../context/StudentAuthContext';
