'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentStatus } from '@cict/contracts';
import type { Program, Section, Student, YearLevel } from '@/types';
import type { StudentMutationPayload } from '@/lib/api/students';

interface StudentFormProps {
  form: StudentMutationPayload;
  editingStudent: Student | null;
  programs: Program[];
  yearLevels: YearLevel[];
  sections: Section[];
  filteredSections: Section[];
  formLoading: boolean;
  onFormChange: (updates: Partial<StudentMutationPayload>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function StudentForm({
  form,
  editingStudent,
  programs,
  yearLevels,
  filteredSections,
  formLoading,
  onFormChange,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const update = (field: keyof StudentMutationPayload, value: unknown) =>
    onFormChange({ [field]: value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingStudent ? 'Edit Student' : 'Create Student'}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <Label>Student Number</Label>
          <Input value={form.studentNumber} onChange={(e) => update('studentNumber', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>{editingStudent ? 'New Password (leave blank to keep)' : 'Password'}</Label>
          <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>First Name</Label>
          <Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Middle Name</Label>
          <Input value={form.middleName} onChange={(e) => update('middleName', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Program</Label>
          <Select value={form.programId} onValueChange={(v) => update('programId', v)}>
            <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.code} - {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Year Level</Label>
          <Select value={form.yearLevelId} onValueChange={(v) => update('yearLevelId', v)}>
            <SelectTrigger><SelectValue placeholder="Select year level" /></SelectTrigger>
            <SelectContent>
              {yearLevels.map((yl) => (
                <SelectItem key={yl._id} value={yl._id}>{yl.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Section</Label>
          <Select value={form.sectionId} onValueChange={(v) => update('sectionId', v)}>
            <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
            <SelectContent>
              {filteredSections.map((s) => (
                <SelectItem key={s._id} value={s._id}>{s.displayName || s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Profile Photo URL</Label>
          <Input value={form.profilePhoto} onChange={(e) => update('profilePhoto', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Birth Date</Label>
          <Input type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>About Me</Label>
          <Textarea value={form.aboutMe} onChange={(e) => update('aboutMe', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Enrollment Date</Label>
          <Input type="date" value={form.enrollmentDate} onChange={(e) => update('enrollmentDate', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Expected Graduation Year</Label>
          <Input type="number" value={form.expectedGraduationYear} onChange={(e) => update('expectedGraduationYear', parseInt(e.target.value) || 0)} />
        </div>

        <div className="space-y-2">
          <Label>Previous School</Label>
          <Input value={form.previousSchool} onChange={(e) => update('previousSchool', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Guardian Name</Label>
          <Input value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Guardian Contact</Label>
          <Input value={form.guardianContact} onChange={(e) => update('guardianContact', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Guardian Relationship</Label>
          <Input value={form.guardianRelationship} onChange={(e) => update('guardianRelationship', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Emergency Contact Name</Label>
          <Input value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Emergency Contact Phone</Label>
          <Input value={form.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Emergency Contact Relationship</Label>
          <Input value={form.emergencyContactRelationship} onChange={(e) => update('emergencyContactRelationship', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => update('status', v as StudentStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(StudentStatus).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 xl:col-span-3 flex gap-2 pt-4">
          <Button onClick={onSubmit} disabled={formLoading}>
            {formLoading ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
          </Button>
          {editingStudent && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
