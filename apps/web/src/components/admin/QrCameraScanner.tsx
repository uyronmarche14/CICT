'use client';

import { useEffect, useRef, useState } from 'react';
import type { Html5Qrcode as Html5QrcodeType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2, Smartphone, RefreshCw } from 'lucide-react';

interface QrCameraScannerProps {
  onScan: (token: string) => void;
  onError: (message: string) => void;
  scanning: boolean;
}

const SCANNER_ID = 'qr-camera-scanner';

export default function QrCameraScanner({ onScan, onError, scanning }: QrCameraScannerProps) {
  const scannerRef = useRef<Html5QrcodeType | null>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const start = async () => {
    setStarting(true);
    setScanError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stop();
          onScan(decodedText);
        },
        () => {}
      );
      setActive(true);
    } catch {
      setScanError('Camera access denied or unavailable. Use manual check-in instead.');
      onError('Camera access denied or unavailable. Use manual check-in instead.');
    } finally {
      setStarting(false);
    }
  };

  const stop = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setActive(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {active ? (
            <Camera className="w-5 h-5 text-green-500" />
          ) : (
            <Smartphone className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {active ? 'Scanner Active' : scanError ? 'Scanner Error' : 'Camera Ready'}
          </span>
        </div>
        {!active ? (
          <Button size="sm" onClick={start} disabled={starting || scanning}>
            {starting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Camera className="w-4 h-4 mr-1.5" />
            )}
            {starting ? 'Starting...' : 'Start Camera'}
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={stop}>
            <CameraOff className="w-4 h-4 mr-1.5" /> Stop
          </Button>
        )}
      </div>

      <div className="relative rounded-lg overflow-hidden border max-w-sm w-full mx-auto bg-muted/20" style={{ aspectRatio: '1 / 1' }}>
        {!active && !starting && !scanError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-muted-foreground gap-2 bg-card">
            <Smartphone className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Camera is off</p>
            <p className="text-xs text-muted-foreground/70">Click &quot;Start Camera&quot; to scan student QR codes.</p>
          </div>
        )}

        {!active && !starting && scanError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-card">
            <p className="text-sm text-destructive">{scanError}</p>
            <Button size="sm" variant="outline" onClick={start}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Try Again
            </Button>
          </div>
        )}

        <div id={SCANNER_ID} className="w-full h-full" />
      </div>

      {scanning && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
