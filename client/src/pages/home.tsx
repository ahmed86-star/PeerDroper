import AppHeader from '@/components/app-header';
import DeviceDiscovery from '@/components/device-discovery';
import FileSharing from '@/components/file-sharing';
import QRGenerator from '@/components/qr-generator';
import ImageConverter from '@/components/image-converter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <DeviceDiscovery />
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="files" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-white dark:bg-slate-800">
                <TabsTrigger value="files" data-testid="tab-files">
                  <i className="fas fa-file mr-2"></i>
                  Share Files
                </TabsTrigger>
                <TabsTrigger value="qr" data-testid="tab-qr">
                  <i className="fas fa-qrcode mr-2"></i>
                  QR Generator
                </TabsTrigger>
                <TabsTrigger value="convert" data-testid="tab-convert">
                  <i className="fas fa-image mr-2"></i>
                  Image Converter
                </TabsTrigger>
              </TabsList>
              <TabsContent value="files">
                <FileSharing />
              </TabsContent>
              <TabsContent value="qr">
                <QRGenerator />
              </TabsContent>
              <TabsContent value="convert">
                <ImageConverter />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Built with</span>
            <i className="fas fa-heart text-red-500 text-xs"></i>
            <span>by</span>
            <a 
              href="https://github.com/ahmed86-star" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center space-x-1"
              data-testid="link-github"
            >
              <i className="fab fa-github"></i>
              <span>ahmed86-star</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
