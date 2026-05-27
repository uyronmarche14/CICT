'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { OrganizationMember } from '@/types';
import { organizationService } from '@/services/organizationService';
import { X, Upload, Loader2 } from 'lucide-react';
import { appToast } from '@/lib/app-toast';

interface AdminMemberFormProps {
  orgId: string;
  member?: OrganizationMember | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminMemberForm({ orgId, member, onClose, onSuccess }: AdminMemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<OrganizationMember>({
    defaultValues: member || {
      id: '',
      name: '',
      position: '',
      bio: '',
      photo: '',
      social: {
        linkedin: '',
        github: '',
        email: ''
      },
      phone: '',
      personalEmail: '',
      program: '',
      yearLevel: '',
      startDate: '',
      endDate: '',
      memberType: 'general',
      status: 'active',
      sortOrder: 0,
      batch: '',
    }
  });

  const photoUrl = watch('photo');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { imageUrl } = await organizationService.uploadImage(file);
      setValue('photo', imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      appToast.error('Upload Failed', 'Could not upload the image.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: OrganizationMember) => {
    try {
      setLoading(true);
      if (member && member.id) {
        await organizationService.updateMember(orgId, member.id, data);
      } else {
        await organizationService.addMember(orgId, data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save member:', error);
      appToast.error('Save Failed', 'Could not save the member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-card rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <Button 
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>

        <h2 className="text-2xl font-bold mb-6">
          {member ? 'Edit Member' : 'Add New Member'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              {photoUrl && (
                <Image
                  src={photoUrl}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-2 border-primary"
                />
              )}
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload Photo
                </Button>
              </div>
            </div>
            <Input type="hidden" {...register('photo', { required: 'Photo is required' })} />
            {errors.photo && <p className="text-red-500 text-sm">{errors.photo.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register('name', { required: 'Name is required' })} placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input {...register('position', { required: 'Position is required' })} placeholder="President" />
              {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea 
              {...register('bio', { required: 'Bio is required' })} 
              placeholder="Short biography..." 
              className="h-24"
            />
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Social Links</Label>
            <div className="grid grid-cols-1 gap-3">
              <Input {...register('social.email')} placeholder="Email Address" />
              <Input {...register('social.linkedin')} placeholder="LinkedIn URL" />
              <Input {...register('social.github')} placeholder="GitHub URL" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Contact</Label>
            <Input {...register('phone')} placeholder="Phone number" />
            <Input {...register('personalEmail')} placeholder="Personal email" type="email" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Program / Course</Label>
              <Input {...register('program')} placeholder="e.g. BSIT" />
            </div>
            <div className="space-y-2">
              <Label>Year Level</Label>
              <Input {...register('yearLevel')} placeholder="e.g. 3rd Year" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Member Type</Label>
              <Controller
                control={control}
                name="memberType"
                render={({ field }) => (
                  <Select value={field.value || 'general'} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Member</SelectItem>
                      <SelectItem value="officer">Officer</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="honorary">Honorary Member</SelectItem>
                      <SelectItem value="advisor">Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value || 'active'} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position Start Date</Label>
              <Controller control={control} name="startDate" render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={(v) => field.onChange(v || '')} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Position End Date</Label>
              <Controller control={control} name="endDate" render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={(v) => field.onChange(v || '')} />
              )} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input {...register('sortOrder')} type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Batch / Academic Year</Label>
              <Input {...register('batch')} placeholder="e.g. 2025" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Joined Year</Label>
            <Input {...register('joinedDate')} placeholder="e.g. 2024" />
          </div>

          {/* Leadership Details */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold">Leadership Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term Start</Label>
                <Controller control={control} name="termStart" render={({ field }) => (
                  <DatePicker value={field.value || ''} onChange={(v) => field.onChange(v || '')} />
                )} />
              </div>
              <div className="space-y-2">
                <Label>Term End</Label>
                <Controller control={control} name="termEnd" render={({ field }) => (
                  <DatePicker value={field.value || ''} onChange={(v) => field.onChange(v || '')} />
                )} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leadership Status</Label>
                <Controller
                  control={control}
                  name="leadershipStatus"
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="emeritus">Emeritus</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Input {...register('isAdviser')} type="checkbox" className="h-4 w-4" />
                  Is Adviser
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input {...register('department')} placeholder="e.g. Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Committee</Label>
                <Input {...register('committee')} placeholder="e.g. Finance Committee" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input {...register('contactNumber')} placeholder="+63 912 345 6789" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input {...register('displayOrder')} type="number" placeholder="0" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {member ? 'Update Member' : 'Add Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
