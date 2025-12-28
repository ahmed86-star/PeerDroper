export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'fas fa-file-image';
  if (mimeType.startsWith('video/')) return 'fas fa-file-video';
  if (mimeType.startsWith('audio/')) return 'fas fa-file-audio';
  if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
  if (mimeType.includes('word')) return 'fas fa-file-word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'fas fa-file-archive';
  return 'fas fa-file';
}

export function getFileIconColor(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'text-blue-600';
  if (mimeType.startsWith('video/')) return 'text-purple-600';
  if (mimeType.startsWith('audio/')) return 'text-green-600';
  if (mimeType.includes('pdf')) return 'text-red-600';
  if (mimeType.includes('word')) return 'text-blue-700';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-700';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-600';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'text-yellow-600';
  return 'text-slate-600';
}

export function getDeviceIcon(type: string): string {
  switch (type) {
    case 'mobile': return 'fas fa-mobile-alt';
    case 'tablet': return 'fas fa-tablet-alt';
    case 'desktop': return 'fas fa-desktop';
    case 'laptop': return 'fas fa-laptop';
    default: return 'fas fa-device';
  }
}

export function getDeviceIconColor(type: string): string {
  switch (type) {
    case 'mobile': return 'text-blue-600';
    case 'tablet': return 'text-purple-600';
    case 'desktop': return 'text-green-600';
    case 'laptop': return 'text-slate-600';
    default: return 'text-slate-600';
  }
}
