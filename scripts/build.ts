#!/usr/bin/env tsx

import { execSync } from "child_process";
import fs from "fs";
import { processMarkdownFiles } from "./generate-readme.js";

function run(cmd: string, options?: { silent?: boolean }): void {
  execSync(cmd, {
    stdio: options?.silent ? "pipe" : "inherit",
    encoding: "utf-8",
  });
}

async function main(): Promise<void> {
  console.log("📖 Building README.md...");
  fs.copyFileSync("src/README.md", "README.md");
  await processMarkdownFiles(["README.md"]);
  run("pnpm exec markdownlint --fix README.md", { silent: true });
  console.log("   ✅ README.md updated");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
