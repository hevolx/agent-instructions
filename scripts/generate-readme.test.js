import { describe, it, expect } from 'vitest';
import {
  parseFrontmatter,
  categorizeCommand,
  generateCommandsMarkdown,
  CATEGORIES
} from './generate-readme.js';

describe('parseFrontmatter', () => {
  it('should parse frontmatter from markdown', () => {
    const content = `---
description: Test command
argument-hint: <test>
---

# Content here`;

    const result = parseFrontmatter(content);

    expect(result).toMatchSnapshot();
  });

  it('should return empty object when no frontmatter', () => {
    const content = '# Just content';
    const result = parseFrontmatter(content);

    expect(result).toEqual({});
  });

  it('should handle multiline frontmatter values', () => {
    const content = `---
description: Execute TDD Red Phase - write ONE failing test
argument-hint: <test description or feature requirement>
---`;

    const result = parseFrontmatter(content);
    expect(result.description).toBe('Execute TDD Red Phase - write ONE failing test');
  });
});

describe('categorizeCommand', () => {
  it('should categorize TDD workflow commands', () => {
    expect(categorizeCommand('red.md')).toBe('TDD Workflow');
    expect(categorizeCommand('green.md')).toBe('TDD Workflow');
    expect(categorizeCommand('refactor.md')).toBe('TDD Workflow');
    expect(categorizeCommand('cycle.md')).toBe('TDD Workflow');
    expect(categorizeCommand('spike.md')).toBe('TDD Workflow');
    expect(categorizeCommand('issue.md')).toBe('TDD Workflow');
  });

  it('should categorize workflow commands', () => {
    expect(categorizeCommand('commit.md')).toBe('Workflow');
    expect(categorizeCommand('pr.md')).toBe('Workflow');
  });

  it('should categorize worktree commands', () => {
    expect(categorizeCommand('worktree-add.md')).toBe('Worktree Management');
    expect(categorizeCommand('worktree-cleanup.md')).toBe('Worktree Management');
  });

  it('should categorize unknown commands as Utilities', () => {
    expect(categorizeCommand('unknown.md')).toBe(CATEGORIES.UTILITIES);
    expect(categorizeCommand('add-command.md')).toBe(CATEGORIES.UTILITIES);
  });
});

describe('generateCommandsMarkdown', () => {
  it('should generate markdown for single category', () => {
    const commands = [
      { name: 'red', description: 'Write failing test', category: 'TDD Workflow' },
      { name: 'green', description: 'Make test pass', category: 'TDD Workflow' }
    ];

    const result = generateCommandsMarkdown(commands);
    expect(result).toMatchSnapshot();
  });

  it('should generate markdown for multiple categories', () => {
    const commands = [
      { name: 'red', description: 'Write failing test', category: 'TDD Workflow' },
      { name: 'commit', description: 'Create commit', category: 'Workflow' },
      { name: 'worktree-add', description: 'Add worktree', category: 'Worktree Management' }
    ];

    const result = generateCommandsMarkdown(commands);
    expect(result).toMatchSnapshot();
  });

  it('should sort commands alphabetically within category', () => {
    const commands = [
      { name: 'spike', description: 'Spike phase', category: 'TDD Workflow' },
      { name: 'cycle', description: 'Full cycle', category: 'TDD Workflow' },
      { name: 'green', description: 'Make test pass', category: 'TDD Workflow' },
      { name: 'red', description: 'Write failing test', category: 'TDD Workflow' }
    ];

    const result = generateCommandsMarkdown(commands);
    expect(result).toMatchSnapshot();
  });

  it('should maintain category order', () => {
    const commands = [
      { name: 'add-command', description: 'Add new command', category: 'Utilities' },
      { name: 'red', description: 'Write failing test', category: 'TDD Workflow' },
      { name: 'worktree-add', description: 'Add worktree', category: 'Worktree Management' },
      { name: 'commit', description: 'Create commit', category: 'Workflow' }
    ];

    const result = generateCommandsMarkdown(commands);

    // TDD Workflow should come first, then Workflow, then Worktree Management, then Utilities
    expect(result).toMatchSnapshot();
  });

  it('should handle empty commands array', () => {
    const result = generateCommandsMarkdown([]);
    expect(result).toBe('');
  });
});
