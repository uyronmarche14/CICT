'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vote, Plus, Loader2, Trash2, Calendar, Users, BarChart3, Pencil } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgVotesAPI } from '@/lib/api/org-votes';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoteForm } from '@/components/admin/VoteForm';
import { format } from 'date-fns';

export default function OrgVotingPage() {
  const params = useParams();
  const orgId = params.id as string;
  const { canManageOrgVotes } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgVotes(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const queryClient = useQueryClient();
  const [resultsVoteId, setResultsVoteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVote, setEditingVote] = useState<{ _id: string; title: string; description?: string; startDate: string; endDate: string; isAnonymous: boolean; positions?: Array<{ title: string; maxSelections: number }>; candidates?: Array<{ name: string; position: string }> } | null>(null);

  const { data: votes = [], isLoading } = useQuery({
    queryKey: queryKeys.orgVotes.all(orgId),
    queryFn: () => orgVotesAPI.list(orgId),
    enabled: !!orgId,
  });

  const { data: results } = useQuery({
    queryKey: queryKeys.orgVotes.results(orgId, resultsVoteId!),
    queryFn: () => orgVotesAPI.getResults(orgId, resultsVoteId!),
    enabled: !!resultsVoteId,
  });

  const deleteMutation = useMutation({
    mutationFn: (voteId: string) => orgVotesAPI.delete(orgId, voteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orgVotes.all(orgId) }),
  });

  if (!shouldRender) return null;

  const now = new Date();

  return (
    <OrgPageLayout
      title="Voting & Elections"
      icon={Vote}
      description="Manage organization elections, position voting, and ballot results."
      loading={orgLoading}
      action={
        <Button size="sm" onClick={() => { setEditingVote(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />New Election
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : votes.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground">No elections created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {votes.map((vote) => {
            const isActive = new Date(vote.startDate) <= now && new Date(vote.endDate) >= now;
            const isUpcoming = new Date(vote.startDate) > now;
            const isEnded = new Date(vote.endDate) < now;

            return (
              <Card key={vote._id}>
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">{vote.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingVote(vote); setShowForm(true); }}>
                        <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMutation.mutate(vote._id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 px-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isActive && <Badge className="text-[10px] px-1.5 bg-green-100 text-green-700">Active</Badge>}
                    {isUpcoming && <Badge variant="outline" className="text-[10px] px-1.5">Upcoming</Badge>}
                    {isEnded && <Badge variant="secondary" className="text-[10px] px-1.5">Ended</Badge>}
                    {vote.isAnonymous && <Badge variant="outline" className="text-[10px] px-1.5">Anonymous</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(vote.startDate), 'MMM d')} – {format(new Date(vote.endDate), 'MMM d')}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{vote.positions.length} positions</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{vote.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setResultsVoteId(vote._id)}>
                      <BarChart3 className="mr-1 h-3 w-3" />Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {results && (
        <div className="mt-8 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Results: {results.vote.title}</h3>
              <p className="text-sm text-muted-foreground">Total ballots cast: {results.totalBallots}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setResultsVoteId(null)}>Close</Button>
          </div>
          {Object.entries(results.results).map(([position, candidates]) => (
            <div key={position} className="mb-6">
              <h4 className="text-sm font-medium mb-2 capitalize">{position}</h4>
              <div className="space-y-2">
                {Object.entries(candidates).map(([name, count]) => {
                  const total = Object.values(candidates).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-sm w-32 truncate">{name}</span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <VoteForm
        orgId={orgId}
        open={showForm}
        onOpenChange={setShowForm}
        item={editingVote}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.orgVotes.all(orgId) })}
      />
    </OrgPageLayout>
  );
}
