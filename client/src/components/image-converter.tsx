import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import JSZip from 'jszip';

interface ConvertedImage {
  name: string;
  size: number;
  url: string;
  originalSize: number;
}

export default function ImageConverter() {
  const [images, setImages] = useState<File[]>([]);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState([90]);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast({
        title: 'No images found',
        description: 'Please drop image files',
        variant: 'destructive',
      });
      return;
    }
    
    setImages(prev => [...prev, ...files]);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    e.target.value = '';
  }, []);

  const convertImage = async (file: File): Promise<ConvertedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${outputFormat}`;
        const qualityValue = quality[0] / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Conversion failed'));
              return;
            }

            const url = URL.createObjectURL(blob);
            const newName = file.name.replace(/\.[^.]+$/, `.${outputFormat}`);

            resolve({
              name: newName,
              size: blob.size,
              url,
              originalSize: file.size,
            });
          },
          mimeType,
          qualityValue
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please add images to convert',
        variant: 'destructive',
      });
      return;
    }

    setIsConverting(true);
    const converted: ConvertedImage[] = [];

    try {
      for (const file of images) {
        const result = await convertImage(file);
        converted.push(result);
      }

      setConvertedImages(converted);
      toast({
        title: 'Conversion complete',
        description: `Successfully converted ${converted.length} image(s)`,
      });
    } catch (error) {
      toast({
        title: 'Conversion failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadSingle = (image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    if (convertedImages.length === 0) return;

    const zip = new JSZip();
    
    for (const image of convertedImages) {
      const response = await fetch(image.url);
      const blob = await response.blob();
      zip.file(image.name, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `converted-images-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download started',
      description: 'ZIP file with all images is downloading',
    });
  };

  const clearAll = () => {
    convertedImages.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setConvertedImages([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Image Format Converter</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Convert images between different formats using your browser. All processing happens locally - your images never leave your device.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer mb-6"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('image-upload')?.click()}
            data-testid="dropzone-images"
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-4">
              <i className="fas fa-image text-blue-600 dark:text-blue-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drop images or folders here</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Select multiple images or drag entire folders for batch conversion</p>
            <Button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
              Select Images
            </Button>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Input: PNG, JPEG, WebP, AVIF, GIF, SVG, BMP | Output: PNG, JPEG, WebP
            </p>
          </div>

          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {images.length} image(s) selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  data-testid="button-clear-images"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format" className="text-slate-700 dark:text-slate-300">Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                    <SelectTrigger id="format" className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality" className="text-slate-700 dark:text-slate-300">
                    Quality: {quality[0]}%
                  </Label>
                  <Slider
                    id="quality"
                    value={quality}
                    onValueChange={setQuality}
                    min={1}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                data-testid="button-convert"
              >
                {isConverting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Converting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Convert Images
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {convertedImages.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">Converted Images</CardTitle>
              <Button
                onClick={downloadAll}
                className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                data-testid="button-download-all"
              >
                <i className="fas fa-download mr-2"></i>
                Download All as ZIP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convertedImages.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-check text-green-600 dark:text-green-400"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white">{image.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(image.originalSize)} → {formatFileSize(image.size)}
                      <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        {Math.round((1 - image.size / image.originalSize) * 100)}% smaller
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadSingle(image)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    data-testid={`button-download-${index}`}
                  >
                    <i className="fas fa-download"></i>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
