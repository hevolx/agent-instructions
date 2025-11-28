#!/usr/bin/env node

// scripts/cli.ts
import { select, text, isCancel, intro, outro } from "@clack/prompts";

// scripts/cli-generator.ts
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var VARIANTS = {
  WITH_BEADS: "with-beads",
  WITHOUT_BEADS: "without-beads"
};
var SCOPES = {
  PROJECT: "project",
  USER: "user"
};
var DIRECTORIES = {
  CLAUDE: ".claude",
  COMMANDS: "commands",
  DOWNLOADS: "downloads"
};
var TEMPLATE_SOURCE_FILES = ["CLAUDE.md", "AGENTS.md"];
var VARIANT_OPTIONS = [
  { value: VARIANTS.WITH_BEADS, label: "With Beads" },
  { value: VARIANTS.WITHOUT_BEADS, label: "Without Beads" }
];
var SCOPE_OPTIONS = [
  { value: SCOPES.PROJECT, label: "Project/Repository" },
  { value: SCOPES.USER, label: "User (Global)" }
];
function getDestinationPath(outputPath, scope) {
  if (outputPath) {
    return outputPath;
  }
  if (scope === SCOPES.PROJECT) {
    return path.join(process.cwd(), DIRECTORIES.CLAUDE, DIRECTORIES.COMMANDS);
  }
  if (scope === SCOPES.USER) {
    return path.join(os.homedir(), DIRECTORIES.CLAUDE, DIRECTORIES.COMMANDS);
  }
  return void 0;
}
function extractTemplateBlocks(content) {
  const matchWithCommands = content.match(/<claude-commands-template\s+commands="([^"]+)">([\s\S]*?)<\/claude-commands-template>/);
  if (matchWithCommands) {
    return {
      content: matchWithCommands[2].trim(),
      commands: matchWithCommands[1].split(",").map((c) => c.trim())
    };
  }
  const match = content.match(/<claude-commands-template>([\s\S]*?)<\/claude-commands-template>/);
  if (!match) {
    return null;
  }
  return { content: match[1].trim() };
}
async function generateToDirectory(outputPath, variant, scope, options) {
  const sourcePath = path.join(__dirname, "..", DIRECTORIES.DOWNLOADS, variant || VARIANTS.WITH_BEADS);
  const destinationPath = getDestinationPath(outputPath, scope);
  if (!destinationPath) {
    throw new Error("Either outputPath or scope must be provided");
  }
  const files = await fs.readdir(sourcePath);
  await fs.copy(sourcePath, destinationPath, {});
  if (options?.commandPrefix) {
    for (const file of files) {
      const oldPath = path.join(destinationPath, file);
      const newPath = path.join(destinationPath, options.commandPrefix + file);
      await fs.rename(oldPath, newPath);
    }
  }
  let templateInjected = false;
  if (!options?.skipTemplateInjection) {
    let templateSourcePath = null;
    for (const filename of TEMPLATE_SOURCE_FILES) {
      const candidatePath = path.join(process.cwd(), filename);
      if (await fs.pathExists(candidatePath)) {
        templateSourcePath = candidatePath;
        break;
      }
    }
    if (templateSourcePath) {
      const sourceContent = await fs.readFile(templateSourcePath, "utf-8");
      const template = extractTemplateBlocks(sourceContent);
      if (template) {
        for (const file of files) {
          const commandName = path.basename(file, ".md");
          if (template.commands && !template.commands.includes(commandName)) {
            continue;
          }
          const actualFileName = options?.commandPrefix ? options.commandPrefix + file : file;
          const filePath = path.join(destinationPath, actualFileName);
          const content = await fs.readFile(filePath, "utf-8");
          await fs.writeFile(filePath, content + "\n\n" + template.content);
        }
        templateInjected = true;
      }
    }
  }
  return {
    success: true,
    filesGenerated: files.length,
    variant,
    templateInjectionSkipped: options?.skipTemplateInjection,
    templateInjected
  };
}

// scripts/cli.ts
var BATMAN_LOGO = `
       _==/          i     i          \\==_
     /XX/            |\\___/|            \\XX\\
   /XXXX\\            |XXXXX|            /XXXX\\
  |XXXXXX\\_         _XXXXXXX_         _/XXXXXX|
 XXXXXXXXXXXxxxxxxxXXXXXXXXXXXxxxxxxxXXXXXXXXXXX
|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
 XXXXXX/^^^^"\\XXXXXXXXXXXXXXXXXXXXX/^^^^^\\XXXXXX
  |XXX|       \\XXX/^^\\XXXXX/^^\\XXX/       |XXX|
    \\XX\\       \\X/    \\XXX/    \\X/       /XX/
       "\\       "      \\X/      "       /"

            @wbern/claude-instructions
`;
async function main(args) {
  intro(BATMAN_LOGO);
  let variant;
  let scope;
  let commandPrefix;
  if (args?.variant && args?.scope && args?.prefix !== void 0) {
    variant = args.variant;
    scope = args.scope;
    commandPrefix = args.prefix;
  } else {
    variant = await select({
      message: "Select variant",
      options: [...VARIANT_OPTIONS]
    });
    if (isCancel(variant)) {
      return;
    }
    scope = await select({
      message: "Select installation scope",
      options: [...SCOPE_OPTIONS]
    });
    if (isCancel(scope)) {
      return;
    }
    commandPrefix = await text({
      message: "Command prefix (optional)",
      placeholder: "e.g. my-"
    });
    if (isCancel(commandPrefix)) {
      return;
    }
  }
  const result = await generateToDirectory(void 0, variant, scope, { commandPrefix, skipTemplateInjection: args?.skipTemplateInjection });
  outro(`Installed ${result.filesGenerated} commands to .claude/commands`);
}

// scripts/bin.ts
var STRING_ARGS = ["variant", "scope", "prefix"];
var BOOLEAN_FLAGS = [
  { flag: "--skip-template-injection", key: "skipTemplateInjection" }
];
function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    for (const { flag, key } of BOOLEAN_FLAGS) {
      if (arg === flag) {
        args[key] = true;
      }
    }
    for (const key of STRING_ARGS) {
      const prefix = `--${key}=`;
      if (arg.startsWith(prefix)) {
        args[key] = arg.slice(prefix.length);
      }
    }
  }
  return args;
}
async function run(argv) {
  const args = parseArgs(argv);
  await main(args);
}
run(process.argv.slice(2)).catch(console.error);
export {
  parseArgs,
  run
};
