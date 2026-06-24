'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Search } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { appToast } from '@/lib/app-toast';
import { membershipAPI, OrganizationMembership } from '@/lib/api/organization-membership';
import {
  organizationsAdminAPI,
  type StudentSearchResult,
} from '@/features/organizations-admin/api';

interface MembershipFormProps {
  orgId: string;
  membership?: OrganizationMembership | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface MembershipFormValues {
  studentId: string;
  position: string;
  memberType: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: string;
  notes: string;
}

export default function MembershipForm({ orgId, membership, onClose, onSuccess }: MembershipFormProps) {
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MembershipFormValues>({
    defaultValues: {
      studentId: typeof membership?.studentId === 'string' ? membership.studentId : membership?.studentId?._id ?? '',
      position: membership?.position ?? '',
      memberType: membership?.memberType ?? 'general',
      startDate: membership?.startDate ? new Date(membership.startDate).toISOString().split('T')[0] : '',
      endDate: membership?.endDate ? new Date(membership.endDate).toISOString().split('T')[0] : '',
      academicYear: membership?.academicYear ?? '',
      semester: membership?.semester ?? '',
      notes: membership?.notes ?? '',
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStudentSearch = (value: string) => {
    setStudentSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setSearching(true);
        const students = await organizationsAdminAPI.searchStudents(value);
        setSearchResults(students);
        setShowDropdown(students.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const selectStudent = (student: StudentSearchResult) => {
    setValue('studentId', student._id);
    setStudentSearch(`${student.studentNumber} - ${student.firstName} ${student.lastName}`);
    setShowDropdown(false);
  };

  const onSubmit = async (data: MembershipFormValues) => {
    if (!data.studentId) {
      appToast.error('Student Required', 'Please select a student.');
      return;
    }

    try {
      setLoading(true);
      if (membership?._id) {
        await membershipAPI.update(orgId, membership._id, data);
      } else {
        await membershipAPI.create(orgId, data);
      }
      onSuccess();
      onClose();
    } catch {
      appToast.error('Save Failed', 'Could not save the membership.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {membership ? 'Edit Membership' : 'Add New Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Student</Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by student number or name..."
                  value={
                    membership && !studentSearch
                      ? (typeof membership.studentId === 'object'
                        ? `${membership.studentId.studentNumber} - ${membership.studentId.firstName} ${membership.studentId.lastName}`
                        : membership.studentId)
                      : studentSearch
                  }
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  disabled={!!membership}
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                  {searchResults.map((student) => (
                    <Button
                      key={student._id}
                      variant="ghost"
                      size="sm"
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-3"
                      onClick={() => selectStudent(student)}
                    >
                      <span className="font-medium">{student.studentNumber}</span>
                      <span>
                        {student.firstName} {student.lastName}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <input type="hidden" {...register('studentId', { required: true })} />
            {errors.studentId && <p className="text-red-500 text-sm">Student is required</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Input {...register('position')} placeholder="President, Member, etc." />
            </div>
            <div className="space-y-2">
              <Label>Member Type</Label>
              <Select
                defaultValue={membership?.memberType ?? 'general'}
                onValueChange={(v) => setValue('memberType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="honorary">Honorary</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Controller control={control} name="startDate" render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={(v) => field.onChange(v || '')} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Controller control={control} name="endDate" render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={(v) => field.onChange(v || '')} />
              )} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input {...register('academicYear')} placeholder="e.g. 2024-2025" />
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Input {...register('semester')} placeholder="e.g. 1st, 2nd, Summer" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register('notes')} placeholder="Additional notes..." className="h-24" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {membership ? 'Update Membership' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
