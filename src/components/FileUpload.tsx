
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";

interface FileUploadProps {
  accept: string;
  onFileUpload: (file: File) => void;
  description: string;
}

export function FileUpload({ accept, onFileUpload, description }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setFileName(file.name);
    setError(null);

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setIsUploading(false);
      return;
    }

    // Simulate processing
    setTimeout(() => {
      onFileUpload(file);
      setIsUploading(false);
      setIsSuccess(true);
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } transition-all`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileInputChange}
          accept={accept}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <div className="animate-pulse">
              <FileText className="h-10 w-10 text-blue-500" />
              <p className="mt-2 text-sm text-gray-600">Processing file...</p>
            </div>
          ) : isSuccess ? (
            <div className="text-green-600">
              <Check className="h-10 w-10 mx-auto" />
              <p className="mt-2 text-sm">File processed successfully!</p>
            </div>
          ) : error ? (
            <div className="text-red-600">
              <AlertCircle className="h-10 w-10 mx-auto" />
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm text-gray-600">{description}</p>
            </>
          )}
          
          {fileName && !error && !isSuccess && (
            <p className="text-sm text-gray-600">
              {fileName}
            </p>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            Select CSV File
          </Button>
        </div>
      </div>
    </div>
  );
}
