/**
 * Adapters for converting between different data formats
 */

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = base64.split(",")[1] || base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 to buffer (server-side)
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

/**
 * Get file MIME type
 */
export function getFileMime(file: File): string {
  return file.type || "application/octet-stream";
}

