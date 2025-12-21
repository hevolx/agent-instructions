import fs from "fs";

/**
 * Get all markdown files from a directory.
 * @param dir - Directory path to search
 * @returns Array of markdown filenames (not full paths)
 */
export function getMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

/**
 * Extract error message from an unknown caught value.
 * @param err - The caught error value (may not be an Error instance)
 * @returns The error message string
 */
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
