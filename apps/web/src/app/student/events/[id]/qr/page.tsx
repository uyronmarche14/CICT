'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { studentEventAPI } from '@/lib/api/student';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download, Smartphone } from 'lucide-react';

export default function StudentQrPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['student', 'qr', eventId],
    queryFn: () => studentEventAPI.getQrPayload(eventId),
    enabled: !!eventId,
    retry: false,
  });

  const { data: registration } = useQuery({
    queryKey: ['student', 'registration', eventId],
    queryFn: () => studentEventAPI.getRegistration(eventId),
    enabled: !!eventId,
  });

  const { data: events } = useQuery({
    queryKey: ['student', 'events'],
    queryFn: studentEventAPI.getEligibleEvents,
  });

  const event = events?.find((e) => e._id === eventId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    const errMsg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Make sure you are registered for this event.';
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Unable to load your QR code.</p>
        <p className="text-sm text-muted-foreground mb-4">{errMsg}</p>
        <Button variant="outline" onClick={() => router.push('/student/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </div>
    );
  }

  const isCheckedIn = registration?.status === 'checked_in';

  const handleDownload = () => {
    const svg = document.getElementById('registration-qr') as unknown as SVGSVGElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-qr-${eventId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/student/events')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
      </Button>

      <Card className="max-w-sm mx-auto">
        <CardContent className="p-8 flex flex-col items-center space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold">Your Event QR Code</h1>
            {event && <p className="text-sm text-muted-foreground mt-1">{event.title}</p>}
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-primary/20 shadow-lg">
            <QRCodeSVG
              id="registration-qr"
              value={data.token}
              size={220}
              level="M"
              includeMargin
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Smartphone className="w-3 h-3" />
              Show this to the event staff to check in
            </p>
            {isCheckedIn && (
              <p className="text-xs text-green-600 font-medium">Already checked in</p>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/student/registrations')}
            >
              My Registrations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
