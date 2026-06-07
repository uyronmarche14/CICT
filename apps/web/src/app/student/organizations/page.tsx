'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, MapPin } from 'lucide-react';
import api from '@/lib/api/axios';
import { studentMembershipAPI } from '@/lib/api/student';
import { appToast } from '@/lib/app-toast';
import { Organization } from '@/types';

export default function StudentOrganizationsPage() {
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/organizations');
      return res.data.data as Organization[];
    },
  });

  const { data: memberships } = useQuery({
    queryKey: ['student', 'memberships'],
    queryFn: studentMembershipAPI.getMyMemberships,
  });

  const applyMutation = useMutation({
    mutationFn: (orgId: string) => studentMembershipAPI.applyToOrg(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'memberships'] });
      appToast.success('Applied!', 'Your application has been submitted.');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Failed', error?.response?.data?.message || 'Could not apply.');
    },
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

  const membershipByOrgId = new Map(
    (memberships || []).map(m => [m.organizationId, m])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-muted-foreground text-sm">Browse and join student organizations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(organizations || []).map(org => {
            const membership = membershipByOrgId.get(org.id);
            return (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{org.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{org.name}</p>
                    </div>
                    {membership && (
                      <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                        {membership.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{org.description}</p>
                  {org.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Mail className="w-3 h-3" />{org.email}
                    </div>
                  )}
                  {org.building && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <MapPin className="w-3 h-3" />{org.building}{org.room ? ` Room ${org.room}` : ''}
                    </div>
                  )}
                  {membership ? (
                    membership.status === 'active' ? (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => resignMutation.mutate(membership._id)} disabled={resignMutation.isPending}>
                        Leave Organization
                      </Button>
                    ) : membership.status === 'applied' ? (
                      <Badge variant="outline" className="w-full justify-center">Application Pending</Badge>
                    ) : null
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => applyMutation.mutate(org.id)} disabled={applyMutation.isPending}>
                      {applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Apply to Join
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
