import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fileToBase64 } from '../../lib/ocrUtils';
import { 
  ScanLine, 
  Upload, 
  Camera, 
  Check, 
  X, 
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OCRScannerProps {
  onScanComplete: (entries: Array<{
    day: string;
    startTime: string;
    endTime: string;
    title: string;
    location: string;
  }>) => void;
}

export default function OCRScanner({ onScanComplete }: OCRScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Reset states
    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    // Using file input as a workaround for camera access
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: Event) => handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };
  
  // Process the image with OCR
  const processImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    
    try {
      setIsScanning(true);
      setError(null);
      
      // Mock progress updates
      const progressInterval = setInterval(() => {
        setScanningProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Convert image to base64
      const imageData = await fileToBase64(selectedFile);
      
      // Send to server for OCR processing
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData, enhanceResults: true }),
      });
      
      clearInterval(progressInterval);
      setScanningProgress(100);
      
      if (!response.ok) {
        throw new Error('OCR processing failed');
      }
      
      const data = await response.json();
      
      if (!data.result || data.result.length === 0) {
        setError('No timetable entries detected. Try with a clearer image.');
        setIsScanning(false);
        return;
      }
      
      // Pass results to parent component
      onScanComplete(data.result);
      
      // Reset for next scan
      setTimeout(() => {
        setIsScanning(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setScanningProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('OCR error:', err);
      setError('Failed to process image. Please try again.');
      setIsScanning(false);
    }
  };
  
  // Cancel scanning process
  const cancelScan = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsScanning(false);
    setScanningProgress(0);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent className="p-4">
          {/* Preview area */}
          <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4 flex items-center justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Timetable preview" 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <ScanLine className="mx-auto h-12 w-12 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload or take a photo of your timetable
                </p>
              </div>
            )}
          </div>
          
          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Controls */}
          <div className="flex flex-col gap-2">
            {isScanning ? (
              <>
                <div className="h-1 w-full bg-muted rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${scanningProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {scanningProgress < 100 ? 'Processing...' : 'Completed!'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={cancelScan}
                    disabled={scanningProgress >= 100}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* File input button */}
                <div className="flex gap-2">
                  <Button
                    variant="outline" 
                    className="flex-1"
                    onClick={() => document.getElementById('timetable-file-input')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Camera
                  </Button>
                  
                  <input
                    id="timetable-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                {/* Scan button */}
                <Button 
                  disabled={!selectedFile} 
                  onClick={processImage}
                  className="w-full"
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ScanLine className="h-4 w-4 mr-2" />
                  )}
                  {isScanning ? 'Processing...' : 'Scan Timetable'}
                </Button>
                
                {/* Cancel button - show only when image is selected */}
                {selectedFile && (
                  <Button 
                    variant="ghost" 
                    onClick={cancelScan}
                    size="sm"
                    className="mt-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p className="font-medium mb-1">For best results:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ensure the image is well-lit and clear</li>
          <li>Include column headers (days, times)</li>
          <li>Make sure text is readable</li>
          <li>Crop out irrelevant parts of the image</li>
        </ul>
      </div>
    </div>
  );
}