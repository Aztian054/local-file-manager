import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  createFile,
  deleteFile,
  getFileById,
  getUserFiles,
  getFileStats,
} from "./db";
import {
  categorizeFile,
  generateStoragePath,
  getMonthNameIndonesian,
} from "./fileCategories";
import { storagePut, storageGetSignedUrl } from "./storage";
import type { FileCategory } from "../drizzle/schema";

export const filesRouter = router({
  /**
   * Get presigned URL for file upload
   * Client will use this URL to upload file directly to S3
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        fileSize: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthName = getMonthNameIndonesian(month);

        // Categorize file
        const category = categorizeFile(input.filename, input.mimeType);

        // Generate storage path
        const storagePath = generateStoragePath(
          category,
          year,
          month,
          input.filename
        );

        // Get presigned upload URL from storage
        const { key, url } = await storagePut(storagePath, Buffer.alloc(0));

        return {
          uploadUrl: url,
          fileKey: key,
          storagePath,
          category,
          year,
          month,
          monthName,
        };
      } catch (error) {
        console.error("[Upload] Error getting upload URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get upload URL",
        });
      }
    }),

  /**
   * Register uploaded file in database
   * Called after successful S3 upload
   */
  registerUpload: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        fileSize: z.number().int().positive(),
        fileKey: z.string().min(1),
        storagePath: z.string().min(1),
        category: z.string() as z.ZodType<FileCategory>,
        uploadYear: z.number().int(),
        uploadMonth: z.number().int().min(1).max(12),
        uploadMonthName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const file = await createFile({
          userId: ctx.user.id,
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          category: input.category,
          storagePath: input.storagePath,
          fileKey: input.fileKey,
          uploadYear: input.uploadYear,
          uploadMonth: input.uploadMonth,
          uploadMonthName: input.uploadMonthName,
        });

        if (!file) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to register file",
          });
        }

        return file;
      } catch (error) {
        console.error("[Upload] Error registering file:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register file",
        });
      }
    }),

  /**
   * Get all files for the current user with optional filtering
   */
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        year: z.number().int().optional(),
        month: z.number().int().min(1).max(12).optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const files = await getUserFiles(ctx.user.id, {
          category: input.category,
          year: input.year,
          month: input.month,
          search: input.search,
          startDate: input.startDate,
          endDate: input.endDate,
        });

        return files;
      } catch (error) {
        console.error("[Files] Error listing files:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list files",
        });
      }
    }),

  /**
   * Get a single file by ID
   */
  getById: protectedProcedure
    .input(z.object({ fileId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      try {
        const file = await getFileById(input.fileId, ctx.user.id);

        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        return file;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Files] Error getting file:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get file",
        });
      }
    }),

  /**
   * Get download URL for a file
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      try {
        const file = await getFileById(input.fileId, ctx.user.id);

        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        const downloadUrl = await storageGetSignedUrl(file.fileKey);

        return {
          downloadUrl,
          filename: file.filename,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Files] Error getting download URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get download URL",
        });
      }
    }),

  /**
   * Delete a file
   */
  delete: protectedProcedure
    .input(z.object({ fileId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const file = await getFileById(input.fileId, ctx.user.id);

        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        const success = await deleteFile(input.fileId, ctx.user.id);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete file",
          });
        }

        return { success: true, fileId: input.fileId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Files] Error deleting file:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),

  /**
   * Get file statistics for the current user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await getFileStats(ctx.user.id);
      return stats;
    } catch (error) {
      console.error("[Files] Error getting stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get statistics",
      });
    }
  }),

  /**
   * Get folder structure (categories, years, months)
   */
  getFolderStructure: protectedProcedure.query(async ({ ctx }) => {
    try {
      const files = await getUserFiles(ctx.user.id);

      // Build folder tree structure
      const structure: Record<
        string,
        Record<number, Record<number, { count: number; files: number[] }>>
      > = {};

      files.forEach((file) => {
        if (!structure[file.category]) {
          structure[file.category] = {};
        }
        if (!structure[file.category][file.uploadYear]) {
          structure[file.category][file.uploadYear] = {};
        }
        if (!structure[file.category][file.uploadYear][file.uploadMonth]) {
          structure[file.category][file.uploadYear][file.uploadMonth] = {
            count: 0,
            files: [],
          };
        }

        structure[file.category][file.uploadYear][file.uploadMonth].count += 1;
        structure[file.category][file.uploadYear][file.uploadMonth].files.push(
          file.id
        );
      });

      return structure;
    } catch (error) {
      console.error("[Files] Error getting folder structure:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get folder structure",
      });
    }
  }),
});
