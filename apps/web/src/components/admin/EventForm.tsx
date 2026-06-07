'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { eventAPI } from '@/lib/api/event';
import { appToast } from '@/lib/app-toast';
import { Plus, Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/DynamicRichTextEditor';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { ContentSectionsEditor } from '@/components/admin/ContentSectionsEditor';
import { EventScheduleEditor } from '@/components/admin/EventScheduleEditor';
import {
  AttachmentItem,
  ContentOwnerType,
  ContentSection,
  EventScheduleItem,
  MediaAsset,
  Organization,
  Permission,
  SpeakerItem,
  VenueDetails,
} from '@/types';
import { uploadsAPI } from '@/lib/api/uploads';
import { organizationService } from '@/services/organizationService';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sanitizeCoverAndGallery } from '@/lib/media';
import { academicAPI } from '@/lib/api/academic';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LookupMultiCombobox } from '@/components/ui/lookup-combobox';

const parseDateTimeLocalValue = (value: string): number => new Date(value).getTime();

const formSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    bodyHtml: z.string().min(10, 'Description must be at least 10 characters'),
    excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(200, 'Excerpt too long'),
    startDate: z.string().refine((val) => !isNaN(parseDateTimeLocalValue(val)), 'Invalid start date'),
    endDate: z.string().refine((val) => !isNaN(parseDateTimeLocalValue(val)), 'Invalid end date'),
    location: z.string().min(2, 'Location is required'),
    maxAttendees: z.string().transform((val) => (val === '' ? undefined : parseInt(val, 10))).optional(),
    tags: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const start = parseDateTimeLocalValue(values.startDate);
    const end = parseDateTimeLocalValue(values.endDate);

    if (!isNaN(start) && !isNaN(end) && start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date/time must be the same as or later than the start date/time',
      });
    }
  });

interface EventFormProps {
  onSuccess: () => void;
}
type InputFieldProps = React.ComponentProps<typeof Input>;
type RichTextFieldProps = { value: string; onChange: (value: string) => void };
type NumericFieldProps = Omit<React.ComponentProps<typeof Input>, 'onChange'> & {
  onChange: (value: string) => void;
};

