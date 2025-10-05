import { useQuery, useMutation } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/use-websocket';
import { getDeviceIcon, getDeviceIconColor } from '@/lib/file-utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Device } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRScannerComponent from './qr-scanner';
import QRCode from 'qrcode';
import { useEffect, useState, useRef } from 'react';

export default function DeviceDiscovery() {
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceIP, setDeviceIP] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { data: devices, refetch } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });

  const { lastMessage, sendMessage } = useWebSocket();

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: { name: string; type: string; ipAddress: string }) => {
      const response = await apiRequest('POST', '/api/devices', {
        ...deviceData,
        isConnected: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      setIsAddDeviceOpen(false);
      setDeviceName('');
      setDeviceType('');
      setDeviceIP('');
      toast({
        title: 'Device added successfully',
        description: 'The device is now connected to your network',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to add device',
        description: 'Please check the device information and try again',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (lastMessage?.type === 'device_connected' || lastMessage?.type === 'device_disconnected') {
      refetch();
    }
  }, [lastMessage, refetch]);

  const connectedDevices = devices?.filter(device => device.isConnected) || [];

  const handleAddDevice = () => {
    if (!deviceName || !deviceType) {
      toast({
        title: 'Missing information',
        description: 'Please fill in device name and type',
        variant: 'destructive',
      });
      return;
    }

    addDeviceMutation.mutate({
      name: deviceName,
      type: deviceType,
      ipAddress: deviceIP || 'Cloud Device',
    });
  };

  const handleQRCodeConnect = (scannedData?: string) => {
    const dataToProcess = scannedData || qrCodeData;
    
    if (!dataToProcess) {
      toast({
        title: 'No QR code data',
        description: 'Please scan a valid QR code',
        variant: 'destructive',
      });
      return;
    }

    try {
      // For cloud deployment, QR code contains the app URL
      // Open the URL in a new tab so users can access the app
      const url = new URL(dataToProcess);
      window.open(dataToProcess, '_blank');
      
      toast({
        title: 'Opening app',
        description: 'App opened in new tab',
      });
      
      setIsQRScannerOpen(false);
      setQrCodeData('');
    } catch (error) {
      toast({
        title: 'Invalid QR code',
        description: 'Please scan a valid QR code URL',
        variant: 'destructive',
      });
    }
  };

  const handleQRScanError = (error: string) => {
    toast({
      title: 'Camera Error',
      description: error,
      variant: 'destructive',
    });
  };

  const generateCurrentDeviceQR = () => {
    // Use the current app URL (works both on Replit and Railway)
    const appUrl = window.location.origin;
    return appUrl;
  };

  useEffect(() => {
    const generateQR = async () => {
      const qrData = generateCurrentDeviceQR();
      try {
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: '#1e293b',
              light: '#ffffff',
            },
          });
          const url = canvasRef.current.toDataURL('image/png');
          setQrCodeUrl(url);
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    if (devices) {
      generateQR();
    }
  }, [devices]);

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">Connected Devices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <i className="fas fa-sync-alt text-sm"></i>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connectedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mr-3`}>
                  <i className={`${getDeviceIcon(device.type)} ${getDeviceIconColor(device.type)}`}></i>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">{device.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {device.ipAddress === 'Cloud Device' ? device.type : device.ipAddress}
                  </div>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            ))}
            
            {connectedDevices.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <i className="fas fa-search text-2xl mb-2 block"></i>
                <p>No devices connected</p>
                <p className="text-sm">Devices will appear here when they connect</p>
              </div>
            )}
          </div>
          
          <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="device-name">Device Name</Label>
                  <Input
                    id="device-name"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g., iPhone 15, Samsung Galaxy"
                  />
                </div>
                <div>
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select value={deviceType} onValueChange={setDeviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="device-ip">Device Identifier (optional)</Label>
                  <Input
                    id="device-ip"
                    value={deviceIP}
                    onChange={(e) => setDeviceIP(e.target.value)}
                    placeholder="e.g., User's Phone, Work Laptop"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleAddDevice} 
                    disabled={addDeviceMutation.isPending}
                    className="flex-1"
                  >
                    {addDeviceMutation.isPending ? 'Adding...' : 'Add Device'}
                  </Button>
                  <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <i className="fas fa-qrcode mr-2"></i>
                        Scan QR
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="qr-data">QR Code Data</Label>
                          <Input
                            id="qr-data"
                            value={qrCodeData}
                            onChange={(e) => setQrCodeData(e.target.value)}
                            placeholder="Paste QR code data or scan with camera"
                          />
                        </div>
                        <QRScannerComponent 
                          onScan={handleQRCodeConnect}
                          onError={handleQRScanError}
                        />
                        <Button 
                          onClick={() => handleQRCodeConnect()} 
                          disabled={addDeviceMutation.isPending}
                          className="w-full"
                        >
                          Connect Device
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Quick Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-2xl flex items-center justify-center mb-4 p-4">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Device QR Code" 
                  className="w-full h-full object-contain"
                  data-testid="img-device-qr"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <i className="fas fa-qrcode text-slate-400 dark:text-slate-500 text-4xl"></i>
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scan to access this app</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Scan with your phone to open the app</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
              onClick={() => {
                navigator.clipboard.writeText(generateCurrentDeviceQR());
                toast({
                  title: 'Copied to clipboard',
                  description: 'QR code data copied successfully',
                });
              }}
              data-testid="button-copy-qr-data"
            >
              <i className="fas fa-copy mr-1"></i>
              Copy QR Data
            </Button>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </CardContent>
      </Card>
    </div>
  );
}
