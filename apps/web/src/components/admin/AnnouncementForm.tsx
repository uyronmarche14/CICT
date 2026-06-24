'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Announcement,
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  ContentSection,
  MediaAsset,
  Organization,
  Permission,
  OfficerItem,
  AwardItem,
  AttachmentItem,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/DynamicRichTextEditor';
import { ContentSectionsEditor } from '@/components/admin/ContentSectionsEditor';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { uploadsAPI } from '@/lib/api/uploads';
import { organizationService } from '@/services/organizationService';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { appToast } from '@/lib/app-toast';
import { sanitizeCoverAndGallery } from '@/lib/media';
import { LookupCombobox } from '@/components/ui/lookup-combobox';
import { ReferenceDataSelect } from '@/components/ui/reference-data-select';
import { adminContentAPI } from '@/features/admin-content';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  bodyHtml: z.string().min(10, 'Content must be at least 10 characters'),
  priority: z.nativeEnum(AnnouncementPriority),
  type: z.nativeEnum(AnnouncementType),
  targetAudience: z.string().min(1, 'Target audience is required'),
  expiresAt: z.string().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;
type InputFieldProps = React.ComponentProps<typeof Input>;
type RichTextFieldProps = { value: string; onChange: (value: string) => void };
type SelectFieldProps = { value: string; onChange: (value: string) => void };

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onSuccess: () => void;
}

