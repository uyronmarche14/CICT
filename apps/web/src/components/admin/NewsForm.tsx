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
import { Textarea } from '@/components/ui/textarea';
import {
  ContentOwnerType,
  ContentSection,
  MediaAsset,
  News,
  Organization,
  Permission,
  ReferenceLink,
  AttachmentItem,
} from '@/types';
import api from '@/lib/api/axios';
import { Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/DynamicRichTextEditor';
import { ContentSectionsEditor } from '@/components/admin/ContentSectionsEditor';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { uploadsAPI } from '@/lib/api/uploads';
import { organizationService } from '@/services/organizationService';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { appToast } from '@/lib/app-toast';
import { sanitizeCoverAndGallery } from '@/lib/media';

const newsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  bodyHtml: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().min(5, 'Excerpt must be at least 5 characters'),
  tags: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;
type InputFieldProps = React.ComponentProps<typeof Input>;
type TextareaFieldProps = React.ComponentProps<typeof Textarea>;
type RichTextFieldProps = { value: string; onChange: (value: string) => void };

interface NewsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news?: News | null;
  onSuccess: () => void;
}

export function NewsForm({ open, onOpenChange, news, onSuccess }: NewsFormProps) {
  const { user } = useAuth();
  const { hasPermission, hasAnyScopedPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const canCreateSystemOwnedContent = hasPermission(Permission.CREATE_NEWS);
  const canCreateScopedNews = hasAnyScopedPermission(Permission.CREATE_NEWS);
  const scopedCreateOrganizationIds = useMemo(
    () =>
      Array.from(
        new Set(
          (user?.organizationAssignments ?? [])
            .filter((assignment) => assignment.permissions.includes(Permission.CREATE_NEWS))
            .map((assignment) => assignment.organizationId)
        )
      ),
    [user?.organizationAssignments]
  );
  const [ownerType, setOwnerType] = useState<ContentOwnerType>(
    news?.ownerType ??
      (scopedCreateOrganizationIds.length > 0
        ? ContentOwnerType.ORGANIZATION
        : canCreateSystemOwnedContent
          ? ContentOwnerType.SYSTEM
          : ContentOwnerType.ORGANIZATION)
  );
  const [organizationId, setOrganizationId] = useState(news?.organizationId ?? '');
  const [coverImage, setCoverImage] = useState<MediaAsset | undefined>(
    news?.coverImage ??
      (news?.imageUrl
        ? {
            imageUrl: news.imageUrl,
            alt: news.title,
          }
        : undefined)
  );
  const [gallery, setGallery] = useState<MediaAsset[]>(news?.gallery ?? []);
  const [sections, setSections] = useState<ContentSection[]>(news?.sections ?? []);
  const [category, setCategory] = useState<string>(news?.category ?? '');
  const [featured, setFeatured] = useState<boolean>(news?.featured ?? false);
  const [pinned, setPinned] = useState<boolean>(news?.pinned ?? false);
  const [sourceUrl, setSourceUrl] = useState<string>(news?.sourceUrl ?? '');
  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>(news?.referenceLinks ?? []);
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>(news?.attachmentItems ?? []);
  const [readingTime, setReadingTime] = useState<number | undefined>(news?.readingTime);
  const [authorDisplayName, setAuthorDisplayName] = useState<string>(news?.authorDisplayName ?? '');
  const [authorRole, setAuthorRole] = useState<string>(news?.authorRole ?? '');
  const [associatedEventId, setAssociatedEventId] = useState<string>(news?.associatedEventId ?? '');
  const [associatedOrganizationId, setAssociatedOrganizationId] = useState<string>(news?.associatedOrganizationId ?? '');
  const [spotlightLabel, setSpotlightLabel] = useState<string>(news?.spotlightLabel ?? '');
  const [seoDescription, setSeoDescription] = useState<string>(news?.seoDescription ?? '');
  const [canonicalSlug, setCanonicalSlug] = useState<string>(news?.canonicalSlug ?? '');
  const [relatedArticleIds, setRelatedArticleIds] = useState<string[]>(news?.relatedArticleIds ?? []);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: useMemo(
      () => ({
        title: news?.title || '',
        bodyHtml: news?.bodyHtml || news?.content || '',
        excerpt: news?.excerpt || '',
        tags: news?.tags?.join(', ') || '',
      }),
      [news]
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
        console.error('Failed to fetch organizations for news ownership:', error);
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
    if (news) {
      setOwnerType(news.ownerType);
      setOrganizationId(news.organizationId ?? '');
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
  }, [news, canCreateSystemOwnedContent, open, preferredOrganizations, scopedCreateOrganizationIds]);

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
        alt: uploadedImage.alt || news?.title || 'News cover image',
      });
    } catch (error) {
      console.error('Failed to upload cover image:', error);
    } finally {
      setUploadingCover(false);
    }
  };

  const onSubmit = async (data: NewsFormValues) => {
    setLoading(true);
    try {
      if (ownerType === ContentOwnerType.ORGANIZATION && !organizationId) {
        form.setError('root', {
          message: 'Select the organization that should own this news article.',
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
        excerpt: data.excerpt,
        ownerType,
        organizationId: ownerType === ContentOwnerType.ORGANIZATION ? organizationId : null,
        tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        coverImage,
        imageUrl: coverImage?.imageUrl,
        imageId: coverImage?.imageId,
        gallery: sanitizedGallery,
        sections,
        category: category || undefined,
        featured,
        pinned,
        sourceUrl: sourceUrl || undefined,
        referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
        attachmentItems: attachmentItems.length > 0 ? attachmentItems : undefined,
        readingTime: readingTime || undefined,
        authorDisplayName: authorDisplayName || undefined,
        authorRole: authorRole || undefined,
        associatedEventId: associatedEventId || undefined,
        associatedOrganizationId: associatedOrganizationId || undefined,
        spotlightLabel: spotlightLabel || undefined,
        seoDescription: seoDescription || undefined,
        canonicalSlug: canonicalSlug || undefined,
        relatedArticleIds: relatedArticleIds.length > 0 ? relatedArticleIds : undefined,
      };

      if (news) {
        await api.put(`/news/${news._id}`, payload);
      } else {
        await api.post('/news', payload);
      }

      appToast.success('News Saved', 'The news article has been saved successfully.');
      onSuccess();
      onOpenChange(false);
      form.reset();
      setCoverImage(undefined);
      setGallery([]);
      setSections([]);
      setCategory('');
      setFeatured(false);
      setPinned(false);
      setSourceUrl('');
      setReferenceLinks([]);
      setAttachmentItems([]);
      setReadingTime(undefined);
      setAuthorDisplayName('');
      setAuthorRole('');
      setAssociatedEventId('');
      setAssociatedOrganizationId('');
      setSpotlightLabel('');
      setSeoDescription('');
      setCanonicalSlug('');
      setRelatedArticleIds([]);
    } catch (error: unknown) {
      console.error('Failed to save news:', error);
      form.setError('root', { message: 'Failed to save news article' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[840px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{news ? 'Edit News Article' : 'Create News Article'}</DialogTitle>
          <DialogDescription>
            {news ? 'Update the article body, structure, and gallery.' : 'Add a new structured news article to the system.'}
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
                    <Input placeholder="News title" {...field} />
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
                  Organization pages only surface published organization-owned posts. Use system-owned only for college-wide content.
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
                  {!canCreateScopedNews && !canCreateSystemOwnedContent ? (
                    <p className="text-xs text-destructive">
                      You do not currently have permission to publish news for any organization.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {ownerType === ContentOwnerType.SYSTEM
                  ? 'This news article will appear as a system-wide CICT update.'
                  : `This news article will appear under ${selectedOrganizationName} once published.`}
              </p>
              <p className="mt-1 text-muted-foreground">
                Pick organization-owned content for posts that should show up on student organization tabs and organization homepages.
              </p>
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }: { field: TextareaFieldProps }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief summary..." {...field} />
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
                  <FormLabel>Article Body</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write the article content..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ContentSectionsEditor sections={sections} onChange={setSections} />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Comma separated tags" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Category</FormLabel>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="opinion">Opinion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                    <FormLabel htmlFor="featured">Featured</FormLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
                    <FormLabel htmlFor="pinned">Pinned</FormLabel>
                  </div>
                </div>
                <div className="space-y-2">
                  <FormLabel>Source URL</FormLabel>
                  <Input
                    placeholder="https://..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Reading Time (minutes)</FormLabel>
                  <Input
                    type="number"
                    placeholder="5"
                    value={readingTime ?? ''}
                    onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Spotlight Label</FormLabel>
                  <Input
                    placeholder="e.g. Breaking News"
                    value={spotlightLabel}
                    onChange={(e) => setSpotlightLabel(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Author Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Author Display Name</FormLabel>
                  <Input
                    placeholder="Override system author name"
                    value={authorDisplayName}
                    onChange={(e) => setAuthorDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Author Role / Title</FormLabel>
                  <Input
                    placeholder="e.g. Editor-in-Chief"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Associated Event ID</FormLabel>
                  <Input
                    placeholder="Event ID"
                    value={associatedEventId}
                    onChange={(e) => setAssociatedEventId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Associated Organization ID</FormLabel>
                  <Input
                    placeholder="Organization ID"
                    value={associatedOrganizationId}
                    onChange={(e) => setAssociatedOrganizationId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Related Article IDs</FormLabel>
                  <Input
                    placeholder="id1, id2, id3"
                    value={relatedArticleIds.join(', ')}
                    onChange={(e) =>
                      setRelatedArticleIds(
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated IDs</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>SEO Description</FormLabel>
                  <Textarea
                    placeholder="Meta description for search engines"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Canonical Slug</FormLabel>
                  <Input
                    placeholder="custom-slug"
                    value={canonicalSlug}
                    onChange={(e) => setCanonicalSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Reference Links</FormLabel>
                  <Textarea
                    placeholder="label1|url1, label2|url2"
                    value={referenceLinks.map((l) => `${l.label}|${l.url}`).join(', ')}
                    onChange={(e) =>
                      setReferenceLinks(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((entry) => {
                            const [label, url] = entry.split('|');
                            return { label: label?.trim() ?? '', url: url?.trim() ?? '' };
                          })
                          .filter((l) => l.label && l.url)
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated label|url pairs</p>
                </div>
                <div className="space-y-2">
                  <FormLabel>Attachments</FormLabel>
                  <Textarea
                    placeholder="label1|url1, label2|url2"
                    value={attachmentItems.map((a) => `${a.label}|${a.url}`).join(', ')}
                    onChange={(e) =>
                      setAttachmentItems(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((entry) => {
                            const [label, url] = entry.split('|');
                            return { label: label?.trim() ?? '', url: url?.trim() ?? '' };
                          })
                          .filter((a) => a.label && a.url)
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated label|url pairs</p>
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
              Gallery images appear below the article body as supporting media only. The system removes any gallery image that duplicates the cover image.
            </p>

            {news ? (
              <p className="text-sm text-muted-foreground">
                Current workflow status: <span className="font-medium capitalize">{news.status}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                New articles are created as drafts, submitted for approval, then published after approval.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {news ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
