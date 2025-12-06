/**
 * Post-process markdown files to remove markdown-magic comment blocks.
 *
 * This is a workaround for markdown-magic v4.0.4 where the removeComments
 * option is documented but not actually implemented.
 */

import fs from "fs";
import path from "path";

// Regex to match markdown-magic comment blocks
const MAGIC_COMMENT_REGEX = /<!--\s*docs\s+.*?-->\n?|<!--\s*\/docs\s*-->\n?/g;

// Regex to match frontmatter fields with underscore prefix (build-only metadata)
const UNDERSCORE_FIELD_REGEX = /^_[a-zA-Z0-9_-]+:.*$/gm;

/**
 * Clean markdown content by removing magic comments and underscore-prefixed frontmatter fields.
 */
function cleanMarkdownContent(content: string): string {
  // Remove markdown-magic comment blocks
  let cleaned = content.replace(MAGIC_COMMENT_REGEX, "");

  // Remove underscore-prefixed frontmatter fields
  cleaned = cleaned.replace(UNDERSCORE_FIELD_REGEX, "");

  // Clean up any double newlines in frontmatter that may result from field removal
  cleaned = cleaned.replace(
    /---\n([\s\S]*?)\n---/g,
    (_match, frontmatterContent: string) => {
      const cleanedFrontmatter = frontmatterContent
        .replace(/\n\n+/g, "\n")
        .trim();
      return `---\n${cleanedFrontmatter}\n---`;
    },
  );

  return cleaned;
}

/**
 * Process a single markdown file, removing magic comments.
 * Returns true if the file was modified.
 */
function processFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf8");
  const cleaned = cleanMarkdownContent(content);

  if (content !== cleaned) {
    fs.writeFileSync(filePath, cleaned, "utf8");
    return true;
  }
  return false;
}

/**
 * Process all markdown files in a directory recursively.
 * Returns the number of files that were modified.
 */
function processDirectory(dirPath: string): number {
  let filesProcessed = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      filesProcessed += processDirectory(filePath);
    } else if (file.endsWith(".md")) {
      if (processFile(filePath)) {
        filesProcessed++;
      }
    }
  }

  return filesProcessed;
}

/**
 * Process a target path (file or directory).
 * Returns the number of files that were modified.
 */
export function processTarget(target: string): number {
  if (!fs.existsSync(target)) {
    throw new Error(`'${target}' does not exist`);
  }

  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    return processDirectory(target);
  } else if (target.endsWith(".md")) {
    return processFile(target) ? 1 : 0;
  } else {
    throw new Error(`'${target}' is not a directory or markdown file`);
  }
}
