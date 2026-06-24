'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/event';
import { studentEventAPI } from '@/lib/api/student';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Loader2, ArrowLeft, Info, ExternalLink, QrCode, XCircle, CheckCircle, User, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import MeshGradientBg from '@/components/ripplebg';
import Image from 'next/image';
import { StructuredContent } from '@/components/StructuredContent';
import ScrollingGallery from '@/components/ScrollingGallery';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { appToast } from '@/lib/app-toast';
import { getRegistrationBadge } from '@/utils/badge-helpers';

export function EventDetailsPageClient({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated: isStudent, loading: studentLoading } = useStudentAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventAPI.getById(id),
    enabled: !!id,
    staleTime: 0,
  });

  const { data: registration } = useQuery({
    queryKey: ['student', 'registration', id],
    queryFn: () => studentEventAPI.getRegistration(id),
    enabled: !!id && isStudent,
  });

  const registerMutation = useMutation({
    mutationFn: () => studentEventAPI.register(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'registration', id] });
      appToast.success('Registered!', 'You are now registered for this event.', { label: 'Show QR Code', onClick: () => router.push(`/student/events/${id}/qr`) });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Registration Failed', error?.response?.data?.message || 'Could not register.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => studentEventAPI.cancelRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'registration', id] });
      appToast.success('Registration Cancelled', 'Your registration has been cancelled.', { label: 'Re-register', onClick: () => registerMutation.mutate() });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Cancellation Failed', error?.response?.data?.message || 'Could not cancel.');
    },
  });

  const event = data?.data.event;
  const isPast = event && new Date(event.endDate) < new Date();
  const heroImage = event?.coverImage?.imageUrl || event?.imageUrl;
  const bodyHtml = event?.bodyHtml || event?.description || '';

  if (isLoading) {
    return (
      <div className="relative min-h-screen pt-24 pb-16">
        <MeshGradientBg variant="subtle" className="fixed inset-0" interactive={false} />
        <div className="relative z-10 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="relative min-h-screen pt-24 pb-16">
        <MeshGradientBg variant="subtle" className="fixed inset-0" interactive={false} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <MeshGradientBg variant="subtle" className="fixed inset-0" interactive={false} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/events')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <Card className="overflow-hidden">
          {heroImage && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={heroImage}
                alt={event.coverImage?.alt || event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-black mb-2">{event.title}</h1>
                <p className="text-lg text-muted-foreground">{event.excerpt}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
                <Badge variant="outline">
                  {getOwnershipLabel(event)}
                </Badge>
                {registration && (registration.status === 'registered' || registration.status === 'checked_in') && (
                  <Badge className={registration.status === 'checked_in' ? 'bg-blue-600' : 'bg-green-600'}>
                    {registration.status === 'checked_in' ? 'Checked In' : 'Registered'}
                  </Badge>
                )}
                {registration?.status === 'cancelled' && (
                  <Badge variant="secondary">Cancelled</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(event.startDate), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                  {event.venueDetails?.name && <p className="text-sm text-muted-foreground">{event.venueDetails.name}</p>}
                  {event.venueDetails?.room && <p className="text-sm text-muted-foreground">Room: {event.venueDetails.room}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="font-medium">
                    {event.registeredCount ?? event.attendees.length}
                    {event.maxAttendees > 0 ? ` / ${event.maxAttendees}` : ''} registered
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <StructuredContent bodyHtml={bodyHtml} sections={event.sections} />
            </div>

            {(event.speakerItems?.length ?? 0) > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Speakers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakerItems?.map((speaker, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                      {speaker.photo?.imageUrl ? (
                        <Image src={speaker.photo.imageUrl} alt={speaker.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                      ) : <User className="w-12 h-12 p-2 bg-muted rounded-full" />}
                      <div>
                        <p className="font-medium">{speaker.name}</p>
                        {speaker.title && <p className="text-sm text-muted-foreground">{speaker.title}</p>}
                        {speaker.organization && <p className="text-sm text-muted-foreground">{speaker.organization}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(event.audience || event.eligibility || event.feeLabel || event.requirements) && (
              <div className="pt-6 border-t space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                {event.audience && <div><p className="text-sm text-muted-foreground">Target Audience</p><p>{event.audience}</p></div>}
                {event.eligibility && <div><p className="text-sm text-muted-foreground">Eligibility</p><p>{event.eligibility}</p></div>}
                {event.feeLabel && <Badge variant="secondary">{event.feeLabel}</Badge>}
                {event.requirements && <div><p className="text-sm text-muted-foreground">Requirements</p><p>{event.requirements}</p></div>}
                {event.certificateInfo && <Badge variant="outline">{event.certificateInfo}</Badge>}
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Coverage */}
            {(data?.data?.relatedNews?.length ?? 0) > 0 || (data?.data?.relatedAnnouncements?.length ?? 0) > 0 ? (
              <div className="pt-6 border-t space-y-6">
                {(data?.data?.relatedNews?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Related News</h3>
                    <div className="space-y-3">
                      {data?.data?.relatedNews?.map((article: { _id: string; title: string; excerpt?: string; publishedAt?: string }) => (
                        <Link key={article._id} href={`/news/${article._id}`}
                          className="block p-4 rounded-lg border hover:bg-secondary/20 transition-colors">
                          <p className="font-medium text-primary hover:underline">{article.title}</p>
                          {article.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {(data?.data?.relatedAnnouncements?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Related Announcements</h3>
                    <div className="space-y-3">
                      {data?.data?.relatedAnnouncements?.map((ann: { _id: string; title: string; subtype?: string }) => (
                        <Link key={ann._id} href={`/announcements/${ann._id}`}
                          className="block p-4 rounded-lg border hover:bg-secondary/20 transition-colors">
                          <p className="font-medium text-primary hover:underline">{ann.title}</p>
                          {ann.subtype && <Badge variant="outline" className="mt-1">{ann.subtype}</Badge>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Eligibility */}
            {(event.targetProgramIds?.length ?? 0) > 0 || (event.targetYearLevelIds?.length ?? 0) > 0 || (event.targetSectionIds?.length ?? 0) > 0 ? (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Eligibility</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {(event.targetProgramIds?.length ?? 0) > 0 && (
                    <p>Programs: <span className="font-medium">{event.targetProgramIds?.join(', ')}</span></p>
                  )}
                  {(event.targetYearLevelIds?.length ?? 0) > 0 && (
                    <p>Year Levels: <span className="font-medium">{event.targetYearLevelIds?.join(', ')}</span></p>
                  )}
                  {(event.targetSectionIds?.length ?? 0) > 0 && (
                    <p>Sections: <span className="font-medium">{event.targetSectionIds?.join(', ')}</span></p>
                  )}
                </div>
              </div>
            ) : null}

            {(event.contactName || event.contactEmail || event.contactPhone) && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  {event.contactName && <p className="font-medium">{event.contactName}</p>}
                  {event.contactEmail && <a href={`mailto:${event.contactEmail}`} className="text-primary hover:underline block">{event.contactEmail}</a>}
                  {event.contactPhone && <p className="text-muted-foreground">{event.contactPhone}</p>}
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">Organizer</h3>
              <p className="text-muted-foreground">
                {event.organizer.firstName} {event.organizer.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
            </div>

            {(event.attachmentItems?.length ?? 0) > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                <div className="space-y-2">
                  {event.attachmentItems?.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 p-3 rounded-lg border hover:bg-secondary/20 transition-colors">
                      <Paperclip className="w-4 h-4 text-primary" />
                      <span className="font-medium">{att.label}</span>
                      {att.fileSize && <span className="text-xs text-muted-foreground ml-auto">({(att.fileSize / 1024).toFixed(0)} KB)</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {event.schedule && event.schedule.length > 0 ? (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Program Flow</h3>
                <div className="space-y-3">
                  {event.schedule.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-primary">{item.label}</span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {event.gallery && event.gallery.length > 0 ? (
              <div className="pt-6 border-t">
                <ScrollingGallery
                  images={event.gallery.map((image) => image.imageUrl)}
                  accentColor="#2563eb"
                />
              </div>
            ) : null}

            <div className="pt-6 border-t">
              <div className="rounded-xl border bg-secondary/20 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground mb-3">
                  <Info className="w-4 h-4 text-primary" />
                  Event Registration
                </div>
                {isPast ? (
                  <p className="text-muted-foreground">This event has ended.</p>
                ) : studentLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking registration...</span>
                  </div>
                ) : isStudent ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {getRegistrationBadge(event.isRegistrationOpen)}
                      {event.allowWalkIns && (
                        <Badge variant="outline">Walk-ins Allowed</Badge>
                      )}
                      {event.registrationCloseAt && event.isRegistrationOpen && (
                        <Badge variant="outline">
                          Closes {format(new Date(event.registrationCloseAt), 'MMM dd, h:mm a')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {event.registeredCount != null && event.maxAttendees > 0
                        ? `${event.registeredCount} / ${event.maxAttendees} registered`
                        : event.registeredCount != null
                          ? `${event.registeredCount} registered`
                          : 'Registration is open.'}
                    </p>
                    {!registration ? (
                      event.isRegistrationOpen ? (
                        <Button
                          onClick={() => registerMutation.mutate()}
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Register Now
                        </Button>
                      ) : (
                        <p className="text-muted-foreground">Registration is currently closed for this event.</p>
                      )
                    ) : registration.status === 'registered' || registration.status === 'checked_in' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {registration.status === 'checked_in' ? 'Checked In' : 'Registered'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" asChild>
                            <Link href={`/student/events/${event._id}/qr`}>
                              <QrCode className="w-4 h-4 mr-2" /> View QR Code
                            </Link>
                          </Button>
                          {registration.status === 'registered' && (
                            <Button
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => cancelMutation.mutate()}
                              disabled={cancelMutation.isPending}
                            >
                              {cancelMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Cancel Registration
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : registration.status === 'cancelled' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Cancelled</Badge>
                        </div>
                        {event.isRegistrationOpen && (
                          <Button
                            onClick={() => registerMutation.mutate()}
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Register Again
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {getRegistrationBadge(event.isRegistrationOpen)}
                      {event.allowWalkIns && (
                        <Badge variant="outline">Walk-ins Allowed</Badge>
                      )}
                      {event.registrationCloseAt && event.isRegistrationOpen && (
                        <Badge variant="outline">
                          Closes {format(new Date(event.registrationCloseAt), 'MMM dd, h:mm a')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {event.registeredCount != null && event.maxAttendees > 0
                        ? `${event.registeredCount} / ${event.maxAttendees} registered`
                        : event.registeredCount != null
                          ? `${event.registeredCount} registered`
                          : 'Registration is open for students.'}
                    </p>
                    {(event.targetProgramIds && event.targetProgramIds.length > 0) ||
                     (event.targetYearLevelIds && event.targetYearLevelIds.length > 0) ? (
                      <p className="text-xs text-muted-foreground">
                        This event has eligibility requirements. Sign in to check if you qualify.
                      </p>
                    ) : null}
                    {event.isRegistrationOpen ? (
                      <Link href={`/student/login?redirect=/events/${event._id}`}>
                        <Button>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Sign In to Register
                        </Button>
                      </Link>
                    ) : (
                      <p className="text-muted-foreground">Registration is currently closed for this event.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
