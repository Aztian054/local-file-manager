import React, { useRef, useState } from "react";
import { Cloud, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface FileUploadAreaProps {
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export function FileUploadArea({
  onUploadStart,
  onUploadComplete,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, number>
  >({});

  const registerUploadMutation = trpc.files.registerUpload.useMutation();
  const getUploadUrlMutation = trpc.files.getUploadUrl.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      // Step 1: Get upload URL and metadata from server
      const uploadInfo = await getUploadUrlMutation.mutateAsync({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      setUploadProgress((prev) => ({ ...prev, [file.name]: 30 }));

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(uploadInfo.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setUploadProgress((prev) => ({ ...prev, [file.name]: 70 }));

      // Step 3: Register file in database
      await registerUploadMutation.mutateAsync({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileKey: uploadInfo.fileKey,
        storagePath: uploadInfo.storagePath,
        category: uploadInfo.category,
        uploadYear: uploadInfo.year,
        uploadMonth: uploadInfo.month,
        uploadMonthName: uploadInfo.monthName,
      });

      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

      toast.success(`File "${file.name}" uploaded successfully`);

      // Clean up progress after animation
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload "${file.name}"`);
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    onUploadStart?.();

    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }

      onUploadComplete?.();
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
          <div
            className={`rounded-full p-3 transition-colors ${
              isDragging
                ? "bg-blue-100 dark:bg-blue-900"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            <Cloud
              className={`h-8 w-8 transition-colors ${
                isDragging
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            />
          </div>

          <div className="text-center">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Drag and drop your files here
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              or click the button below to select files
            </p>
          </div>

          <Button
            onClick={handleClick}
            disabled={isUploading}
            variant="default"
            className="mt-2 gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Select Files"}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            All file types supported • Files are automatically organized by type,
            year, and month
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                  {filename}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {progress}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
