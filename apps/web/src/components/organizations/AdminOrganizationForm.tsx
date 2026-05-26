'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Organization, OrganizationInput } from '@/types';
import { organizationService } from '@/services/organizationService';
import { appToast } from '@/lib/app-toast';

type OrganizationFormValues = Omit<OrganizationInput, 'values' | 'achievements' | 'tags'> & {
  valuesText: string;
  achievementsText: string;
  tagsText: string;
};

interface AdminOrganizationFormProps {
  organization?: Organization | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminOrganizationForm({ organization, onClose, onSuccess }: AdminOrganizationFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const isEditing = Boolean(organization);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OrganizationFormValues>({
    defaultValues: {
      id: organization?.id ?? '',
      name: organization?.name ?? '',
      fullName: organization?.fullName ?? '',
      description: organization?.description ?? '',
      longDescription: organization?.longDescription ?? '',
      mission: organization?.mission ?? '',
      vision: organization?.vision ?? '',
      established: organization?.established ?? '',
      valuesText: organization?.values?.join(', ') ?? '',
      achievementsText: organization?.achievements?.join(', ') ?? '',
      logo: organization?.logo ?? '',
      banner: organization?.banner ?? '',
      color: {
        primary: organization?.color.primary ?? '#1d4ed8',
        secondary: organization?.color.secondary ?? '#93c5fd',
        accent: organization?.color.accent ?? '#f59e0b',
      },
      email: organization?.email ?? '',
      phone: organization?.phone ?? '',
      website: organization?.website ?? '',
      facebookUrl: organization?.facebookUrl ?? '',
      twitterUrl: organization?.twitterUrl ?? '',
      instagramUrl: organization?.instagramUrl ?? '',
      tiktokUrl: organization?.tiktokUrl ?? '',
      linkedinUrl: organization?.linkedinUrl ?? '',
      building: organization?.building ?? '',
      room: organization?.room ?? '',
      campus: organization?.campus ?? '',
      advisorName: organization?.advisorName ?? '',
      advisorEmail: organization?.advisorEmail ?? '',
      moderatorName: organization?.moderatorName ?? '',
      moderatorEmail: organization?.moderatorEmail ?? '',
      organizationType: organization?.organizationType ?? '',
      tagsText: organization?.tags?.join(', ') ?? '',
      seoDescription: organization?.seoDescription ?? '',
      isActive: organization?.isActive ?? true,
    }
  });

  const logoUrl = watch('logo');
  const bannerUrl = watch('banner');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (field === 'logo') setUploadingLogo(true);
      else setUploadingBanner(true);

      const { imageUrl } = await organizationService.uploadImage(file);
      setValue(field, imageUrl);
    } catch (error) {
      console.error(`Failed to upload ${field}:`, error);
      appToast.error('Upload Failed', `Could not upload ${field}.`);
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      setLoading(true);
      const payload: OrganizationInput = {
        id: data.id.trim().toLowerCase(),
        name: data.name,
        fullName: data.fullName,
        description: data.description,
        longDescription: data.longDescription,
        logo: data.logo,
        banner: data.banner,
        established: data.established,
        mission: data.mission,
        vision: data.vision,
        color: data.color,
        values: data.valuesText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        achievements: data.achievementsText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        facebookUrl: data.facebookUrl || undefined,
        twitterUrl: data.twitterUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        tiktokUrl: data.tiktokUrl || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        building: data.building || undefined,
        room: data.room || undefined,
        campus: data.campus || undefined,
        advisorName: data.advisorName || undefined,
        advisorEmail: data.advisorEmail || undefined,
        moderatorName: data.moderatorName || undefined,
        moderatorEmail: data.moderatorEmail || undefined,
        organizationType: data.organizationType || undefined,
        tags: data.tagsText
          ? data.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        seoDescription: data.seoDescription || undefined,
        isActive: data.isActive,
      };

      if (isEditing && organization) {
        await organizationService.update(organization.id, payload);
      } else {
        await organizationService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save organization:', error);
      appToast.error('Save Failed', 'Could not save the organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Organization Details' : 'Create Organization'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Slug</label>
              <Input
                {...register('id', { required: 'Slug is required' })}
                placeholder="e.g. ict-sf"
                disabled={isEditing}
              />
              {errors.id && <p className="text-sm text-red-500">{errors.id.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Short Name</label>
              <Input
                {...register('name', { required: 'Short name is required' })}
                placeholder="e.g. ICT-SF"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          {/* Logo & Banner Uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <Image src={logoUrl} alt="Logo" width={64} height={64} className="object-contain border rounded" />
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    disabled={uploadingLogo}
                  />
                  <Button asChild variant="outline" size="sm" disabled={uploadingLogo}>
                    <label htmlFor="logo-upload" className="cursor-pointer gap-2">
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Logo
                    </label>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Banner</label>
              <div className="flex flex-col gap-2">
                {bannerUrl && (
                  <Image
                    src={bannerUrl}
                    alt="Banner"
                    width={600}
                    height={96}
                    className="w-full object-cover border rounded"
                  />
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="banner-upload"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    disabled={uploadingBanner}
                  />
                  <Button asChild variant="outline" size="sm" disabled={uploadingBanner}>
                    <label htmlFor="banner-upload" className="cursor-pointer gap-2">
                      {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Banner
                    </label>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Organization Name</label>
            <Input
              {...register('fullName', { required: 'Full Name is required' })}
              placeholder="e.g. ICT Student Forum"
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Established</label>
            <Input
              {...register('established', { required: 'Established field is required' })}
              placeholder="e.g. 2010"
            />
            {errors.established && <p className="text-sm text-red-500">{errors.established.message}</p>}
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mission</label>
            <Textarea
              {...register('mission', { required: 'Mission is required' })}
              placeholder="Organization Mission"
              rows={3}
            />
            {errors.mission && <p className="text-sm text-red-500">{errors.mission.message}</p>}
          </div>

          {/* Vision */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vision</label>
            <Textarea
              {...register('vision', { required: 'Vision is required' })}
              placeholder="Organization Vision"
              rows={3}
            />
            {errors.vision && <p className="text-sm text-red-500">{errors.vision.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Brief description of the organization"
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Long Description</label>
            <Textarea
              {...register('longDescription', { required: 'Long description is required' })}
              placeholder="Full overview of the organization"
              rows={5}
            />
            {errors.longDescription && <p className="text-sm text-red-500">{errors.longDescription.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Values</label>
              <Input
                {...register('valuesText')}
                placeholder="Leadership, Service, Excellence"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Achievements</label>
              <Input
                {...register('achievementsText')}
                placeholder="Best Student Council 2023, Outreach Award"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Color</label>
              <Input {...register('color.primary')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Color</label>
              <Input {...register('color.secondary')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Accent Color</label>
              <Input {...register('color.accent')} />
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input {...register('email')} type="email" placeholder="org@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input {...register('phone')} placeholder="+63..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input {...register('website')} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Social Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Social Media</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Facebook URL</label>
                <Input {...register('facebookUrl')} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Twitter URL</label>
                <Input {...register('twitterUrl')} placeholder="https://twitter.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instagram URL</label>
                <Input {...register('instagramUrl')} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">TikTok URL</label>
                <Input {...register('tiktokUrl')} placeholder="https://tiktok.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/..." />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Building</label>
                <Input {...register('building')} placeholder="e.g. Arts Building" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <Input {...register('room')} placeholder="e.g. Rm 201" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Campus</label>
                <Input {...register('campus')} placeholder="e.g. Main Campus" />
              </div>
            </div>
          </div>

          {/* Advisor Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Advisor & Moderator</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Advisor Name</label>
                <Input {...register('advisorName')} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Advisor Email</label>
                <Input {...register('advisorEmail')} type="email" placeholder="advisor@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Moderator Name</label>
                <Input {...register('moderatorName')} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Moderator Email</label>
                <Input {...register('moderatorEmail')} type="email" placeholder="moderator@example.com" />
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Type</label>
                <select
                  {...register('organizationType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Type...</option>
                  <option value="academic">Academic</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="special_interest">Special Interest</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input {...register('tagsText')} placeholder="Leadership, Tech, Innovation" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">SEO Description</label>
              <Textarea
                {...register('seoDescription')}
                placeholder="Brief description for search engines"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingLogo || uploadingBanner} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