export function AnnouncementForm({
  open,
  onOpenChange,
  announcement,
  onSuccess,
}: AnnouncementFormProps) {
  const { user } = useAuth();
  const { hasPermission, hasAnyScopedPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const canCreateSystemOwnedContent = hasPermission(Permission.CREATE_ANNOUNCEMENT);
  const canCreateScopedAnnouncements = hasAnyScopedPermission(Permission.CREATE_ANNOUNCEMENT);
  const scopedCreateOrganizationIds = useMemo(
    () =>
      Array.from(
        new Set(
          (user?.organizationAssignments ?? [])
            .filter((assignment) =>
              assignment.permissions.includes(Permission.CREATE_ANNOUNCEMENT)
            )
            .map((assignment) => assignment.organizationId)
        )
      ),
    [user?.organizationAssignments]
  );
  const [ownerType, setOwnerType] = useState<ContentOwnerType>(
    announcement?.ownerType ??
      (scopedCreateOrganizationIds.length > 0
        ? ContentOwnerType.ORGANIZATION
        : canCreateSystemOwnedContent
          ? ContentOwnerType.SYSTEM
          : ContentOwnerType.ORGANIZATION)
  );
  const [organizationId, setOrganizationId] = useState(announcement?.organizationId ?? '');
  const [coverImage, setCoverImage] = useState<MediaAsset | undefined>(
    announcement?.coverImage ??
      (announcement?.imageUrl
        ? { imageUrl: announcement.imageUrl, alt: announcement.title }
        : undefined)
  );
  const [gallery, setGallery] = useState<MediaAsset[]>(announcement?.gallery ?? []);
  const [sections, setSections] = useState<ContentSection[]>(announcement?.sections ?? []);
  const [subtype, setSubtype] = useState<string>(announcement?.subtype ?? '');
  const [effectiveDate, setEffectiveDate] = useState<string>(announcement?.effectiveDate ?? '');
  const [termStart, setTermStart] = useState<string>(announcement?.termStart ?? '');
  const [termEnd, setTermEnd] = useState<string>(announcement?.termEnd ?? '');
  const [relatedOrgId, setRelatedOrgId] = useState<string>(announcement?.relatedOrganizationId ?? '');
  const [relatedEventId, setRelatedEventId] = useState<string>(announcement?.relatedEventId ?? '');
  const [approvalSource, setApprovalSource] = useState<string>(announcement?.approvalSource ?? '');
  const [contactName, setContactName] = useState<string>(announcement?.contactName ?? '');
  const [contactEmail, setContactEmail] = useState<string>(announcement?.contactEmail ?? '');
  const [ctaLabel, setCtaLabel] = useState<string>(announcement?.ctaLabel ?? '');
  const [ctaUrl, setCtaUrl] = useState<string>(announcement?.ctaUrl ?? '');
  const [officerItems, setOfficerItems] = useState<OfficerItem[]>(announcement?.officerItems ?? []);
  const [outgoingOfficerItems, setOutgoingOfficerItems] = useState<OfficerItem[]>(announcement?.outgoingOfficerItems ?? []);
  const [awardItems, setAwardItems] = useState<AwardItem[]>(announcement?.awardItems ?? []);
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>(announcement?.attachmentItems ?? []);

  const parseOfficerItems = (value: string): OfficerItem[] =>
    value.split(',').map(pair => {
      const [position, name] = pair.split('|').map(s => s.trim());
      return position && name ? { position, name } : null;
    }).filter(Boolean) as OfficerItem[];

  const parseAwardItems = (value: string): AwardItem[] =>
    value.split(',').map(pair => {
      const [title, recipient] = pair.split('|').map(s => s.trim());
      return title && recipient ? { title, recipient } : null;
    }).filter(Boolean) as AwardItem[];

  const parseAttachmentItems = (value: string): AttachmentItem[] =>
    value.split(',').map(pair => {
      const [label, url] = pair.split('|').map(s => s.trim());
      return label && url ? { label, url } : null;
    }).filter(Boolean) as AttachmentItem[];

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: useMemo(
      () => ({
        title: announcement?.title || '',
        bodyHtml: announcement?.bodyHtml || announcement?.content || '',
        priority: announcement?.priority || AnnouncementPriority.MEDIUM,
        type: announcement?.type || AnnouncementType.GENERAL,
        targetAudience: announcement?.targetAudience?.join(', ') || 'all',
        expiresAt: announcement?.expiresAt
          ? new Date(announcement.expiresAt).toISOString().split('T')[0]
          : '',
      }),
      [announcement]
    ),
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
        console.error('Failed to fetch organizations for announcement ownership:', error);
      }
    };

    fetchOrganizations();
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
    if (announcement) {
      setOwnerType(announcement.ownerType);
      setOrganizationId(announcement.organizationId ?? '');
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
  }, [announcement, canCreateSystemOwnedContent, open, preferredOrganizations, scopedCreateOrganizationIds]);

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
      setCoverImage({
        ...uploadedImage,
        alt: uploadedImage.alt || announcement?.title || 'Announcement cover image',
      });
    } catch (error) {
      console.error('Failed to upload cover image:', error);
    } finally {
      setUploadingCover(false);
    }
  };

  const onSubmit = async (data: AnnouncementFormValues) => {
    setLoading(true);
    try {
      if (ownerType === ContentOwnerType.ORGANIZATION && !organizationId) {
        form.setError('root', {
          message: 'Select the organization that should own this announcement.',
        });
        setLoading(false);
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

      const payload = {
        title: data.title,
        bodyHtml: data.bodyHtml,
        content: data.bodyHtml,
        ownerType,
        organizationId: ownerType === ContentOwnerType.ORGANIZATION ? organizationId : null,
        priority: data.priority,
        type: data.type,
        targetAudience: data.targetAudience.split(',').map((value) => value.trim()).filter(Boolean),
        expiresAt: data.expiresAt || undefined,
        coverImage,
        imageUrl: coverImage?.imageUrl,
        imageId: coverImage?.imageId,
        gallery: sanitizedGallery,
        sections,
        subtype: subtype || undefined,
        effectiveDate: effectiveDate || undefined,
        termStart: termStart || undefined,
        termEnd: termEnd || undefined,
        relatedOrganizationId: relatedOrgId || undefined,
        relatedEventId: relatedEventId || undefined,
        approvalSource: approvalSource || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        ctaLabel: ctaLabel || undefined,
        ctaUrl: ctaUrl || undefined,
        officerItems: officerItems.length > 0 ? officerItems : undefined,
        outgoingOfficerItems: outgoingOfficerItems.length > 0 ? outgoingOfficerItems : undefined,
        awardItems: awardItems.length > 0 ? awardItems : undefined,
        attachmentItems: attachmentItems.length > 0 ? attachmentItems : undefined,
      };

      await adminContentAPI.announcements.save(payload, announcement?._id);

      appToast.success('Announcement Saved', 'The announcement has been saved successfully.');
      onSuccess();
      onOpenChange(false);
      form.reset();
      setCoverImage(undefined);
      setGallery([]);
      setSections([]);
      setSubtype('');
      setEffectiveDate('');
      setTermStart('');
      setTermEnd('');
      setRelatedOrgId('');
      setRelatedEventId('');
      setApprovalSource('');
      setContactName('');
      setContactEmail('');
      setCtaLabel('');
      setCtaUrl('');
      setOfficerItems([]);
      setOutgoingOfficerItems([]);
      setAwardItems([]);
      setAttachmentItems([]);
    } catch (error) {
      console.error('Failed to save announcement:', error);
      form.setError('root', { message: 'Failed to save announcement' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[840px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{announcement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
          <DialogDescription>
            {announcement ? 'Update the announcement body, sections, and gallery.' : 'Create a richer announcement with structured supporting details.'}
          </DialogDescription>
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
                    <Input placeholder="Announcement title" {...field} />
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
                  Organization pages only surface published organization-owned announcements. Use system-owned only for college-wide notices.
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
                  {!canCreateScopedAnnouncements && !canCreateSystemOwnedContent ? (
                    <p className="text-xs text-destructive">
                      You do not currently have permission to publish announcements for any organization.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {ownerType === ContentOwnerType.SYSTEM
                  ? 'This announcement will appear as a system-wide CICT notice.'
                  : `This announcement will appear under ${selectedOrganizationName} after approval and publication.`}
              </p>
              <p className="mt-1 text-muted-foreground">
                Pick organization-owned content for updates that should show up on organization tabs and organization homepages.
              </p>
            </div>

            <FormField
              control={form.control}
              name="bodyHtml"
              render={({ field }: { field: RichTextFieldProps }) => (
                <FormItem>
                  <FormLabel>Announcement Body</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write the announcement content..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ContentSectionsEditor sections={sections} onChange={setSections} />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }: { field: SelectFieldProps }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AnnouncementPriority.LOW}>Low</SelectItem>
                        <SelectItem value={AnnouncementPriority.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={AnnouncementPriority.HIGH}>High</SelectItem>
                        <SelectItem value={AnnouncementPriority.URGENT}>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }: { field: SelectFieldProps }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AnnouncementType.GENERAL}>General</SelectItem>
                        <SelectItem value={AnnouncementType.ACADEMIC}>Academic</SelectItem>
                        <SelectItem value={AnnouncementType.EVENT}>Event</SelectItem>
                        <SelectItem value={AnnouncementType.EMERGENCY}>Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input placeholder="students, faculty, all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>Expires At</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Subtype</FormLabel>
                    <ReferenceDataSelect
                      groupKey="announcementSubtypes"
                      value={subtype}
                      onChange={setSubtype}
                      placeholder="Select subtype"
                      fallback={[
                        { value: 'leadership', label: 'Leadership' },
                        { value: 'recognition', label: 'Recognition' },
                        { value: 'general', label: 'General' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Effective Date</FormLabel>
                    <Input
                      type="datetime-local"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Term Start</FormLabel>
                    <Input
                      type="datetime-local"
                      value={termStart}
                      onChange={(e) => setTermStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Term End</FormLabel>
                    <Input
                      type="datetime-local"
                      value={termEnd}
                      onChange={(e) => setTermEnd(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Content</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FormLabel>Related Organization</FormLabel>
                  <LookupCombobox
                    kind="organizations"
                    value={relatedOrgId}
                    onChange={setRelatedOrgId}
                    placeholder="Select organization"
                    searchPlaceholder="Search organizations..."
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Related Event</FormLabel>
                  <LookupCombobox
                    kind="events"
                    value={relatedEventId}
                    onChange={setRelatedEventId}
                    placeholder="Select event"
                    searchPlaceholder="Search events..."
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Approval Source</FormLabel>
                  <Input
                    value={approvalSource}
                    onChange={(e) => setApprovalSource(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact & CTA</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Contact Name</FormLabel>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Contact Email</FormLabel>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>CTA Label</FormLabel>
                  <Input
                    placeholder="Register Now"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>CTA URL</FormLabel>
                  <Input
                    placeholder="https://..."
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Officers & Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Incoming Officers</FormLabel>
                    <Input
                      placeholder="President|John Doe, VP|Jane Smith"
                      value={officerItems.map((o) => `${o.position}|${o.name}`).join(', ')}
                      onChange={(e) => setOfficerItems(parseOfficerItems(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Format: position|name, position|name</p>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Outgoing Officers</FormLabel>
                    <Input
                      placeholder="President|John Doe, VP|Jane Smith"
                      value={outgoingOfficerItems.map((o) => `${o.position}|${o.name}`).join(', ')}
                      onChange={(e) => setOutgoingOfficerItems(parseOfficerItems(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Format: position|name, position|name</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Awards</FormLabel>
                    <Input
                      placeholder="Best Leader|John Doe, Dean's List|Jane Smith"
                      value={awardItems.map((a) => `${a.title}|${a.recipient}`).join(', ')}
                      onChange={(e) => setAwardItems(parseAwardItems(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Format: title|recipient, title|recipient</p>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Attachments</FormLabel>
                    <Input
                      placeholder="Guidelines|https://..., Form|https://..."
                      value={attachmentItems.map((a) => `${a.label}|${a.url}`).join(', ')}
                      onChange={(e) => setAttachmentItems(parseAttachmentItems(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Format: label|url, label|url</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
              Gallery images appear below the announcement body as supporting media only. The system removes any gallery image that duplicates the cover image.
            </p>

            <FormField
              control={form.control}
              name="bodyHtml"
              render={() => <FormMessage>{form.formState.errors.root?.message}</FormMessage>}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {announcement ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
