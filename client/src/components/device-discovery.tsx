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
import { useEffect, useState } from 'react';

export default function DeviceDiscovery() {
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceIP, setDeviceIP] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
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
    if (!deviceName || !deviceType || !deviceIP) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all device details',
        variant: 'destructive',
      });
      return;
    }

    addDeviceMutation.mutate({
      name: deviceName,
      type: deviceType,
      ipAddress: deviceIP,
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
      // Parse QR code data (expected format: droppy://name:type:ip)
      const qrUrl = new URL(dataToProcess);
      if (qrUrl.protocol !== 'droppy:') {
        throw new Error('Invalid QR code format');
      }
      
      const [name, type, ip] = qrUrl.hostname.split(':');
      
      addDeviceMutation.mutate({
        name: decodeURIComponent(name) || 'Unknown Device',
        type: type || 'mobile',
        ipAddress: ip || '192.168.1.101',
      });
      
      setIsQRScannerOpen(false);
      setQrCodeData('');
    } catch (error) {
      toast({
        title: 'Invalid QR code',
        description: 'Please scan a valid Droppy QR code',
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
    const currentDevice = devices?.find(d => d.id === 1);
    if (currentDevice) {
      return `droppy://${currentDevice.name}:${currentDevice.type}:${currentDevice.ipAddress}`;
    }
    return 'droppy://MacBook%20Pro:desktop:192.168.1.100';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connected Devices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="p-2 text-slate-400 hover:text-blue-500"
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
                className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3`}>
                  <i className={`${getDeviceIcon(device.type)} ${getDeviceIconColor(device.type)}`}></i>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{device.name}</div>
                  <div className="text-sm text-slate-500">{device.ipAddress}</div>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            ))}
            
            {connectedDevices.length === 0 && (
              <div className="text-center py-8 text-slate-500">
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
                className="w-full mt-4 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-600"
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
                  <Label htmlFor="device-ip">IP Address</Label>
                  <Input
                    id="device-ip"
                    value={deviceIP}
                    onChange={(e) => setDeviceIP(e.target.value)}
                    placeholder="e.g., 192.168.1.101"
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
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center mb-4 p-2">
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* QR Code Pattern Simulation */}
                <div className="grid grid-cols-8 gap-px w-full h-full p-1">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div
                      key={i}
                      className={`${
                        [0, 1, 2, 5, 6, 7, 8, 14, 16, 22, 24, 30, 32, 38, 40, 46, 48, 49, 50, 53, 54, 55, 57, 58, 59, 62, 63].includes(i)
                          ? 'bg-white' 
                          : 'bg-transparent'
                      } rounded-sm`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-qrcode text-white text-lg opacity-50"></i>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">Scan QR code to connect</p>
            <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-50 p-2 rounded">
              {generateCurrentDeviceQR()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              onClick={() => {
                navigator.clipboard.writeText(generateCurrentDeviceQR());
                toast({
                  title: 'Copied to clipboard',
                  description: 'QR code data copied successfully',
                });
              }}
            >
              <i className="fas fa-copy mr-1"></i>
              Copy QR Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
