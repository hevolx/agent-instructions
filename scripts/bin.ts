import { main, type CliArgs } from './cli.js';

const STRING_ARGS = ['variant', 'scope', 'prefix'] as const;
const BOOLEAN_FLAGS: { flag: string; key: keyof CliArgs }[] = [
  { flag: '--skip-template-injection', key: 'skipTemplateInjection' }
];

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (const arg of argv) {
    for (const { flag, key } of BOOLEAN_FLAGS) {
      if (arg === flag) {
        (args as Record<string, boolean>)[key] = true;
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

export async function run(argv: string[]) {
  const args = parseArgs(argv);
  await main(args);
}

run(process.argv.slice(2)).catch(console.error);
