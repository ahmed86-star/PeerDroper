import { useQuery, useMutation } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/use-websocket';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { getDeviceIcon } from '@/lib/file-utils';
import type { Message, Device } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

export default function MessagingPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const { lastMessage, sendMessage } = useWebSocket();

  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  const { data: devices } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const messageData = {
        content,
        fromDevice: 1, // Current device ID
      };
      
      // Send via WebSocket for real-time delivery
      sendMessage({ type: 'send_message', data: messageData });
      
      // Also save to API
      return apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
    },
  });

  useEffect(() => {
    if (lastMessage?.type === 'new_message') {
      refetchMessages();
    }
  }, [lastMessage, refetchMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getDeviceInfo = (deviceId: number | null) => {
    if (!deviceId) return { name: 'Unknown', type: 'desktop' };
    const device = devices?.find(d => d.id === deviceId);
    return device ? { name: device.name, type: device.type } : { name: 'Unknown', type: 'desktop' };
  };

  const unreadCount = 0; // TODO: Implement unread message tracking

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-comments text-white"></i>
            <span className="font-medium text-white">Messages</span>
            {unreadCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={`fas fa-chevron-${isOpen ? 'down' : 'up'}`}></i>
          </Button>
        </div>
      </div>

      {isOpen && (
        <>
          <ScrollArea className="h-64 p-4">
            <div className="space-y-3">
              {messages?.map((message) => {
                const deviceInfo = getDeviceInfo(message.fromDevice);
                const isCurrentUser = message.fromDevice === 1; // Current device ID
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 ${isCurrentUser ? 'bg-blue-500' : 'bg-blue-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`${getDeviceIcon(deviceInfo.type)} ${isCurrentUser ? 'text-white' : 'text-blue-600'} text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <div className={`${isCurrentUser ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-slate-100 rounded-tl-sm'} rounded-2xl p-3`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center space-x-2 mt-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                        {!isCurrentUser && (
                          <span className="text-xs text-slate-500">{deviceInfo.name}</span>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(message.sentAt!).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-slate-500">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!messages || messages.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <i className="fas fa-comments text-2xl mb-2 block"></i>
                  <p>No messages yet</p>
                  <p className="text-sm">Start a conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                className="bg-violet-500 text-white hover:bg-violet-600 p-2"
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !newMessage.trim()}
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
