import { select, text, isCancel, intro, outro } from '@clack/prompts';
import { generateToDirectory, VARIANT_OPTIONS, SCOPE_OPTIONS, type Variant, type Scope } from './cli-generator.js';

const BATMAN_LOGO = `
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

export interface CliArgs {
  variant?: string;
  scope?: string;
  prefix?: string;
  skipTemplateInjection?: boolean;
}

export async function main(args?: CliArgs): Promise<void> {
  intro(BATMAN_LOGO);

  let variant: string | symbol;
  let scope: string | symbol;
  let commandPrefix: string | symbol;

  if (args?.variant && args?.scope && args?.prefix !== undefined) {
    variant = args.variant;
    scope = args.scope;
    commandPrefix = args.prefix;
  } else {
    variant = await select({
      message: 'Select variant',
      options: [...VARIANT_OPTIONS]
    });

    if (isCancel(variant)) {
      return;
    }

    scope = await select({
      message: 'Select installation scope',
      options: [...SCOPE_OPTIONS]
    });

    if (isCancel(scope)) {
      return;
    }

    commandPrefix = await text({
      message: 'Command prefix (optional)',
      placeholder: 'e.g. my-'
    });

    if (isCancel(commandPrefix)) {
      return;
    }
  }

  const result = await generateToDirectory(undefined, variant as Variant, scope as Scope, { commandPrefix: commandPrefix as string, skipTemplateInjection: args?.skipTemplateInjection });

  outro(`Installed ${result.filesGenerated} commands to .claude/commands`);
}
