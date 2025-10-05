import { useQuery, useMutation } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/use-websocket';
import { formatFileSize, getFileIcon, getFileIconColor } from '@/lib/file-utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { File, Transfer } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCallback, useEffect, useState } from 'react';

export default function FileSharing() {
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);

  const { data: files, refetch: refetchFiles } = useQuery<File[]>({
    queryKey: ['/api/files'],
  });

  const { data: activeTransfers, refetch: refetchTransfers } = useQuery<Transfer[]>({
    queryKey: ['/api/transfers/active'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/files/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      refetchFiles();
      toast({
        title: 'File uploaded successfully',
        description: 'Your file is ready to share',
      });
    },
    onError: () => {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file',
        variant: 'destructive',
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await apiRequest('DELETE', `/api/files/${fileId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      toast({
        title: 'File deleted successfully',
        description: 'The file has been removed from your shares',
      });
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the file',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (lastMessage?.type === 'transfer_updated') {
      refetchTransfers();
    }
  }, [lastMessage, refetchTransfers]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('deviceId', '1'); // Current device ID
      uploadMutation.mutate(formData);
    });
  }, [uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('deviceId', '1'); // Current device ID
      uploadMutation.mutate(formData);
    });
    
    e.target.value = '';
  }, [uploadMutation]);

  const handleDropZoneClick = useCallback(() => {
    document.getElementById('file-upload')?.click();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Uploading...</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Waiting...</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownload = (file: File) => {
    window.open(`/api/files/${file.id}/download`, '_blank');
  };

  const handleShare = (file: File) => {
    const shareUrl = `${window.location.origin}/api/files/${file.id}/download`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: 'Share link copied',
        description: 'File download link copied to clipboard',
      });
    });
  };

  const handleDeleteClick = (file: File) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteFileMutation.mutate(fileToDelete.id);
    }
  };

  const recentFiles = files?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* File Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Share Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onClick={handleDropZoneClick}
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <i className="fas fa-cloud-upload-alt text-blue-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Drop files here to share</h3>
            <p className="text-slate-500 mb-4">or click to browse your files</p>
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700" 
              disabled={uploadMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-upload')?.click();
              }}
              data-testid="button-choose-files"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Choose Files'}
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <p className="text-xs text-slate-400 mt-3">Support for images, documents, videos up to 100MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Transfers */}
      {activeTransfers && activeTransfers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Transfers</CardTitle>
              <span className="text-sm text-slate-500">{activeTransfers.length} active</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-file text-blue-600"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">Transfer #{transfer.id}</span>
                      <span className="text-sm text-slate-500">{transfer.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">File ID: {transfer.fileId}</span>
                      {getStatusBadge(transfer.status)}
                    </div>
                    <Progress value={transfer.progress || 0} className="w-full" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-slate-400 hover:text-red-500"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Files</CardTitle>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger>
                  <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className={`w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3`}>
                      <i className={`${getFileIcon(file.mimeType)} ${getFileIconColor(file.mimeType)}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{file.originalName}</div>
                      <div className="text-sm text-slate-500">
                        Shared {new Date(file.uploadedAt!).toLocaleDateString()} • {formatFileSize(file.size)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-blue-500"
                        onClick={() => handleDownload(file)}
                      >
                        <i className="fas fa-download text-sm"></i>
                      </Button>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleDownload(file)}>
                    <i className="fas fa-download mr-2"></i>
                    Download
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleShare(file)}>
                    <i className="fas fa-share mr-2"></i>
                    Copy Share Link
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => {
                    navigator.clipboard.writeText(file.originalName);
                    toast({
                      title: 'Filename copied',
                      description: 'File name copied to clipboard',
                    });
                  }}>
                    <i className="fas fa-copy mr-2"></i>
                    Copy Name
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {
                    const fileInfo = `Name: ${file.originalName}\nSize: ${formatFileSize(file.size)}\nType: ${file.mimeType}\nUploaded: ${new Date(file.uploadedAt!).toLocaleString()}`;
                    navigator.clipboard.writeText(fileInfo);
                    toast({
                      title: 'File info copied',
                      description: 'File details copied to clipboard',
                    });
                  }}>
                    <i className="fas fa-info-circle mr-2"></i>
                    Copy Details
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem 
                    onClick={() => handleDeleteClick(file)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Delete File
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            
            {recentFiles.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <i className="fas fa-file text-2xl mb-2 block"></i>
                <p>No files shared yet</p>
                <p className="text-sm">Upload files to start sharing</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.originalName}"? This action cannot be undone and the file will be permanently removed from your shares.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteFileMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteFileMutation.isPending ? 'Deleting...' : 'Delete File'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
