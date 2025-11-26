import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';

vi.mock('fs-extra', () => ({
  default: {
    copy: vi.fn(),
    ensureDir: vi.fn(),
    readdir: vi.fn().mockResolvedValue(['file1.md', 'file2.md'])
  }
}));

import { generateToDirectory, VARIANTS, SCOPES } from './cli-generator.js';

describe('CLI Generator', () => {
  const MOCK_OUTPUT_PATH = '/mock/output/path';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToDirectory', () => {
    it('should generate command files to specified directory', async () => {
      const result = await generateToDirectory(MOCK_OUTPUT_PATH);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);
    });

    it('should accept variant parameter and use it for generation', async () => {
      const result = await generateToDirectory(MOCK_OUTPUT_PATH, VARIANTS.WITH_BEADS);

      expect(result.success).toBe(true);
      expect(result.variant).toBe(VARIANTS.WITH_BEADS);
    });

    it('should copy files from source to output directory', async () => {
      await generateToDirectory(MOCK_OUTPUT_PATH, VARIANTS.WITH_BEADS);

      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('downloads/with-beads'),
        MOCK_OUTPUT_PATH,
        expect.any(Object)
      );
    });

    it('should accept scope parameter and use project-level path', async () => {
      await generateToDirectory(undefined, VARIANTS.WITH_BEADS, SCOPES.PROJECT);

      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('downloads/with-beads'),
        expect.stringContaining('.claude/commands'),
        expect.any(Object)
      );
    });

    it('should use user-level path when scope is user', async () => {
      await generateToDirectory(undefined, VARIANTS.WITH_BEADS, SCOPES.USER);

      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('downloads/with-beads'),
        expect.stringContaining('.claude/commands'),
        expect.any(Object)
      );
    });

    it('should return actual count of files copied', async () => {
      const mockFiles = ['red.md', 'green.md', 'refactor.md', 'cycle.md', 'commit.md'];
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);

      const result = await generateToDirectory(MOCK_OUTPUT_PATH, VARIANTS.WITH_BEADS);

      expect(result.filesGenerated).toBe(5);
    });
  });

});
