import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/use-websocket';
import { getDeviceIcon, getDeviceIconColor } from '@/lib/file-utils';
import type { Device } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

export default function DeviceDiscovery() {
  const { data: devices, refetch } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'device_connected' || lastMessage?.type === 'device_disconnected') {
      refetch();
    }
  }, [lastMessage, refetch]);

  const connectedDevices = devices?.filter(device => device.isConnected) || [];

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
          
          <Button
            variant="outline"
            className="w-full mt-4 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-600"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Device
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center">
                <i className="fas fa-qrcode text-white text-2xl"></i>
              </div>
            </div>
            <p className="text-sm text-slate-600">Scan QR code to connect</p>
            <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-50 p-2 rounded">
              droppy://192.168.1.100:5000
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
