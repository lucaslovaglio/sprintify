import pdfParse from "pdf-parse";
import type { ParseDocumentInput } from "../types.js";

/**
 * Parses a document (PDF or text) and returns plain text
 */
export async function parseDocument(input: ParseDocumentInput): Promise<string> {
  // If pasted text is provided, use it directly
  if (input.pastedText) {
    return input.pastedText.trim();
  }

  // If file buffer is provided, parse based on MIME type
  if (input.fileBuffer && input.mime) {
    if (input.mime === "application/pdf") {
      try {
        const data = await pdfParse(input.fileBuffer);
        return data.text.trim();
      } catch (error) {
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else if (input.mime.startsWith("text/")) {
      return input.fileBuffer.toString("utf-8").trim();
    } else {
      throw new Error(`Unsupported file type: ${input.mime}`);
    }
  }

  throw new Error("No valid input provided. Please provide either pastedText or fileBuffer with mime type.");
}

