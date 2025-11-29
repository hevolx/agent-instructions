import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const VARIANTS = {
  WITH_BEADS: 'with-beads',
  WITHOUT_BEADS: 'without-beads'
} as const;

export const SCOPES = {
  PROJECT: 'project',
  USER: 'user'
} as const;

export const DIRECTORIES = {
  CLAUDE: '.claude',
  COMMANDS: 'commands',
  DOWNLOADS: 'downloads'
} as const;

export const TEMPLATE_SOURCE_FILES = ['CLAUDE.md', 'AGENTS.md'] as const;

export interface TemplateBlock {
  content: string;
  commands?: string[];
}

export type Variant = typeof VARIANTS[keyof typeof VARIANTS];
export type Scope = typeof SCOPES[keyof typeof SCOPES];

const ELLIPSIS = '...';

function truncatePathFromLeft(pathStr: string, maxLength: number): string {
  if (pathStr.length <= maxLength) {
    return pathStr;
  }
  const truncated = pathStr.slice(-(maxLength - ELLIPSIS.length));
  const firstSlash = truncated.indexOf('/');
  if (firstSlash > 0) {
    return ELLIPSIS + truncated.slice(firstSlash);
  }
  return ELLIPSIS + truncated;
}

export const VARIANT_OPTIONS = [
  { value: VARIANTS.WITH_BEADS, label: 'With Beads', hint: 'Includes Beads task tracking' },
  { value: VARIANTS.WITHOUT_BEADS, label: 'Without Beads', hint: 'Standard commands only' }
] as const;

export function getScopeOptions(terminalWidth: number = 80) {
  const projectPath = path.join(process.cwd(), DIRECTORIES.CLAUDE, DIRECTORIES.COMMANDS);
  const userPath = path.join(os.homedir(), DIRECTORIES.CLAUDE, DIRECTORIES.COMMANDS);

  return [
    { value: SCOPES.PROJECT, label: 'Project/Repository', hint: truncatePathFromLeft(projectPath, terminalWidth) },
    { value: SCOPES.USER, label: 'User (Global)', hint: truncatePathFromLeft(userPath, terminalWidth) }
  ];
}

export interface GenerateOptions {
  skipTemplateInjection?: boolean;
  commandPrefix?: string;
  commands?: string[];
}

export interface GenerateResult {
  success: boolean;
  filesGenerated: number;
  variant?: Variant;
  templateInjectionSkipped?: boolean;
  templateInjected?: boolean;
}

export async function getAvailableCommands(variant: Variant): Promise<string[]> {
  const sourcePath = path.join(__dirname, '..', DIRECTORIES.DOWNLOADS, variant || VARIANTS.WITH_BEADS);
  return fs.readdir(sourcePath);
}

interface CommandOption {
  value: string;
  label: string;
}

interface CommandMetadata {
  description: string;
  category: string;
  order: number;
}

export async function getCommandsGroupedByCategory(variant: Variant): Promise<Record<string, CommandOption[]>> {
  const sourcePath = path.join(__dirname, '..', DIRECTORIES.DOWNLOADS, variant || VARIANTS.WITH_BEADS);
  const metadataPath = path.join(sourcePath, 'commands-metadata.json');

  const metadataContent = await fs.readFile(metadataPath, 'utf-8');
  const metadata: Record<string, CommandMetadata> = JSON.parse(metadataContent);

  const grouped: Record<string, CommandOption[]> = {};

  for (const [filename, data] of Object.entries(metadata)) {
    const category = data.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      value: filename,
      label: filename
    });
  }

  // Sort commands within each category by order
  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) => {
      const orderA = metadata[a.value].order;
      const orderB = metadata[b.value].order;
      return orderA - orderB;
    });
  }

  return grouped;
}

function getDestinationPath(outputPath: string | undefined, scope: string | undefined): string | undefined {
  if (outputPath) {
    return outputPath;
  }

  if (scope === SCOPES.PROJECT) {
    return path.join(process.cwd(), DIRECTORIES.CLAUDE, DIRECTORIES.COMMANDS);
  }

  if (scope === SCOPES.USER) {
    return path.join(os.homedir(), DIRECTORIES.CLAUDE, DIRECTORIES.COMMANDS);
  }

  return undefined;
}

export function extractTemplateBlocks(content: string): TemplateBlock | null {
  const matchWithCommands = content.match(/<claude-commands-template\s+commands="([^"]+)">([\s\S]*?)<\/claude-commands-template>/);
  if (matchWithCommands) {
    return {
      content: matchWithCommands[2].trim(),
      commands: matchWithCommands[1].split(',').map(c => c.trim())
    };
  }

  const match = content.match(/<claude-commands-template>([\s\S]*?)<\/claude-commands-template>/);
  if (!match) {
    return null;
  }
  return { content: match[1].trim() };
}

export async function generateToDirectory(outputPath?: string, variant?: Variant, scope?: Scope, options?: GenerateOptions): Promise<GenerateResult> {
  const sourcePath = path.join(__dirname, '..', DIRECTORIES.DOWNLOADS, variant || VARIANTS.WITH_BEADS);

  const destinationPath = getDestinationPath(outputPath, scope);

  if (!destinationPath) {
    throw new Error('Either outputPath or scope must be provided');
  }

  const allFiles = await fs.readdir(sourcePath);
  const files = options?.commands ? allFiles.filter(f => options.commands!.includes(f)) : allFiles;

  if (options?.commands) {
    await fs.ensureDir(destinationPath);
    for (const file of files) {
      await fs.copy(path.join(sourcePath, file), path.join(destinationPath, file));
    }
  } else {
    await fs.copy(sourcePath, destinationPath, {});
  }

  if (options?.commandPrefix) {
    for (const file of files) {
      const oldPath = path.join(destinationPath, file);
      const newPath = path.join(destinationPath, options.commandPrefix + file);
      await fs.rename(oldPath, newPath);
    }
  }

  let templateInjected = false;

  if (!options?.skipTemplateInjection) {
    let templateSourcePath: string | null = null;
    for (const filename of TEMPLATE_SOURCE_FILES) {
      const candidatePath = path.join(process.cwd(), filename);
      if (await fs.pathExists(candidatePath)) {
        templateSourcePath = candidatePath;
        break;
      }
    }

    if (templateSourcePath) {
      const sourceContent = await fs.readFile(templateSourcePath, 'utf-8');
      const template = extractTemplateBlocks(sourceContent);
      if (template) {
        for (const file of files) {
          const commandName = path.basename(file, '.md');
          if (template.commands && !template.commands.includes(commandName)) {
            continue;
          }
          const actualFileName = options?.commandPrefix ? options.commandPrefix + file : file;
          const filePath = path.join(destinationPath, actualFileName);
          const content = await fs.readFile(filePath, 'utf-8');
          await fs.writeFile(filePath, content + '\n\n' + template.content);
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

