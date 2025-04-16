import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Camera, ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { processImageWithTesseract } from "@/lib/ocrUtils";

interface OCRUploaderProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: any) => void;
}

export default function OCRUploader({ open, onClose, onScan }: OCRUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    try {
      setIsProcessing(true);

      // Process image with Tesseract.js (client-side OCR)
      const ocrText = await processImageWithTesseract(selectedFile);
      console.log("Extracted OCR text:", ocrText);

      // Send extracted text to server for processing
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("userId", user.id.toString());
      formData.append("ocrText", ocrText);

      const response = await apiRequest("POST", "/api/ocr", formData);
      const result = await response.json();

      toast({
        title: "Timetable processed",
        description: "Your schedule has been successfully scanned and processed",
      });

      onScan(result);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process the timetable image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const captureImage = async () => {
    try {
      if (!navigator.mediaDevices) {
        throw new Error("Camera access not supported by your browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to start playing
      await new Promise((resolve) => {
        video.onplaying = resolve;
      });

      // Create a canvas to capture the image
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/jpeg");
      });
      
      // Create File object from Blob
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      
      // Stop all video tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Set file and preview
      setSelectedFile(file);
      setPreview(URL.createObjectURL(blob));
      
    } catch (error) {
      toast({
        title: "Camera access failed",
        description: error instanceof Error ? error.message : "Failed to access camera",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Timetable</DialogTitle>
          <DialogDescription>
            Upload or take a photo of your paper timetable to automatically import your schedule.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File preview */}
          {preview ? (
            <div className="relative w-full h-64 overflow-hidden border rounded-md">
              <img 
                src={preview}
                alt="Timetable preview"
                className="object-contain w-full h-full"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2"
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md border-muted-foreground/25 p-4">
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                Drag and drop an image, or click to select
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="timetable-upload"
                onChange={handleFileChange}
              />
              <div className="flex gap-2 mt-4">
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="timetable-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </label>
                </Button>
                <Button variant="outline" size="sm" onClick={captureImage}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Scan Timetable"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
