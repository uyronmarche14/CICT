'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Organization, OrganizationInput } from '@/types';
import { organizationService } from '@/services/organizationService';
import { appToast } from '@/lib/app-toast';

type OrganizationFormValues = Omit<OrganizationInput, 'values' | 'achievements' | 'tags' | 'joinSteps' | 'officeLocation'> & {
  valuesText: string;
  achievementsText: string;
  tagsText: string;
  joinStepsText: string;
  tagline?: string;
  officialEmail?: string;
  meetingSchedule?: string;
  membershipSize?: number;
  joinRequirements?: string;
  joinUrl?: string;
  benefits?: string;
  officeBuilding?: string;
  officeRoom?: string;
  officeCampus?: string;
  officeMapUrl?: string;
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

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<OrganizationFormValues>({
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
      tagline: organization?.tagline ?? '',
      officialEmail: organization?.officialEmail ?? '',
      meetingSchedule: organization?.meetingSchedule ?? '',
      membershipSize: organization?.membershipSize ?? undefined,
      joinRequirements: organization?.joinRequirements ?? '',
      joinStepsText: organization?.joinSteps?.join('\n') ?? '',
      joinUrl: organization?.joinUrl ?? '',
      benefits: organization?.benefits ?? '',
      officeBuilding: organization?.officeLocation?.building ?? '',
      officeRoom: organization?.officeLocation?.room ?? '',
      officeCampus: organization?.officeLocation?.campus ?? '',
      officeMapUrl: organization?.officeLocation?.mapUrl ?? '',
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
        tagline: data.tagline || undefined,
        officialEmail: data.officialEmail || undefined,
        meetingSchedule: data.meetingSchedule || undefined,
        membershipSize: data.membershipSize || undefined,
        joinRequirements: data.joinRequirements || undefined,
        joinSteps: data.joinStepsText ? data.joinStepsText.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
        joinUrl: data.joinUrl || undefined,
        benefits: data.benefits || undefined,
        officeLocation: {
          building: data.officeBuilding || undefined,
          room: data.officeRoom || undefined,
          campus: data.officeCampus || undefined,
          mapUrl: data.officeMapUrl || undefined,
        },
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
              <Label className="text-sm font-medium">Organization Slug</Label>
              <Input
                {...register('id', { required: 'Slug is required' })}
                placeholder="e.g. ict-sf"
                disabled={isEditing}
              />
              {errors.id && <p className="text-sm text-red-500">{errors.id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Short Name</Label>
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
              <Label className="text-sm font-medium">Logo</Label>
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
                    <Label htmlFor="logo-upload" className="cursor-pointer gap-2">
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Logo
                    </Label>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Banner</Label>
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
                    <Label htmlFor="banner-upload" className="cursor-pointer gap-2">
                      {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Banner
                    </Label>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Full Organization Name</Label>
            <Input
              {...register('fullName', { required: 'Full Name is required' })}
              placeholder="e.g. ICT Student Forum"
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Established</Label>
            <Input
              {...register('established', { required: 'Established field is required' })}
              placeholder="e.g. 2010"
            />
            {errors.established && <p className="text-sm text-red-500">{errors.established.message}</p>}
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mission</Label>
            <Textarea
              {...register('mission', { required: 'Mission is required' })}
              placeholder="Organization Mission"
              rows={3}
            />
            {errors.mission && <p className="text-sm text-red-500">{errors.mission.message}</p>}
          </div>

          {/* Vision */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Vision</Label>
            <Textarea
              {...register('vision', { required: 'Vision is required' })}
              placeholder="Organization Vision"
              rows={3}
            />
            {errors.vision && <p className="text-sm text-red-500">{errors.vision.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Brief description of the organization"
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Long Description</Label>
            <Textarea
              {...register('longDescription', { required: 'Long description is required' })}
              placeholder="Full overview of the organization"
              rows={5}
            />
            {errors.longDescription && <p className="text-sm text-red-500">{errors.longDescription.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Values</Label>
              <Input
                {...register('valuesText')}
                placeholder="Leadership, Service, Excellence"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Achievements</Label>
              <Input
                {...register('achievementsText')}
                placeholder="Best Student Council 2023, Outreach Award"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primary Color</Label>
              <Input {...register('color.primary')} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Secondary Color</Label>
              <Input {...register('color.secondary')} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Accent Color</Label>
              <Input {...register('color.accent')} />
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input {...register('email')} type="email" placeholder="org@example.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone</Label>
                <Input {...register('phone')} placeholder="+63..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Website</Label>
                <Input {...register('website')} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Social Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Social Media</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Facebook URL</Label>
                <Input {...register('facebookUrl')} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Twitter URL</Label>
                <Input {...register('twitterUrl')} placeholder="https://twitter.com/..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Instagram URL</Label>
                <Input {...register('instagramUrl')} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">TikTok URL</Label>
                <Input {...register('tiktokUrl')} placeholder="https://tiktok.com/..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">LinkedIn URL</Label>
                <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/..." />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Building</Label>
                <Input {...register('building')} placeholder="e.g. Arts Building" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Room</Label>
                <Input {...register('room')} placeholder="e.g. Rm 201" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Campus</Label>
                <Input {...register('campus')} placeholder="e.g. Main Campus" />
              </div>
            </div>
          </div>

          {/* Advisor Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Advisor & Moderator</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Advisor Name</Label>
                <Input {...register('advisorName')} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Advisor Email</Label>
                <Input {...register('advisorEmail')} type="email" placeholder="advisor@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Moderator Name</Label>
                <Input {...register('moderatorName')} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Moderator Email</Label>
                <Input {...register('moderatorEmail')} type="email" placeholder="moderator@example.com" />
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Organization Type</Label>
                <Controller
                  control={control}
                  name="organizationType"
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select Type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="special_interest">Special Interest</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags (comma-separated)</Label>
                <Input {...register('tagsText')} placeholder="Leadership, Tech, Innovation" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">SEO Description</Label>
              <Textarea
                {...register('seoDescription')}
                placeholder="Brief description for search engines"
                rows={2}
              />
            </div>
          </div>

          {/* Tagline & Official Email */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tagline</Label>
                <Input {...register('tagline')} placeholder="Short tagline" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Official Email</Label>
                <Input {...register('officialEmail')} type="email" placeholder="org@example.com" />
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Membership</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Membership Size</Label>
                <Input {...register('membershipSize')} type="number" min={0} placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meeting Schedule</Label>
                <Input {...register('meetingSchedule')} placeholder="e.g. Every Friday, 3PM" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Join Requirements</Label>
              <Textarea {...register('joinRequirements')} placeholder="What's required to join?" rows={2} />
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Join Steps (one per line)</Label>
              <Textarea
                {...register('joinStepsText')}
                placeholder={"1. Submit application\n2. Attend orientation\n3. Pay membership fee"}
                rows={3}
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Join URL</Label>
              <Input {...register('joinUrl')} placeholder="https://..." />
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Benefits</Label>
              <Textarea {...register('benefits')} placeholder="What members get..." rows={2} />
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Building</Label>
                <Input {...register('officeBuilding')} placeholder="e.g. Engineering Bldg" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Room</Label>
                <Input {...register('officeRoom')} placeholder="e.g. Room 203" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Campus</Label>
                <Input {...register('officeCampus')} placeholder="e.g. Main Campus" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Map URL</Label>
              <Input {...register('officeMapUrl')} placeholder="https://maps.google.com/..." />
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
