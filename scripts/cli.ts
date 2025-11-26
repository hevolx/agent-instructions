import { select, isCancel, intro, outro } from '@clack/prompts';
import { generateToDirectory, VARIANT_OPTIONS, SCOPE_OPTIONS, type Variant, type Scope } from './cli-generator.js';

export async function main(): Promise<void> {
  intro('Claude Instructions');

  const variant = await select({
    message: 'Select variant',
    options: [...VARIANT_OPTIONS]
  });

  if (isCancel(variant)) {
    return;
  }

  const scope = await select({
    message: 'Select installation scope',
    options: [...SCOPE_OPTIONS]
  });

  if (isCancel(scope)) {
    return;
  }

  await generateToDirectory(undefined, variant as Variant, scope as Scope);

  outro('Commands installed!');
}
