#!/bin/bash

# Build command files for local development/testing
# Builds with-beads variant to .claude/commands/ without prefix

set -e

# Constants
readonly SRC_DIR="src/sources"
readonly OUT_DIR=".claude/commands"

echo "🏗️  Building for local development..."

# Clean previous build
echo "🧹 Cleaning previous build..."
pnpm clean:dev
echo ""

# Ensure output directory exists
mkdir -p "$OUT_DIR"

# Process source files with markdown-magic
echo "📄 Processing source files..."
node scripts/generate-readme.js --output-dir "$OUT_DIR" "$SRC_DIR"/*.md

echo "   ✅ Generated command files"

# Remove markdown-magic comment blocks (workaround for markdown-magic bug)
echo "🧹 Removing comment blocks..."
node scripts/post-process.js "$OUT_DIR"

echo ""
echo "✅ Build complete!"
echo ""
echo "📂 Generated files in .claude/commands/:"
ls -1 "$OUT_DIR"/*.md | sed 's|.*/|     ✓ |'
echo ""
echo "💡 Restart Claude Code to load the updated commands"
