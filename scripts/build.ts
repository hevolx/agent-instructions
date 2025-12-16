#!/usr/bin/env tsx

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { processMarkdownFiles } from "./generate-readme.js";
import { getMarkdownFiles } from "./utils.js";

// Constants
const SRC_DIR = "src/sources";
const LOCAL_COMMANDS_DIR = ".claude/commands";

function run(cmd: string, options?: { silent?: boolean }): void {
  execSync(cmd, {
    stdio: options?.silent ? "pipe" : "inherit",
    encoding: "utf-8",
  });
}

async function main(): Promise<void> {
  console.log("🏗️  Building...");
  console.log("");

  // Generate README
  console.log("📖 Updating README.md...");
  fs.copyFileSync("src/README.md", "README.md");
  await processMarkdownFiles(["README.md"]);
  run("pnpm exec markdownlint --fix README.md", { silent: true });
  console.log("   ✅ README.md updated");
  console.log("");

  // Generate local .claude/commands for development (with beads enabled)
  console.log("📋 Updating .claude/commands...");
  fs.mkdirSync(LOCAL_COMMANDS_DIR, { recursive: true });

  // Remove existing command files
  for (const file of getMarkdownFiles(LOCAL_COMMANDS_DIR)) {
    try {
      fs.unlinkSync(path.join(LOCAL_COMMANDS_DIR, file));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  }

  // Process source files with beads enabled, output to local commands dir
  const sourceFiles = getMarkdownFiles(SRC_DIR).map((f) =>
    path.join(SRC_DIR, f),
  );
  await processMarkdownFiles(sourceFiles, {
    withBeads: true,
    outputDir: LOCAL_COMMANDS_DIR,
  });

  // Copy any files that weren't processed (plain markdown without transforms)
  for (const file of getMarkdownFiles(SRC_DIR)) {
    const destPath = path.join(LOCAL_COMMANDS_DIR, file);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(path.join(SRC_DIR, file), destPath);
    }
  }

  run(`pnpm exec markdownlint --fix "${LOCAL_COMMANDS_DIR}"/*.md`, {
    silent: true,
  });
  console.log("   ✅ .claude/commands updated");
  console.log("");

  // Summary
  console.log("✅ Build complete!");
  console.log("");
  console.log("📂 Generated files:");
  console.log("");
  console.log("   README.md");
  console.log("");
  console.log("   Local commands (.claude/commands/):");
  for (const file of getMarkdownFiles(LOCAL_COMMANDS_DIR)) {
    console.log(`     ✓ ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
