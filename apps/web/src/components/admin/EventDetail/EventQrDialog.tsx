'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';

interface EventQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventUrl: string;
  eventTitle?: string;
}

export function EventQrDialog({ open, onOpenChange, eventUrl, eventTitle }: EventQrDialogProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${eventTitle ?? 'event'}-qr.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
          <DialogDescription>
            Students can scan this QR code to open the event page and register.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {eventUrl && (
            <QRCodeCanvas
              ref={qrRef}
              value={eventUrl}
              size={240}
              level="H"
              includeMargin
              className="rounded-lg border p-2"
            />
          )}
          <p className="text-sm text-muted-foreground text-center break-all max-w-full">
            {eventUrl}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
