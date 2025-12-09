import { describe, it, expect, vi } from "vitest";
import fs from "fs-extra";

vi.mock("fs-extra", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

describe("getCommandsGroupedByCategory", () => {
  it("should return commands grouped by category from metadata file", async () => {
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
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify(mockMetadata) as never,
    );

    const { getCommandsGroupedByCategory } =
      await import("../cli-generator.js");
    const result = await getCommandsGroupedByCategory("with-beads");

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

  it("should throw when a category is not in CATEGORY_ORDER", async () => {
    const mockMetadata = {
      "custom.md": {
        description: "Custom command",
        category: "Unknown Category",
        order: 1,
      },
    };
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify(mockMetadata) as never,
    );

    const { getCommandsGroupedByCategory } =
      await import("../cli-generator.js");

    await expect(getCommandsGroupedByCategory("with-beads")).rejects.toThrow(
      "Unknown Category",
    );
  });
});
