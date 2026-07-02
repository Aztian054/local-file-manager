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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface FileTableProps {
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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

export function FileTable({
  files,
  isLoading = false,
  onFileDeleted,
  onFileDownload,
}: FileTableProps) {
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
      // Fetch download URL from API
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
              <TableHead className="font-semibold">File Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Size</TableHead>
              <TableHead className="font-semibold">Upload Date</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                  {file.filename}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                    {categoryEmoji[file.category] || "📁"} {file.category}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.fileSize)}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {formatDate(file.uploadedAt)}
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-500 max-w-xs truncate">
                  {file.storagePath}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
