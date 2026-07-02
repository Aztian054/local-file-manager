import { and, eq, gte, lte, like, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, files, type InsertFile, type File } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createFile(file: InsertFile): Promise<File | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create file: database not available");
    return null;
  }

  try {
    const result = await db.insert(files).values(file);
    const insertedId = result[0].insertId as number;
    const created = await db
      .select()
      .from(files)
      .where(eq(files.id, insertedId))
      .limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create file:", error);
    throw error;
  }
}

export async function getUserFiles(
  userId: number,
  filters?: {
    category?: string;
    year?: number;
    month?: number;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<File[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get files: database not available");
    return [];
  }

  try {
    const conditions = [eq(files.userId, userId)];

    if (filters?.category) {
      conditions.push(eq(files.category, filters.category as any));
    }
    if (filters?.year) {
      conditions.push(eq(files.uploadYear, filters.year));
    }
    if (filters?.month) {
      conditions.push(eq(files.uploadMonth, filters.month));
    }
    if (filters?.search) {
      conditions.push(like(files.filename, `%${filters.search}%`));
    }
    if (filters?.startDate) {
      conditions.push(gte(files.uploadedAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(files.uploadedAt, filters.endDate));
    }

    const result = await db
      .select()
      .from(files)
      .where(and(...conditions))
      .orderBy(desc(files.uploadedAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get files:", error);
    throw error;
  }
}

export async function getFileById(fileId: number, userId: number): Promise<File | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get file: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get file:", error);
    throw error;
  }
}

export async function deleteFile(fileId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete file: database not available");
    return false;
  }

  try {
    await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete file:", error);
    throw error;
  }
}

export async function getFileStats(userId: number): Promise<{
  totalFiles: number;
  totalSize: number;
  filesByCategory: Record<string, number>;
  filesByYear: Record<number, number>;
}> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get stats: database not available");
    return { totalFiles: 0, totalSize: 0, filesByCategory: {}, filesByYear: {} };
  }

  try {
    const userFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId));

    const totalFiles = userFiles.length;
    const totalSize = userFiles.reduce((sum, f) => sum + f.fileSize, 0);

    const filesByCategory: Record<string, number> = {};
    const filesByYear: Record<number, number> = {};

    userFiles.forEach((file) => {
      filesByCategory[file.category] = (filesByCategory[file.category] || 0) + 1;
      filesByYear[file.uploadYear] = (filesByYear[file.uploadYear] || 0) + 1;
    });

    return { totalFiles, totalSize, filesByCategory, filesByYear };
  } catch (error) {
    console.error("[Database] Failed to get stats:", error);
    throw error;
  }
}
