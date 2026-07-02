import React from "react";
import { X, Download, Trash2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { File } from "../../../drizzle/schema";

interface FileDetailsModalProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (file: File) => void;
  onDelete?: (file: File) => void;
}

const categoryEmoji: Record<string, string> = {
  Dokumen: "📄",
  Foto: "🖼",
  Video: "🎥",
  Audio: "🎵",
  Arsip: "📦",
  Aplikasi: "💻",
  ISO: "💿",
  Lainnya: "📁",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FileDetailsModal({
  file,
  open,
  onOpenChange,
  onDownload,
  onDelete,
}: FileDetailsModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!file) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.storagePath);
    setCopied(true);
    toast.success("Path copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {categoryEmoji[file.category] || "📁"}
            </span>
            <span className="truncate">{file.filename}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Category
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {file.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                File Size
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {formatFileSize(file.fileSize)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                MIME Type
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 font-mono text-xs">
                {file.mimeType}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Upload Date
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {formatDate(file.uploadedAt)}
              </p>
            </div>
          </div>

          {/* Storage Path */}
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Storage Location
            </p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <code className="text-xs font-mono text-gray-600 dark:text-gray-400 flex-1 truncate">
                {file.storagePath}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPath}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Folder Structure */}
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Folder Structure
            </p>
            <div className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-1">
              <div>storage/</div>
              <div className="ml-4">
                └── {file.category}/
              </div>
              <div className="ml-8">
                └── {file.uploadYear}/
              </div>
              <div className="ml-12">
                └── {String(file.uploadMonth).padStart(2, "0")} -{" "}
                {file.uploadMonthName}/
              </div>
              <div className="ml-16">
                └── {file.filename}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDownload?.(file);
                onOpenChange(false);
              }}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDelete?.(file);
                onOpenChange(false);
              }}
              className="flex-1 gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
