import { describe, it, expect } from "vitest";
import { extractTemplateBlocks } from "../cli-generator.js";

describe("extractTemplateBlocks", () => {
  it("should extract template block from markdown content", () => {
    const content = `# Project Instructions

Some intro text.

<claude-commands-template>
## Project Context
This is a React app using TypeScript.
</claude-commands-template>

More content after.`;

    const result = extractTemplateBlocks(content);

    expect(result).toEqual([
      {
        content: `## Project Context
This is a React app using TypeScript.`,
      },
    ]);
  });

  it("should extract commands filter from template with commands attribute", () => {
    const content = `<claude-commands-template commands="red,green,refactor">
## Only for TDD commands
</claude-commands-template>`;

    const result = extractTemplateBlocks(content);

    expect(result).toEqual([
      {
        content: "## Only for TDD commands",
        commands: ["red", "green", "refactor"],
      },
    ]);
  });

  it("should extract multiple template blocks targeting different commands", () => {
    const content = `# Project Instructions

<claude-commands-template commands="commit">
## Commit Rules
Always use conventional commits.
</claude-commands-template>

<claude-commands-template commands="red,green">
## TDD Rules
Run tests after each change.
</claude-commands-template>`;

    const result = extractTemplateBlocks(content);

    expect(result).toEqual([
      {
        content: "## Commit Rules\nAlways use conventional commits.",
        commands: ["commit"],
      },
      {
        content: "## TDD Rules\nRun tests after each change.",
        commands: ["red", "green"],
      },
    ]);
  });

  it("should return empty array when no template blocks found", () => {
    const content = `# Project Instructions

No template blocks here, just regular markdown.

## Guidelines
- Use TypeScript
- Write tests
`;

    const result = extractTemplateBlocks(content);

    expect(result).toEqual([]);
  });
});