export function EventForm({ onSuccess }: EventFormProps) {
  const { user } = useAuth();
  const { hasPermission, hasAnyScopedPermission } = usePermissions();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const canCreateSystemOwnedContent = hasPermission(Permission.CREATE_EVENT);
  const canCreateScopedEvents = hasAnyScopedPermission(Permission.CREATE_EVENT);
  const scopedCreateOrganizationIds = useMemo(
    () =>
      Array.from(
        new Set(
          (user?.organizationAssignments ?? [])
            .filter((assignment) => assignment.permissions.includes(Permission.CREATE_EVENT))
            .map((assignment) => assignment.organizationId)
        )
      ),
    [user?.organizationAssignments]
  );
  const [ownerType, setOwnerType] = useState<ContentOwnerType>(
    scopedCreateOrganizationIds.length > 0
      ? ContentOwnerType.ORGANIZATION
      : canCreateSystemOwnedContent
        ? ContentOwnerType.SYSTEM
        : ContentOwnerType.ORGANIZATION
  );
  const [organizationId, setOrganizationId] = useState('');
  const [coverImage, setCoverImage] = useState<MediaAsset | undefined>();
  const [gallery, setGallery] = useState<MediaAsset[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [schedule, setSchedule] = useState<EventScheduleItem[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [allowWalkIns, setAllowWalkIns] = useState(false);
  const [registrationCloseAt, setRegistrationCloseAt] = useState('');
  const [programs, setPrograms] = useState<{ _id: string; name: string }[]>([]);
  const [yearLevels, setYearLevels] = useState<{ _id: string; label: string }[]>([]);
  const [academicSections, setAcademicSections] = useState<{ _id: string; displayName: string }[]>([]);
  const [targetProgramIds, setTargetProgramIds] = useState<string[]>([]);
  const [targetYearLevelIds, setTargetYearLevelIds] = useState<string[]>([]);
  const [targetSectionIds, setTargetSectionIds] = useState<string[]>([]);
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [hostOrganizationIds, setHostOrganizationIds] = useState<string[]>([]);
  const [coHostOrganizationIds, setCoHostOrganizationIds] = useState<string[]>([]);
  const [speakerItems, setSpeakerItems] = useState<SpeakerItem[]>([]);
  const [audience, setAudience] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [feeLabel, setFeeLabel] = useState('');
  const [certificateInfo, setCertificateInfo] = useState('');
  const [venueDetails, setVenueDetails] = useState<VenueDetails | undefined>(undefined);
  const [mapUrl, setMapUrl] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [requirements, setRequirements] = useState('');
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>([]);
  const [posterCaption, setPosterCaption] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      bodyHtml: '',
      excerpt: '',
      startDate: '',
      endDate: '',
      location: '',
      maxAttendees: undefined,
      tags: '',
    },
  });
  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchOrganizations = async () => {
      try {
        const data = await organizationService.getAll();
        setOrganizations(data);
      } catch (error) {
        console.error('Failed to fetch organizations for event ownership:', error);
      }
    };

    const fetchAcademicData = async () => {
      try {
        const [progs, levels, secs] = await Promise.all([
          academicAPI.getPrograms(),
          academicAPI.getYearLevels(),
          academicAPI.getSections(),
        ]);
        setPrograms(progs);
        setYearLevels(levels);
        setAcademicSections(secs);
      } catch (error) {
        console.error('Failed to fetch academic data:', error);
      }
    };

    fetchOrganizations();
    fetchAcademicData();
  }, [open]);

  const availableOrganizations = useMemo(() => {
    if (canCreateSystemOwnedContent) {
      return organizations;
    }

    const allowedIds = new Set(scopedCreateOrganizationIds);

    return organizations.filter((organization) => allowedIds.has(organization.id));
  }, [canCreateSystemOwnedContent, organizations, scopedCreateOrganizationIds]);

  const preferredOrganizations = useMemo(() => {
    const scopedOrganizations = organizations.filter((organization) =>
      scopedCreateOrganizationIds.includes(organization.id)
    );

    return scopedOrganizations.length > 0 ? scopedOrganizations : availableOrganizations;
  }, [availableOrganizations, organizations, scopedCreateOrganizationIds]);

  const selectedOrganizationName =
    organizations.find((organization) => organization.id === organizationId)?.name ?? 'selected organization';

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultOwnerType =
      scopedCreateOrganizationIds.length > 0
        ? ContentOwnerType.ORGANIZATION
        : canCreateSystemOwnedContent
          ? ContentOwnerType.SYSTEM
          : ContentOwnerType.ORGANIZATION;

    setOwnerType(defaultOwnerType);
    setOrganizationId(
      defaultOwnerType === ContentOwnerType.ORGANIZATION
        ? preferredOrganizations[0]?.id ?? ''
        : ''
    );
  }, [open, canCreateSystemOwnedContent, preferredOrganizations, scopedCreateOrganizationIds]);

  useEffect(() => {
    if (ownerType === ContentOwnerType.SYSTEM) {
      setOrganizationId('');
      return;
    }

    if (
      (!organizationId || !availableOrganizations.some((organization) => organization.id === organizationId)) &&
      preferredOrganizations.length > 0
    ) {
      setOrganizationId(preferredOrganizations[0].id);
    }
  }, [ownerType, organizationId, availableOrganizations, preferredOrganizations]);

  useEffect(() => {
    if (!coverImage || gallery.length === 0) {
      return;
    }

    const { gallery: sanitizedGallery, removedDuplicates } = sanitizeCoverAndGallery(
      coverImage,
      gallery
    );

    if (removedDuplicates > 0) {
      setGallery(sanitizedGallery);
      appToast.info('Gallery Cleaned', 'Duplicate gallery image(s) removed (reserved for cover image).');
    }
  }, [coverImage, gallery]);

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const [uploadedImage] = await uploadsAPI.uploadImages([file]);
      setCoverImage(uploadedImage);
    } catch (error) {
      console.error('Failed to upload cover image:', error);
    } finally {
      setUploadingCover(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (ownerType === ContentOwnerType.ORGANIZATION && !organizationId) {
        appToast.error('Missing Organization', 'Select an organization before saving this event.');
        setIsLoading(false);
        return;
      }

      const { gallery: sanitizedGallery, removedDuplicates } = sanitizeCoverAndGallery(
        coverImage,
        gallery
      );
      if (removedDuplicates > 0) {
        setGallery(sanitizedGallery);
        appToast.info('Gallery Cleaned', 'Duplicate image(s) removed from gallery before saving.');
      }

      await eventAPI.create({
        title: values.title,
        bodyHtml: values.bodyHtml,
        description: values.bodyHtml,
        excerpt: values.excerpt,
        ownerType,
        organizationId: ownerType === ContentOwnerType.ORGANIZATION ? organizationId : null,
        startDate: values.startDate,
        endDate: values.endDate,
        location: values.location,
        maxAttendees: typeof values.maxAttendees === 'number' ? values.maxAttendees : undefined,
        tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        coverImage,
        imageUrl: coverImage?.imageUrl,
        imageId: coverImage?.imageId,
        gallery: sanitizedGallery,
        sections,
        schedule,
        isRegistrationOpen,
        allowWalkIns,
        registrationCloseAt: registrationCloseAt || undefined,
        targetProgramIds: targetProgramIds.length > 0 ? targetProgramIds : undefined,
        targetYearLevelIds: targetYearLevelIds.length > 0 ? targetYearLevelIds : undefined,
        targetSectionIds: targetSectionIds.length > 0 ? targetSectionIds : undefined,
        registrationUrl: registrationUrl || undefined,
        registrationDeadline: registrationDeadline || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        hostOrganizationIds: hostOrganizationIds.length > 0 ? hostOrganizationIds : undefined,
        coHostOrganizationIds: coHostOrganizationIds.length > 0 ? coHostOrganizationIds : undefined,
        speakerItems: speakerItems.length > 0 ? speakerItems : undefined,
        audience: audience || undefined,
        eligibility: eligibility || undefined,
        feeLabel: feeLabel || undefined,
        certificateInfo: certificateInfo || undefined,
        venueDetails: venueDetails || undefined,
        mapUrl: mapUrl || undefined,
        meetingUrl: meetingUrl || undefined,
        requirements: requirements || undefined,
        attachmentItems: attachmentItems.length > 0 ? attachmentItems : undefined,
        posterCaption: posterCaption || undefined,
      });
      appToast.success('Event Created', 'The event has been created and will appear after approval.');
      setOpen(false);
      form.reset();
      setCoverImage(undefined);
      setGallery([]);
      setSections([]);
      setSchedule([]);
      setIsRegistrationOpen(true);
      setAllowWalkIns(false);
      setRegistrationCloseAt('');
      setTargetProgramIds([]);
      setTargetYearLevelIds([]);
      setTargetSectionIds([]);
      setRegistrationUrl('');
      setRegistrationDeadline('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setHostOrganizationIds([]);
      setCoHostOrganizationIds([]);
      setSpeakerItems([]);
      setAudience('');
      setEligibility('');
      setFeeLabel('');
      setCertificateInfo('');
      setVenueDetails(undefined);
      setMapUrl('');
      setMeetingUrl('');
      setRequirements('');
      setAttachmentItems([]);
      setPosterCaption('');
      onSuccess();
    } catch (error) {
      console.error('Failed to create event:', error);
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response!.data!.message!
          : 'Failed to create event';
      appToast.error('Creation Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Tech Summit 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FormLabel>Content Ownership</FormLabel>
                <Select
                  value={ownerType}
                  onValueChange={(value) => setOwnerType(value as ContentOwnerType)}
                  disabled={!canCreateSystemOwnedContent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    {canCreateSystemOwnedContent ? (
                      <SelectItem value={ContentOwnerType.SYSTEM}>System-owned</SelectItem>
                    ) : null}
                    <SelectItem value={ContentOwnerType.ORGANIZATION}>Organization-owned</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Organization pages only surface published organization-owned events. Use system-owned only for college-wide events.
                </p>
              </div>

              {ownerType === ContentOwnerType.ORGANIZATION ? (
                <div className="space-y-2">
                  <FormLabel>Publish To Organization</FormLabel>
                  <Select value={organizationId} onValueChange={setOrganizationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOrganizations.map((organization) => (
                        <SelectItem key={organization.id} value={organization.id}>
                          {organization.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!canCreateScopedEvents && !canCreateSystemOwnedContent ? (
                    <p className="text-xs text-destructive">
                      You do not currently have permission to publish events for any organization.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {ownerType === ContentOwnerType.SYSTEM
                  ? 'This event will appear as a system-wide CICT event after approval and publication.'
                  : `This event will appear under ${selectedOrganizationName} after approval and publication.`}
              </p>
              <p className="mt-1 text-muted-foreground">
                Pick organization-owned content for events that should show up on student organization tabs and organization homepages.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>Start Date/Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>End Date/Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Auditorium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAttendees"
                render={({ field }: { field: NumericFieldProps }) => (
                  <FormItem>
                    <FormLabel>Max Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0 for unlimited"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <h3 className="font-medium text-sm">Registration Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="isRegistrationOpen"
                    checked={isRegistrationOpen}
                    onCheckedChange={(checked) => setIsRegistrationOpen(!!checked)}
                  />
                  <Label htmlFor="isRegistrationOpen" className="text-sm cursor-pointer">Registration Open</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="allowWalkIns"
                    checked={allowWalkIns}
                    onCheckedChange={(checked) => setAllowWalkIns(!!checked)}
                  />
                  <Label htmlFor="allowWalkIns" className="text-sm cursor-pointer">Allow Walk-ins</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Registration Close</Label>
                  <Input
                    type="datetime-local"
                    value={registrationCloseAt}
                    onChange={(e) => setRegistrationCloseAt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <h3 className="font-medium text-sm">Additional Registration Fields</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Registration URL</Label>
                  <Input
                    placeholder="https://..."
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Registration Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Audience</Label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. CICT students, faculty, and staff"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Eligibility Criteria</Label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Must be enrolled in CICT"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fee Label</Label>
                  <Input
                    placeholder='e.g. "Free", "₱50"'
                    value={feeLabel}
                    onChange={(e) => setFeeLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Certificate Info</Label>
                  <Input
                    placeholder="e.g. Certificate of Participation"
                    value={certificateInfo}
                    onChange={(e) => setCertificateInfo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <h3 className="font-medium text-sm">Contact Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <Input
                    placeholder="+63 912 345 6789"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <h3 className="font-medium text-sm">Venue Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Venue Name</Label>
                  <Input
                    placeholder="e.g. CICT Auditorium"
                    value={venueDetails?.name ?? ''}
                    onChange={(e) => setVenueDetails({ ...venueDetails, name: e.target.value } as VenueDetails)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Venue Address</Label>
                  <Input
                    placeholder="e.g. CICT Building, UPV"
                    value={venueDetails?.address ?? ''}
                    onChange={(e) => setVenueDetails({ ...venueDetails, address: e.target.value } as VenueDetails)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Room</Label>
                  <Input
                    placeholder="e.g. Room 201"
                    value={venueDetails?.room ?? ''}
                    onChange={(e) => setVenueDetails({ ...venueDetails, room: e.target.value } as VenueDetails)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Capacity</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 200"
                    value={venueDetails?.capacity ?? ''}
                    onChange={(e) => setVenueDetails({ ...venueDetails, capacity: parseInt(e.target.value) || undefined } as VenueDetails)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Accessibility Info</Label>
                  <Input
                    placeholder="e.g. Wheelchair accessible"
                    value={venueDetails?.accessibility ?? ''}
                    onChange={(e) => setVenueDetails({ ...venueDetails, accessibility: e.target.value } as VenueDetails)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Map URL</Label>
                  <Input
                    placeholder="https://maps.google.com/..."
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meeting URL (for virtual)</Label>
                  <Input
                    placeholder="https://meet.google.com/..."
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <h3 className="font-medium text-sm">Additional Info</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Requirements / What to Bring</Label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Laptop, valid ID"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Poster Caption</Label>
                  <Input
                    placeholder="Caption for the event poster"
                    value={posterCaption}
                    onChange={(e) => setPosterCaption(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Host Organizations</Label>
                  <LookupMultiCombobox
                    kind="organizations"
                    value={hostOrganizationIds}
                    onChange={setHostOrganizationIds}
                    placeholder="Select host organizations"
                    searchPlaceholder="Search organizations..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Co-Host Organizations</Label>
                  <LookupMultiCombobox
                    kind="organizations"
                    value={coHostOrganizationIds}
                    onChange={setCoHostOrganizationIds}
                    placeholder="Select co-host organizations"
                    searchPlaceholder="Search organizations..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <h3 className="font-medium text-sm">Target Eligibility</h3>
              <p className="text-xs text-muted-foreground">Leave empty to allow all students to register.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Programs</Label>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    {programs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No programs available</p>
                    ) : (
                      programs.map((p) => (
                        <Label key={p._id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                          <Checkbox
                            checked={targetProgramIds.includes(p._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTargetProgramIds((prev) => [...prev, p._id]);
                              } else {
                                setTargetProgramIds((prev) => prev.filter((id) => id !== p._id));
                              }
                            }}
                          />
                          {p.name}
                        </Label>
                      ))
                    )}
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Year Levels</Label>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    {yearLevels.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No year levels available</p>
                    ) : (
                      yearLevels.map((yl) => (
                        <Label key={yl._id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                          <Checkbox
                            checked={targetYearLevelIds.includes(yl._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTargetYearLevelIds((prev) => [...prev, yl._id]);
                              } else {
                                setTargetYearLevelIds((prev) => prev.filter((id) => id !== yl._id));
                              }
                            }}
                          />
                          {yl.label}
                        </Label>
                      ))
                    )}
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sections</Label>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    {academicSections.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No sections available</p>
                    ) : (
                      academicSections.map((s) => (
                        <Label key={s._id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                          <Checkbox
                            checked={targetSectionIds.includes(s._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTargetSectionIds((prev) => [...prev, s._id]);
                              } else {
                                setTargetSectionIds((prev) => prev.filter((id) => id !== s._id));
                              }
                            }}
                          />
                          {s.displayName}
                        </Label>
                      ))
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bodyHtml"
              render={({ field }: { field: RichTextFieldProps }) => (
                <FormItem>
                  <FormLabel>Event Body</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write the event details..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="career, workshop, seminar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ContentSectionsEditor sections={sections} onChange={setSections} />
            <EventScheduleEditor schedule={schedule} onChange={setSchedule} />

            <div className="space-y-3">
              <FormLabel>Cover Image</FormLabel>
              <p className="text-xs text-muted-foreground">
                The cover image is the hero image used on cards and detail pages. Do not reuse it as a gallery image.
              </p>
              <Input type="file" accept="image/*" onChange={handleCoverImageChange} />
              {uploadingCover ? <p className="text-sm text-muted-foreground">Uploading cover image...</p> : null}
              {coverImage ? (
                <div className="overflow-hidden rounded-md border">
                  <Image
                    src={coverImage.imageUrl}
                    alt={coverImage.alt ?? ''}
                    width={800}
                    height={224}
                    className="h-56 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <GalleryManager
              label="Supporting Gallery"
              coverImage={coverImage}
              gallery={gallery}
              onChange={setGallery}
              onDuplicateRemoval={() =>
                appToast.info('Gallery Cleaned', 'Duplicate gallery image(s) removed (reserved for cover image).')
              }
            />
            <p className="text-xs text-muted-foreground">
              Gallery images appear below the event details as supporting media only. The system removes any gallery image that duplicates the cover image.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Event
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
