#!/usr/bin/env node
/**
 * Post-process markdown files to remove markdown-magic comment blocks.
 *
 * This is a workaround for markdown-magic v4.0.4 where the removeComments
 * option is documented but not actually implemented.
 */

import fs from 'fs';
import path from 'path';

// Regex to match markdown-magic comment blocks
const MAGIC_COMMENT_REGEX = /<!--\s*docs\s+.*?-->\n?|<!--\s*\/docs\s*-->\n?/g;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = content.replace(MAGIC_COMMENT_REGEX, '');

  if (content !== cleaned) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dirPath) {
  let filesProcessed = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      filesProcessed += processDirectory(filePath);
    } else if (file.endsWith('.md')) {
      if (processFile(filePath)) {
        filesProcessed++;
      }
    }
  });

  return filesProcessed;
}

// Get directory from command line args
const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Usage: node post-process.js <directory>');
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  console.error(`Error: Directory '${targetDir}' does not exist`);
  process.exit(1);
}

const count = processDirectory(targetDir);
console.log(`   ✅ Removed comment blocks from ${count} file(s)`);
