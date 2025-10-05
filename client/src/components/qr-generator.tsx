import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (text && canvasRef.current) {
      generateQRCode();
    }
  }, [text]);

  const generateQRCode = async () => {
    if (!text.trim()) {
      setQrCodeUrl('');
      return;
    }

    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        const url = canvasRef.current.toDataURL('image/png');
        setQrCodeUrl(url);
      }
    } catch (error) {
      toast({
        title: 'Error generating QR code',
        description: 'Failed to generate QR code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyImage = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      
      toast({
        title: 'QR code copied',
        description: 'QR code image copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy image to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'QR code downloaded',
      description: 'QR code image saved to your device',
    });
  };

  const handleClear = () => {
    setText('');
    setQrCodeUrl('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const characterCount = text.length;
  const maxLength = 2048;

  return (
    <div className="space-y-8">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">QR Code Generator</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate QR codes from any URL or text. Perfect for sharing links, contact information, or any text data.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="qr-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Enter URL or Text
              </label>
              <Textarea
                id="qr-input"
                data-testid="input-qr-text"
                placeholder="Paste your link here"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxLength}
                className="min-h-[120px] resize-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {characterCount}/{maxLength} characters
                </span>
                {text && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Enter URL or text
                  </span>
                )}
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <img 
                    src={qrCodeUrl} 
                    alt="Generated QR Code" 
                    className="w-[300px] h-[300px]"
                    data-testid="img-qr-code"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleCopyImage}
                    variant="outline"
                    className="flex items-center space-x-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    data-testid="button-copy-qr"
                  >
                    <i className="fas fa-copy"></i>
                    <span>Copy Image</span>
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2"
                    data-testid="button-download-qr"
                  >
                    <i className="fas fa-download"></i>
                    <span>Download JPG</span>
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="flex items-center space-x-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    data-testid="button-clear-qr"
                  >
                    <i className="fas fa-trash"></i>
                    <span>Clear</span>
                  </Button>
                </div>
              </div>
            )}

            {!text && (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <i className="fas fa-qrcode text-4xl mb-3 block"></i>
                <p className="text-sm">Enter text or URL above to generate QR code</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
