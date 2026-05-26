'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentMembershipAPI } from '@/lib/api/student-membership';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Calendar, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { appToast } from '@/lib/app-toast';
import Link from 'next/link';
import { getMembershipStatusBadge } from '@/utils/badge-helpers';

export default function StudentMembershipsPage() {
  const queryClient = useQueryClient();

  const { data: memberships, isLoading, error } = useQuery({
    queryKey: ['student', 'memberships'],
    queryFn: studentMembershipAPI.getMyMemberships,
  });

  const resignMutation = useMutation({
    mutationFn: (membershipId: string) => studentMembershipAPI.resignFromOrg(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'memberships'] });
      appToast.success('Resigned', 'You have left the organization.');
    },
    onError: () => {
      appToast.error('Failed', 'Could not resign.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load memberships. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Memberships</h1>
        <p className="text-muted-foreground text-sm">Organizations you belong to</p>
      </div>

      {(!memberships || memberships.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>You are not a member of any organization yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => {
            const orgId = typeof membership.organizationId === 'string'
              ? membership.organizationId
              : (membership.organizationId as unknown as { _id?: string })._id || '';

            return (
              <Card key={membership._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">
                      <Link href={`/organizations/${orgId}`} className="hover:underline">
                        {orgId}
                      </Link>
                    </CardTitle>
                    {getMembershipStatusBadge(membership.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {membership.position && (
                      <Badge variant="outline">{membership.position}</Badge>
                    )}
                    <Badge variant="outline">{membership.memberType}</Badge>
                  </div>
                  {membership.startDate && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Started {format(new Date(membership.startDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                  {membership.academicYear && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      AY {membership.academicYear}
                    </div>
                  )}
                  {membership.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-600"
                      onClick={() => resignMutation.mutate(membership._id)}
                      disabled={resignMutation.isPending}
                    >
                      {resignMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Resign
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
