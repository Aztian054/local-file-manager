import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * File categories enum - automatically assigned based on file extension
 */
export const fileCategories = [
  "Dokumen",
  "Foto",
  "Video",
  "Audio",
  "Arsip",
  "Aplikasi",
  "ISO",
  "Lainnya",
] as const;

export type FileCategory = (typeof fileCategories)[number];

/**
 * Files table - stores metadata for all uploaded files
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Original filename as uploaded by user */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** MIME type of the file */
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  /** File size in bytes */
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  /** File category (auto-assigned based on extension) */
  category: mysqlEnum("category", fileCategories).notNull(),
  /** Storage path in S3: storage/Category/Year/Month/filename */
  storagePath: text("storagePath").notNull(),
  /** S3 file key for retrieval */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  /** Year of upload */
  uploadYear: int("uploadYear").notNull(),
  /** Month of upload (1-12) */
  uploadMonth: int("uploadMonth").notNull(),
  /** Month name in Indonesian */
  uploadMonthName: varchar("uploadMonthName", { length: 20 }).notNull(),
  /** Upload timestamp */
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));