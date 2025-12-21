import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../generate-readme.js", () => ({
  generateCommandsMetadata: vi.fn(),
}));

describe("getCommandsGroupedByCategory", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should return commands grouped by category from metadata file", async () => {
    const { generateCommandsMetadata } = await import("../generate-readme.js");
    const mockMetadata = {
      "red.md": {
        description: "Red phase",
        category: "Test-Driven Development",
        order: 2,
      },
      "green.md": {
        description: "Green phase",
        category: "Test-Driven Development",
        order: 3,
      },
      "commit.md": {
        description: "Create commit",
        category: "Workflow",
        order: 1,
      },
    };
    vi.mocked(generateCommandsMetadata).mockReturnValue(mockMetadata);

    const { getCommandsGroupedByCategory } =
      await import("../cli-generator.js");
    const result = await getCommandsGroupedByCategory();

    expect(result).toEqual({
      "Test-Driven Development": [
        { value: "red.md", label: "red.md", selectedByDefault: true },
        { value: "green.md", label: "green.md", selectedByDefault: true },
      ],
      Workflow: [
        { value: "commit.md", label: "commit.md", selectedByDefault: true },
      ],
    });
  });
});
