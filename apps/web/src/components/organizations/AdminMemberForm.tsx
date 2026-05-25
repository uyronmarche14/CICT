'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OrganizationMember>({
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
      <div className="relative w-full max-w-2xl bg-card rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

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
              <select {...register('memberType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="general">General Member</option>
                <option value="officer">Officer</option>
                <option value="alumni">Alumni</option>
                <option value="honorary">Honorary Member</option>
                <option value="advisor">Advisor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position Start Date</Label>
              <Input {...register('startDate')} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Position End Date</Label>
              <Input {...register('endDate')} type="date" />
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
