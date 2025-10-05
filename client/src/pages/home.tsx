import AppHeader from '@/components/app-header';
import DeviceDiscovery from '@/components/device-discovery';
import FileSharing from '@/components/file-sharing';
import QRGenerator from '@/components/qr-generator';
import MessagingPanel from '@/components/messaging-panel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <DeviceDiscovery />
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="files" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="files" data-testid="tab-files">
                  <i className="fas fa-file mr-2"></i>
                  Share Files
                </TabsTrigger>
                <TabsTrigger value="qr" data-testid="tab-qr">
                  <i className="fas fa-qrcode mr-2"></i>
                  QR Generator
                </TabsTrigger>
              </TabsList>
              <TabsContent value="files">
                <FileSharing />
              </TabsContent>
              <TabsContent value="qr">
                <QRGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <MessagingPanel />
        
        {/* Floating Action Button for Mobile */}
        <Button
          className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors lg:hidden"
        >
          <i className="fas fa-bars"></i>
        </Button>
      </main>
    </div>
  );
}
