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

export type Variant = typeof VARIANTS[keyof typeof VARIANTS];
export type Scope = typeof SCOPES[keyof typeof SCOPES];

export const VARIANT_OPTIONS = [
  { value: VARIANTS.WITH_BEADS, label: 'With Beads' },
  { value: VARIANTS.WITHOUT_BEADS, label: 'Without Beads' }
] as const;

export const SCOPE_OPTIONS = [
  { value: SCOPES.PROJECT, label: 'Project/Repository' },
  { value: SCOPES.USER, label: 'User (Global)' }
] as const;

export interface GenerateOptions {
  skipTemplateInjection?: boolean;
}

export interface GenerateResult {
  success: boolean;
  filesGenerated: number;
  variant?: Variant;
  templateInjectionSkipped?: boolean;
  templateInjected?: boolean;
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

export function extractTemplateBlocks(content: string): string | null {
  const match = content.match(/<claude-commands-template>([\s\S]*?)<\/claude-commands-template>/);
  if (!match) {
    return null;
  }
  return match[1].trim();
}

export async function generateToDirectory(outputPath?: string, variant?: Variant, scope?: Scope, options?: GenerateOptions): Promise<GenerateResult> {
  const sourcePath = path.join(__dirname, '..', DIRECTORIES.DOWNLOADS, variant || VARIANTS.WITH_BEADS);

  const destinationPath = getDestinationPath(outputPath, scope);

  if (!destinationPath) {
    throw new Error('Either outputPath or scope must be provided');
  }

  const files = await fs.readdir(sourcePath);
  await fs.copy(sourcePath, destinationPath, {});

  let templateInjected = false;

  if (!options?.skipTemplateInjection) {
    const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
    const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');

    let templateSourcePath: string | null = null;
    if (await fs.pathExists(claudeMdPath)) {
      templateSourcePath = claudeMdPath;
    } else if (await fs.pathExists(agentsMdPath)) {
      templateSourcePath = agentsMdPath;
    }

    if (templateSourcePath) {
      const sourceContent = await fs.readFile(templateSourcePath, 'utf-8');
      const template = extractTemplateBlocks(sourceContent);
      if (template) {
        for (const file of files) {
          const filePath = path.join(destinationPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          await fs.writeFile(filePath, content + '\n\n' + template);
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

