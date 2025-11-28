import { describe, it, expect, vi } from 'vitest';
import { parseArgs } from './bin.js';

vi.mock('./cli.js', () => ({
  main: vi.fn().mockResolvedValue(undefined)
}));

describe('parseArgs', () => {
  it('should parse command line arguments', () => {
    const args = parseArgs(['--variant=with-beads', '--scope=project', '--prefix=my-']);

    expect(args).toEqual({
      variant: 'with-beads',
      scope: 'project',
      prefix: 'my-'
    });
  });

  it('should parse --skip-template-injection flag', () => {
    const args = parseArgs(['--skip-template-injection']);

    expect(args).toEqual({
      skipTemplateInjection: true
    });
  });
});

describe('run', () => {
  it('should pass parsed args to main', async () => {
    const { run } = await import('./bin.js');
    const { main } = await import('./cli.js');

    await run(['--variant=with-beads', '--scope=project', '--prefix=my-']);

    expect(main).toHaveBeenCalledWith({
      variant: 'with-beads',
      scope: 'project',
      prefix: 'my-'
    });
  });
});
