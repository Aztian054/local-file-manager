import React, { useState } from "react";
import {
  Download,
  Trash2,
  MoreVertical,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { File } from "../../../drizzle/schema";
import { FileDetailsModal } from "./FileDetailsModal";

interface FileGridViewProps {
  files: File[];
  isLoading?: boolean;
  onFileDeleted?: () => void;
  onFileDownload?: (file: File) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

const categoryColor: Record<string, string> = {
  Dokumen: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  Foto: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  Video: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  Audio: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  Arsip: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  Aplikasi: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
  ISO: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
  Lainnya: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
};

export function FileGridView({
  files,
  isLoading = false,
  onFileDeleted,
  onFileDownload,
}: FileGridViewProps) {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const deleteFileMutation = trpc.files.delete.useMutation();

  const handleDelete = async () => {
    if (!selectedFileId) return;

    setDeletingId(selectedFileId);
    try {
      await deleteFileMutation.mutateAsync({ fileId: selectedFileId });
      toast.success("File deleted successfully");
      setShowDeleteDialog(false);
      onFileDeleted?.();
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
      setSelectedFileId(null);
    }
  };

  const handleDownload = async (file: File) => {
    try {
      const response = await fetch(
        `/api/trpc/files.getDownloadUrl?input=${encodeURIComponent(
          JSON.stringify({ fileId: file.id })
        )}`
      );
      const data = await response.json();
      const downloadInfo = data.result.data;

      const link = document.createElement("a");
      link.href = downloadInfo.downloadUrl;
      link.download = downloadInfo.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded "${downloadInfo.filename}"`);
      onFileDownload?.(file);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
          No files found
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`rounded-lg border ${categoryColor[file.category] || categoryColor.Lainnya} p-4 hover:shadow-md transition-shadow group`}
          >
            {/* File Icon and Name */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-3xl mb-2">
                  {categoryEmoji[file.category] || "📁"}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.filename}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFile(file);
                      setShowDetailsModal(true);
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <Info className="h-4 w-4" />
                    Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownload(file)}
                    className="gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFileId(file.id);
                      setShowDeleteDialog(true);
                    }}
                    className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* File Info */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{formatFileSize(file.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{file.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium truncate">{file.mimeType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FileDetailsModal
        file={selectedFile}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onDownload={() => selectedFile && handleDownload(selectedFile)}
        onDelete={() => {
          if (selectedFile) {
            setSelectedFileId(selectedFile.id);
            setShowDetailsModal(false);
            setShowDeleteDialog(true);
          }
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete File</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this file? This action cannot be
            undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
