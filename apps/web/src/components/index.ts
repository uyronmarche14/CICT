// ─── Root-level components ───────────────────────────────────────────────
export { default as AnnouncementsCarousel } from './announcements-carousel';
export { CleanGridBackground } from './bgRipple';
export { ClientOnly } from './client-only';
export { default as ComingSoonPage } from './ComingSoon';
export { default as ConfirmationDialog } from './confirmation-dialog';
export { default as DataTable } from './datatable';
export { DataTablePagination } from './datatable-pagination';
export { default as MeshGradientBg } from './ripplebg';
export { default as ScrollingGallery } from './ScrollingGallery';
export { StructuredContent } from './StructuredContent';
export { ThemeProvider } from './theme-provider';
export { ThemeToggle } from './theme-toggle';
export { default as Timeline } from './Timeline';

// ─── Admin components ───────────────────────────────────────────────────
export { AnnouncementForm } from './admin/AnnouncementForm';
export { ContentSectionsEditor } from './admin/ContentSectionsEditor';
export { DataTable as AdminDataTable, type ColumnDef } from './admin/DataTable';
export { RichTextEditor as DynamicRichTextEditor } from './admin/DynamicRichTextEditor';
export { EditEventForm } from './admin/EditEventForm';
export { EventForm } from './admin/EventForm';
export { EventScheduleEditor } from './admin/EventScheduleEditor';
export { GalleryManager } from './admin/GalleryManager';
export { NewsForm } from './admin/NewsForm';
export { default as QrCameraScanner } from './admin/QrCameraScanner';
export { RoleFormDialog } from './admin/RoleFormDialog';
export { Sidebar as AdminSidebar, MobileSidebar } from './admin/Sidebar';
export { UserForm } from './admin/UserForm';
export { UserManagementDialog } from './admin/UserManagementDialog';

// ─── Event components ───────────────────────────────────────────────────
export { EventCard } from './events/EventCard';

// ─── Layout components ──────────────────────────────────────────────────
export { default as FooterSection } from './layout/footer';
export { default as OptimizedLayout } from './layout/landingPage';
export { default as MainLayout } from './layout/MainLayout';
export { default as Navbar } from './layout/navbar';

// ─── Organization components ────────────────────────────────────────────
export { default as AboutCarousel } from './organizations/AboutCarousel';
export { default as AdminMemberForm } from './organizations/AdminMemberForm';
export { default as AdminMemberManager } from './organizations/AdminMemberManager';
export { default as AdminOrganizationForm } from './organizations/AdminOrganizationForm';
export { default as AboutWithTabs } from './organizations/index';
export { default as MemberCard } from './organizations/MemberCard';
export { default as MemberModal } from './organizations/MemberModal';
export { default as OrganizationContentPreview } from './organizations/OrganizationContentPreview';
export { default as OrganizationShowcase } from './organizations/OrganizationShowcase';

// ─── Organization section components ────────────────────────────────────
export { default as AchievementsSection } from './organizations/sections/AchievementsSection';
export { default as BlogDescription } from './organizations/sections/BlogDescription';
export { default as EventsSection } from './organizations/sections/EventsSection';
export { default as OrgHeroSection } from './organizations/sections/HeroSection';
export { default as MissionVisionSection } from './organizations/sections/MissionVisionSection';
export { default as ProgramsTabs } from './organizations/sections/ProgramsTabs';
export { default as TeamSection } from './organizations/sections/TeamSection';

// ─── Provider components ───────────────────────────────────────────────
export { ReactQueryProvider } from './providers/ReactQueryProvider';

// ─── Section components ─────────────────────────────────────────────────
export { default as DetailPageCTA } from './sections/DetailPageCTA';
export { default as DetailPageFooter } from './sections/DetailPageFooter';

// ─── Landing page section components ────────────────────────────────────
export { default as CICTSection } from './sections/landingpage/CICT-Section';
export { default as FAQSectionContent } from './sections/landingpage/FAQSectionContent';
export { default as FAQsSection } from './sections/landingpage/faqsSection';
export { default as LandingHeroSection } from './sections/landingpage/heroSection';
export { default as NewsSection } from './sections/landingpage/newsSection';
export { default as OfferSection } from './sections/landingpage/offerSection';
export { default as PublicSectionHeader } from './sections/landingpage/PublicSectionHeader';
export { default as StorySection } from './sections/landingpage/storySection';
export { default as WallOfLoveSection } from './sections/landingpage/Testimonial';

// ─── Update components ──────────────────────────────────────────────────
export { default as UpdateFeedCard } from './updates/UpdateFeedCard';
export { default as UpdatesHubClient } from './updates/UpdatesHubClient';

// ═════════════════════════════════════════════════════════════════════════
//  shadcn/ui components
// ═════════════════════════════════════════════════════════════════════════
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
export {
  Alert,
  AlertTitle,
  AlertDescription,
} from './ui/alert';
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';
export {
  AutoComplete,
} from './ui/autocomplete';
export type { AutoCompleteOption, AutoCompleteProps } from './ui/autocomplete';
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from './ui/avatar';
export { BackgroundImage } from './ui/background-image';
export { Badge, badgeVariants } from './ui/badge';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './ui/breadcrumb';
export { Button, buttonVariants } from './ui/button';
export { Calendar, CalendarDayButton } from './ui/calendar';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './ui/card';
export { Checkbox } from './ui/checkbox';
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible';
export { ComingSoon, type ComingSoonProps } from './ui/coming-soon';
export { ConfirmDialog } from './ui/confirm-dialog';
export { default as CustomBadge } from './ui/custom-badge';
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './ui/dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './ui/dropdown-menu';
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './ui/form';
export { Input } from './ui/input';
export { Label } from './ui/label';
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './ui/pagination';
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from './ui/popover';
export { RichTextEditor } from './ui/rich-text-editor';
export { ScrollArea, ScrollBar } from './ui/scroll-area';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './ui/select';
export { Separator } from './ui/separator';
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarInset,
  SidebarInput,
  SidebarRail,
  SidebarTrigger,
  SidebarProvider,
} from './ui/sidebar';
export { Skeleton } from './ui/skeleton';
export { Toaster } from './ui/sonner';
export { Switch } from './ui/switch';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './ui/table';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
export { Textarea } from './ui/textarea';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './ui/tooltip';
export { WavyDivider } from './ui/wavy-divider';
