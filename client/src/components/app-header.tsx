import { useWebSocket } from '@/hooks/use-websocket';

export default function AppHeader() {
  const { isConnected } = useWebSocket();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-paper-plane text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Droppy</h1>
            <span className="text-sm text-slate-500 hidden sm:inline">Local File Sharing</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              <i className="fas fa-laptop mr-1"></i>
              MacBook Pro
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
