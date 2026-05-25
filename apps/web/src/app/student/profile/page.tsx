'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Calendar, GraduationCap, Building2, ArrowLeft } from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { studentMembershipAPI } from '@/lib/api/student-membership';
import Link from 'next/link';
import { format } from 'date-fns';

export default function StudentProfilePage() {
  const { student } = useStudentAuth();

  const { data: memberships, isLoading } = useQuery({
    queryKey: ['student', 'memberships'],
    queryFn: studentMembershipAPI.getMyMemberships,
  });

  if (!student) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const programName = typeof student.programId === 'object' && student.programId
    ? student.programId.name || student.programId.code || ''
    : '';
  const yearLevelLabel = typeof student.yearLevelId === 'object' && student.yearLevelId
    ? student.yearLevelId.label || ''
    : '';

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/student/events">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {student.firstName} {student.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{student.studentNumber}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
          )}
          {(programName || yearLevelLabel) && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span>{[programName, yearLevelLabel].filter(Boolean).join(' · ')}</span>
            </div>
          )}
          {student.phone && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Phone:</span>
              <span>{student.phone}</span>
            </div>
          )}
          {student.address && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Address:</span>
              <span>{student.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              My Memberships
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/student/organizations">Browse Orgs</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !memberships || memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              You haven&apos;t joined any organizations yet.
            </p>
          ) : (
            <div className="space-y-3">
              {memberships.map((m: any) => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{m.organizationId}</p>
                    <p className="text-xs text-muted-foreground">{m.position}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                      {m.status}
                    </Badge>
                    <Badge variant="outline">{m.memberType}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
