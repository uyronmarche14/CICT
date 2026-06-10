'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Link2,
  Clock,
  Globe,
  Users,
  Info,
  Phone,
  User,
  Mail,
  MapPin,
  Video,
  Paperclip,
  File,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { ApprovalTimeline } from '@/components/admin/ApprovalTimeline';
import { getEventStatusBadge, getRegistrationBadge } from '@/utils/badge-helpers';
import type { ApprovalActionItem } from '@/types';
import type { Event } from '@/lib/api/event';

interface EventInfoPanelProps {
  event: Event;
  approvalActions?: ApprovalActionItem[];
  approvalHistoryLoading?: boolean;
  canApprove: boolean;
  canReject: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function EventInfoPanel({
  event,
  approvalActions,
  approvalHistoryLoading,
  canApprove,
  canReject,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: EventInfoPanelProps) {
  return (
    <>
      {event.approvalSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Approval Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {getEventStatusBadge(event.status)}
            </div>

            <ApprovalTimeline
              actions={approvalActions}
              loading={approvalHistoryLoading}
            />

            {event.status === 'pending_approval' && (canApprove || canReject) && (
              <div className="flex gap-2 pt-2 border-t">
                {canApprove && (
                  <Button
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    variant="outline"
                    onClick={onApprove}
                    disabled={isApproving}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {isApproving ? 'Approving...' : 'Approve'}
                  </Button>
                )}
                {canReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={onReject}
                    disabled={isRejecting}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Registration Details */}
      {(event.registrationUrl || event.registrationDeadline || event.audience || event.eligibility || event.feeLabel || event.certificateInfo || event.registrationCloseAt) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Open: </span>
                {getRegistrationBadge(event.isRegistrationOpen)}
              </div>
              <div>
                <span className="text-muted-foreground">Walk-ins: </span>
                <Badge variant="outline">{event.allowWalkIns ? 'Allowed' : 'Not Allowed'}</Badge>
              </div>
            </div>
            {event.registrationUrl && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {event.registrationUrl}
                </a>
              </div>
            )}
            {event.registrationDeadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm">Deadline: <span className="font-medium">{format(new Date(event.registrationDeadline), 'MMM dd, yyyy h:mm a')}</span></span>
              </div>
            )}
            {event.registrationCloseAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm">Auto-close: <span className="font-medium">{format(new Date(event.registrationCloseAt), 'MMM dd, yyyy h:mm a')}</span></span>
              </div>
            )}
            {event.audience && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Audience: </span>
                  <span className="font-medium">{event.audience}</span>
                </div>
              </div>
            )}
            {event.eligibility && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Eligibility: </span>
                  <span className="font-medium">{event.eligibility}</span>
                </div>
              </div>
            )}
            {event.feeLabel && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-[100px]">Fee:</span>
                <Badge variant="secondary">{event.feeLabel}</Badge>
              </div>
            )}
            {event.certificateInfo && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Certificate: </span>
                  <span className="font-medium">{event.certificateInfo}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {(event.contactName || event.contactEmail || event.contactPhone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.contactName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{event.contactName}</span>
              </div>
            )}
            {event.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${event.contactEmail}`} className="text-sm text-primary hover:underline">{event.contactEmail}</a>
              </div>
            )}
            {event.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`tel:${event.contactPhone}`} className="text-sm text-primary hover:underline">{event.contactPhone}</a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Venue */}
      {(event.venueDetails?.name || event.venueDetails?.address || event.venueDetails?.room || event.venueDetails?.capacity || event.venueDetails?.accessibility || event.mapUrl || event.meetingUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.venueDetails?.name && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-[90px]">Name:</span>
                <span className="text-sm font-medium">{event.venueDetails.name}</span>
              </div>
            )}
            {event.venueDetails?.address && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-[90px]">Address:</span>
                <span className="text-sm">{event.venueDetails.address}</span>
              </div>
            )}
            {event.venueDetails?.room && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-[90px]">Room:</span>
                <span className="text-sm font-medium">{event.venueDetails.room}</span>
              </div>
            )}
            {event.venueDetails?.capacity && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-[90px]">Capacity:</span>
                <span className="text-sm font-medium">{event.venueDetails.capacity}</span>
              </div>
            )}
            {event.venueDetails?.accessibility && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground min-w-[90px]">Accessibility:</span>
                <span className="text-sm">{event.venueDetails.accessibility}</span>
              </div>
            )}
            {event.mapUrl && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Map</a>
              </div>
            )}
            {event.meetingUrl && (
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Join Meeting</a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Speakers */}
      {event.speakerItems && event.speakerItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Speakers ({event.speakerItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {event.speakerItems.map((speaker, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {speaker.photo ? (
                      <Image src={speaker.photo.imageUrl} alt={speaker.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{speaker.name}</p>
                    {speaker.title && <p className="text-xs text-muted-foreground truncate">{speaker.title}</p>}
                    {speaker.organization && <p className="text-xs text-muted-foreground truncate">{speaker.organization}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {(event.requirements || event.posterCaption || (event.hostOrganizationIds && event.hostOrganizationIds.length > 0) || (event.coHostOrganizationIds && event.coHostOrganizationIds.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.requirements && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Requirements</p>
                <p className="text-sm whitespace-pre-wrap bg-secondary/20 rounded-lg p-3">{event.requirements}</p>
              </div>
            )}
            {event.posterCaption && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Poster Caption</p>
                <p className="text-sm">{event.posterCaption}</p>
              </div>
            )}
            {event.hostOrganizationIds && event.hostOrganizationIds.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">Host Organizations</p>
                <div className="flex flex-wrap gap-1.5">
                  {event.hostOrganizationIds.map((id) => (
                    <Badge key={id} variant="secondary">{id}</Badge>
                  ))}
                </div>
              </div>
            )}
            {event.coHostOrganizationIds && event.coHostOrganizationIds.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">Co-Host Organizations</p>
                <div className="flex flex-wrap gap-1.5">
                  {event.coHostOrganizationIds.map((id) => (
                    <Badge key={id} variant="outline">{id}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {event.attachmentItems && event.attachmentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({event.attachmentItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.attachmentItems.map((attachment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                  <File className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.label}</p>
                    {attachment.fileSize && (
                      <p className="text-xs text-muted-foreground">
                        {(attachment.fileSize / 1024).toFixed(1)} KB{attachment.fileType ? ` · ${attachment.fileType}` : ''}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild className="shrink-0">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
