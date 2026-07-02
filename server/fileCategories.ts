import type { FileCategory } from "../drizzle/schema";

/**
 * Mapping of file extensions to categories
 */
const extensionToCategoryMap: Record<string, FileCategory> = {
  // Documents
  pdf: "Dokumen",
  doc: "Dokumen",
  docx: "Dokumen",
  xls: "Dokumen",
  xlsx: "Dokumen",
  ppt: "Dokumen",
  pptx: "Dokumen",
  txt: "Dokumen",
  odt: "Dokumen",
  ods: "Dokumen",
  odp: "Dokumen",

  // Images
  jpg: "Foto",
  jpeg: "Foto",
  png: "Foto",
  gif: "Foto",
  webp: "Foto",
  bmp: "Foto",
  svg: "Foto",
  ico: "Foto",
  tiff: "Foto",

  // Videos
  mp4: "Video",
  mov: "Video",
  mkv: "Video",
  avi: "Video",
  flv: "Video",
  wmv: "Video",
  webm: "Video",
  m4v: "Video",
  mpg: "Video",
  mpeg: "Video",

  // Audio
  mp3: "Audio",
  wav: "Audio",
  flac: "Audio",
  aac: "Audio",
  ogg: "Audio",
  m4a: "Audio",
  wma: "Audio",
  aiff: "Audio",

  // Archives
  zip: "Arsip",
  rar: "Arsip",
  "7z": "Arsip",
  tar: "Arsip",
  gz: "Arsip",
  bz2: "Arsip",
  xz: "Arsip",

  // Applications
  exe: "Aplikasi",
  msi: "Aplikasi",
  apk: "Aplikasi",
  dmg: "Aplikasi",
  deb: "Aplikasi",
  rpm: "Aplikasi",
  app: "Aplikasi",

  // ISO
  iso: "ISO",

  // Default
  default: "Lainnya",
};

/**
 * MIME type to category mapping (fallback when extension is not recognized)
 */
const mimeTypeToCategoryMap: Record<string, FileCategory> = {
  // Documents
  "application/pdf": "Dokumen",
  "application/msword": "Dokumen",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Dokumen",
  "application/vnd.ms-excel": "Dokumen",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Dokumen",
  "application/vnd.ms-powerpoint": "Dokumen",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "Dokumen",
  "text/plain": "Dokumen",
  "application/vnd.oasis.opendocument.text": "Dokumen",
  "application/vnd.oasis.opendocument.spreadsheet": "Dokumen",
  "application/vnd.oasis.opendocument.presentation": "Dokumen",

  // Images
  "image/jpeg": "Foto",
  "image/png": "Foto",
  "image/gif": "Foto",
  "image/webp": "Foto",
  "image/bmp": "Foto",
  "image/svg+xml": "Foto",
  "image/x-icon": "Foto",
  "image/tiff": "Foto",

  // Videos
  "video/mp4": "Video",
  "video/quicktime": "Video",
  "video/x-matroska": "Video",
  "video/x-msvideo": "Video",
  "video/x-flv": "Video",
  "video/x-ms-wmv": "Video",
  "video/webm": "Video",
  "video/x-m4v": "Video",
  "video/mpeg": "Video",

  // Audio
  "audio/mpeg": "Audio",
  "audio/wav": "Audio",
  "audio/flac": "Audio",
  "audio/aac": "Audio",
  "audio/ogg": "Audio",
  "audio/mp4": "Audio",
  "audio/x-ms-wma": "Audio",
  "audio/x-aiff": "Audio",

  // Archives
  "application/zip": "Arsip",
  "application/x-rar-compressed": "Arsip",
  "application/x-7z-compressed": "Arsip",
  "application/x-tar": "Arsip",
  "application/gzip": "Arsip",
  "application/x-bzip2": "Arsip",
  "application/x-xz": "Arsip",

  // Applications
  "application/x-msdownload": "Aplikasi",
  "application/x-msi": "Aplikasi",
  "application/vnd.android.package-archive": "Aplikasi",
  "application/x-apple-diskimage": "Aplikasi",
  "application/x-deb": "Aplikasi",
  "application/x-rpm": "Aplikasi",

  // ISO
  "application/x-iso9660-image": "ISO",
};

/**
 * Categorize a file based on its extension or MIME type
 */
export function categorizeFile(
  filename: string,
  mimeType: string
): FileCategory {
  // Try extension first
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension && extension in extensionToCategoryMap) {
    return extensionToCategoryMap[extension];
  }

  // Try MIME type
  if (mimeType in mimeTypeToCategoryMap) {
    return mimeTypeToCategoryMap[mimeType];
  }

  // Check MIME type prefix for broader categorization
  const mimePrefix = mimeType.split("/")[0];
  switch (mimePrefix) {
    case "image":
      return "Foto";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "text":
      return "Dokumen";
    case "application":
      // For application/* types, check if it's an archive
      if (mimeType.includes("zip") || mimeType.includes("archive")) {
        return "Arsip";
      }
      break;
  }

  // Default to Lainnya
  return "Lainnya";
}

/**
 * Get month name in Indonesian
 */
export function getMonthNameIndonesian(month: number): string {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return monthNames[month - 1] || "Januari";
}

/**
 * Generate storage path for a file
 * Format: Category/Year/MM - MonthName/filename
 */
export function generateStoragePath(
  category: FileCategory,
  year: number,
  month: number,
  filename: string
): string {
  const monthName = getMonthNameIndonesian(month);
  const monthPadded = String(month).padStart(2, "0");
  return `storage/${category}/${year}/${monthPadded} - ${monthName}/${filename}`;
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: FileCategory): string {
  const emojiMap: Record<FileCategory, string> = {
    Dokumen: "📄",
    Foto: "🖼",
    Video: "🎥",
    Audio: "🎵",
    Arsip: "📦",
    Aplikasi: "💻",
    ISO: "💿",
    Lainnya: "📁",
  };
  return emojiMap[category];
}
