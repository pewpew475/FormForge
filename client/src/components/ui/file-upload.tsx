import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  className?: string;
  accept?: string;
}

export function FileUpload({ onUpload, currentImage, onRemove, className, accept = "image/*" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('Image is too large. Please select an image smaller than 5MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
        
        // Upload to server
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Data,
            fileName: file.name,
          }),
        });
        
        if (response.ok) {
          const { url } = await response.json();
          onUpload(url);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(errorData.message || 'Upload failed');
        }
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        console.error("Failed to read file");
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      // Show user-friendly error message
      alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  if (currentImage) {
    return (
      <div className={cn("relative group", className)}>
        <img 
          src={currentImage} 
          alt="Uploaded image" 
          className="w-full h-32 object-cover rounded-lg border border-slate-300"
        />
        {onRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
            data-testid="button-remove-image"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition-colors cursor-pointer",
        isDragging && "border-primary bg-primary/5",
        "hover:border-primary hover:bg-primary/5",
        className
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => fileInputRef.current?.click()}
      data-testid="file-upload-area"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file"
      />
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-sm text-slate-600">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center ml-[0px] mr-[0px] mt-[-18px] mb-[-18px]">
          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}
    </div>
  );
}
