import { useWebSocket } from '@/hooks/use-websocket';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  const { isConnected } = useWebSocket();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-paper-plane text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Droppy</h1>
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">Local File Sharing</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              data-testid="button-toggle-theme"
            >
              {theme === 'light' ? (
                <i className="fas fa-moon text-lg"></i>
              ) : (
                <i className="fas fa-sun text-lg"></i>
              )}
            </Button>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
              <i className="fas fa-laptop mr-1"></i>
              MacBook Pro
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
