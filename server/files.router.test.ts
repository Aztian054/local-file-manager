import { describe, it, expect, beforeEach, vi } from "vitest";
import { filesRouter } from "./files.router";
import * as db from "./db";
import * as fileCategories from "./fileCategories";

// Mock database functions
vi.mock("./db", () => ({
  createFile: vi.fn(),
  getUserFiles: vi.fn(),
  getFileById: vi.fn(),
  deleteFile: vi.fn(),
  getFileStats: vi.fn(),
}));

// Mock file categories
vi.mock("./fileCategories", () => ({
  categorizeFile: vi.fn(() => "Dokumen"),
  generateStoragePath: vi.fn(() => "storage/Dokumen/2026/07 - Juli/test.pdf"),
  getMonthNameIndonesian: vi.fn(() => "Juli"),
  getCategoryEmoji: vi.fn(() => "📄"),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn(() => ({
    key: "test-key-123",
    url: "/manus-storage/test-key-123",
  })),
  storageGetSignedUrl: vi.fn(() => "https://signed-url.example.com"),
}));

describe("filesRouter", () => {
  const mockUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUploadUrl", () => {
    it("should return upload URL with categorized file info", async () => {
      const caller = filesRouter.createCaller(mockContext);

      const result = await caller.getUploadUrl({
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
      });

      expect(result).toHaveProperty("uploadUrl");
      expect(result).toHaveProperty("fileKey");
      expect(result).toHaveProperty("storagePath");
      expect(result).toHaveProperty("category");
      expect(result.category).toBe("Dokumen");
    });

    it("should handle invalid input", async () => {
      const caller = filesRouter.createCaller(mockContext);

      expect(async () => {
        await caller.getUploadUrl({
          filename: "",
          mimeType: "application/pdf",
          fileSize: 1024,
        });
      }).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return list of files for user", async () => {
      const mockFiles = [
        {
          id: 1,
          userId: 1,
          filename: "test.pdf",
          mimeType: "application/pdf",
          fileSize: 1024,
          category: "Dokumen" as const,
          storagePath: "storage/Dokumen/2026/07 - Juli/test.pdf",
          fileKey: "test-key",
          uploadYear: 2026,
          uploadMonth: 7,
          uploadMonthName: "Juli",
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getUserFiles).mockResolvedValue(mockFiles);

      const caller = filesRouter.createCaller(mockContext);
      const result = await caller.list({});

      expect(result).toEqual(mockFiles);
      expect(db.getUserFiles).toHaveBeenCalledWith(mockUser.id, {});
    });

    it("should filter files by category", async () => {
      vi.mocked(db.getUserFiles).mockResolvedValue([]);

      const caller = filesRouter.createCaller(mockContext);
      await caller.list({ category: "Dokumen" });

      expect(db.getUserFiles).toHaveBeenCalledWith(mockUser.id, {
        category: "Dokumen",
        year: undefined,
        month: undefined,
        search: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it("should search files by name", async () => {
      vi.mocked(db.getUserFiles).mockResolvedValue([]);

      const caller = filesRouter.createCaller(mockContext);
      await caller.list({ search: "test" });

      expect(db.getUserFiles).toHaveBeenCalledWith(mockUser.id, {
        category: undefined,
        year: undefined,
        month: undefined,
        search: "test",
        startDate: undefined,
        endDate: undefined,
      });
    });
  });

  describe("getStats", () => {
    it("should return file statistics", async () => {
      const mockStats = {
        totalFiles: 10,
        totalSize: 10240,
        filesByCategory: { Dokumen: 5, Foto: 3, Video: 2 },
        filesByYear: { 2026: 10 },
      };

      vi.mocked(db.getFileStats).mockResolvedValue(mockStats);

      const caller = filesRouter.createCaller(mockContext);
      const result = await caller.getStats();

      expect(result).toEqual(mockStats);
      expect(db.getFileStats).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("delete", () => {
    it("should delete file", async () => {
      const mockFile = {
        id: 1,
        userId: 1,
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
        category: "Dokumen" as const,
        storagePath: "storage/Dokumen/2026/07 - Juli/test.pdf",
        fileKey: "test-key",
        uploadYear: 2026,
        uploadMonth: 7,
        uploadMonthName: "Juli",
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getFileById).mockResolvedValue(mockFile);
      vi.mocked(db.deleteFile).mockResolvedValue(true);

      const caller = filesRouter.createCaller(mockContext);
      const result = await caller.delete({ fileId: 1 });

      expect(result).toEqual({ success: true, fileId: 1 });
      expect(db.deleteFile).toHaveBeenCalledWith(1, mockUser.id);
    });

    it("should throw error if file not found", async () => {
      vi.mocked(db.getFileById).mockResolvedValue(null);

      const caller = filesRouter.createCaller(mockContext);

      expect(async () => {
        await caller.delete({ fileId: 999 });
      }).rejects.toThrow();
    });
  });

  describe("getFolderStructure", () => {
    it("should return folder structure", async () => {
      const mockFiles = [
        {
          id: 1,
          userId: 1,
          filename: "test.pdf",
          mimeType: "application/pdf",
          fileSize: 1024,
          category: "Dokumen" as const,
          storagePath: "storage/Dokumen/2026/07 - Juli/test.pdf",
          fileKey: "test-key",
          uploadYear: 2026,
          uploadMonth: 7,
          uploadMonthName: "Juli",
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getUserFiles).mockResolvedValue(mockFiles);

      const caller = filesRouter.createCaller(mockContext);
      const result = await caller.getFolderStructure();

      expect(result).toHaveProperty("Dokumen");
      expect(result.Dokumen).toHaveProperty(2026);
      expect(result.Dokumen[2026]).toHaveProperty(7);
      expect(result.Dokumen[2026][7]).toHaveProperty("count", 1);
    });
  });
});
