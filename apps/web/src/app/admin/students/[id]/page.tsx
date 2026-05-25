'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { studentsAPI } from '@/lib/api/students';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const getProgramLabel = (program: string | { _id: string; code: string; name: string }) =>
  typeof program === 'string' ? program : `${program.code} - ${program.name}`;

const getYearLevelLabel = (yearLevel: string | { _id: string; code: string; label: string; numericLevel: number }) =>
  typeof yearLevel === 'string' ? yearLevel : yearLevel.label;

const getSectionLabel = (section: string | { _id: string; name: string; displayName: string }) =>
  typeof section === 'string' ? section : section.displayName;

const statusColors: Record<string, string> = {
  active: 'bg-green-600',
  pending: 'bg-amber-500',
  inactive: 'bg-secondary',
  suspended: 'bg-red-600',
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { canAccessStudentsModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessStudentsModule());

  const { data: student, isLoading } = useQuery({
    queryKey: ['admin', 'students', studentId],
    queryFn: () => studentsAPI.getById(studentId),
    enabled: !!studentId,
  });

  if (!shouldRender) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Student not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {student.profilePhoto ? (
            <img
              src={student.profilePhoto}
              alt={`${student.firstName} ${student.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
          </h1>
          <p className="text-muted-foreground">{student.studentNumber}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Email</span>
            <p className="text-sm">{student.email || '\u2014'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Phone</span>
            <p className="text-sm">{student.phone || '\u2014'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Address</span>
            <p className="text-sm">{student.address || '\u2014'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Birth Date</span>
            <p className="text-sm">
              {student.birthDate ? format(new Date(student.birthDate), 'MMM dd, yyyy') : '\u2014'}
            </p>
          </div>
          {student.aboutMe ? (
            <div className="md:col-span-2">
              <span className="text-sm text-muted-foreground">About Me</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{student.aboutMe}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Academic</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Program</span>
            <p className="text-sm">{getProgramLabel(student.programId)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Year Level</span>
            <p className="text-sm">{getYearLevelLabel(student.yearLevelId)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Section</span>
            <p className="text-sm">{getSectionLabel(student.sectionId)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Enrollment Date</span>
            <p className="text-sm">
              {student.enrollmentDate ? format(new Date(student.enrollmentDate), 'MMM dd, yyyy') : '\u2014'}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Expected Graduation Year</span>
            <p className="text-sm">{student.expectedGraduationYear || '\u2014'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Previous School</span>
            <p className="text-sm">{student.previousSchool || '\u2014'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Guardian</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Guardian Name</span>
            <p className="text-sm">{student.guardianName || '\u2014'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Guardian Contact</span>
            <p className="text-sm">{student.guardianContact || '\u2014'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Guardian Relationship</span>
            <p className="text-sm">{student.guardianRelationship || '\u2014'}</p>
          </div>
        </CardContent>
      </Card>

      {(student.emergencyContactName || student.emergencyContactPhone || student.emergencyContactRelationship) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="text-sm">{student.emergencyContactName || '\u2014'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p className="text-sm">{student.emergencyContactPhone || '\u2014'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Relationship</span>
              <p className="text-sm">{student.emergencyContactRelationship || '\u2014'}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="mt-1">
              <Badge className={statusColors[student.status] ?? 'bg-secondary'}>
                {student.status}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Active</span>
            <p className="text-sm">{student.isActive ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Last Login</span>
            <p className="text-sm">
              {student.lastLoginAt ? format(new Date(student.lastLoginAt), 'MMM dd, yyyy h:mm a') : 'Never'}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">QR Version</span>
            <p className="text-sm">{student.qrVersion}</p>
          </div>
        </CardContent>
      </Card>

      {student.createdAt ? (
        <p className="text-xs text-muted-foreground text-right">
          Created {format(new Date(student.createdAt), 'MMM dd, yyyy h:mm a')}
          {student.updatedAt && student.updatedAt !== student.createdAt
            ? ` \u2022 Updated ${format(new Date(student.updatedAt), 'MMM dd, yyyy h:mm a')}`
            : ''}
        </p>
      ) : null}
    </div>
  );
}
