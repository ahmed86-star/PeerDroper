import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QRScannerComponent({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result.data);
        stopScanning();
      },
      {
        onDecodeError: (err) => {
          // Ignore decode errors - they happen frequently while scanning
          console.log('QR decode error:', err);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    setScanner(qrScanner);

    // Check if camera is available
    QrScanner.hasCamera().then((hasCamera) => {
      setHasCamera(hasCamera);
      if (!hasCamera && onError) {
        onError('No camera found on this device');
      }
    });

    return () => {
      qrScanner.destroy();
    };
  }, [onScan, onError]);

  const startScanning = async () => {
    if (!scanner || !hasCamera) return;

    try {
      await scanner.start();
      setIsScanning(true);
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      if (onError) {
        onError('Failed to access camera. Please check permissions.');
      }
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop();
      setIsScanning(false);
    }
  };

  if (!hasCamera) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-lg">
        <i className="fas fa-exclamation-triangle text-4xl text-amber-500 mb-4"></i>
        <p className="text-slate-600 mb-2">No camera detected</p>
        <p className="text-sm text-slate-500">
          Please ensure your device has a camera and grant permission to use it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded-lg object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
            <div className="text-center">
              <i className="fas fa-camera text-4xl text-slate-400 mb-4"></i>
              <p className="text-slate-600 mb-2">Ready to scan QR code</p>
              <p className="text-sm text-slate-500">Click start to begin scanning</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {!isScanning ? (
          <Button onClick={startScanning} className="flex-1">
            <i className="fas fa-play mr-2"></i>
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="outline" className="flex-1">
            <i className="fas fa-stop mr-2"></i>
            Stop Scanning
          </Button>
        )}
      </div>
      
      <p className="text-xs text-slate-500 text-center">
        Point your camera at a Droppy QR code to connect a device
      </p>
    </div>
  );
}