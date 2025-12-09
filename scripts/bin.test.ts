import { describe, it, expect, vi } from "vitest";
import { parseArgs } from "./bin.js";

vi.mock("./cli.js", () => ({
  main: vi.fn().mockResolvedValue(undefined),
}));

describe("parseArgs", () => {
  it("should parse command line arguments", () => {
    const args = parseArgs([
      "--variant=with-beads",
      "--scope=project",
      "--prefix=my-",
    ]);

    expect(args).toEqual({
      variant: "with-beads",
      scope: "project",
      prefix: "my-",
    });
  });

  it("should parse --skip-template-injection flag", () => {
    const args = parseArgs(["--skip-template-injection"]);

    expect(args).toEqual({
      skipTemplateInjection: true,
    });
  });

  it("should parse --commands as comma-separated list", () => {
    const args = parseArgs(["--commands=red,green,commit"]);

    expect(args).toEqual({
      commands: ["red", "green", "commit"],
    });
  });

  it("should parse --update-existing flag", () => {
    const args = parseArgs(["--update-existing"]);

    expect(args).toEqual({
      updateExisting: true,
    });
  });

  it("should parse --overwrite flag", () => {
    const args = parseArgs(["--overwrite"]);

    expect(args).toEqual({
      overwrite: true,
    });
  });

  it("should parse --skip-on-conflict flag", () => {
    const args = parseArgs(["--skip-on-conflict"]);

    expect(args).toEqual({
      skipOnConflict: true,
    });
  });
});

describe("run", () => {
  it("should pass parsed args to main", async () => {
    const { run } = await import("./bin.js");
    const { main } = await import("./cli.js");

    await run(["--variant=with-beads", "--scope=project", "--prefix=my-"]);

    expect(main).toHaveBeenCalledWith({
      variant: "with-beads",
      scope: "project",
      prefix: "my-",
    });
  });
});
