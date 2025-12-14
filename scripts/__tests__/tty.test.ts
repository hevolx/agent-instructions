import { describe, it, expect, afterEach } from "vitest";
import { isInteractiveTTY } from "../tty.js";

describe("isInteractiveTTY", () => {
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    // Restore original value
    Object.defineProperty(process.stdout, "isTTY", {
      value: originalIsTTY,
      writable: true,
    });
  });

  it("should return true when stdout is a TTY", () => {
    Object.defineProperty(process.stdout, "isTTY", {
      value: true,
      writable: true,
    });
    expect(isInteractiveTTY()).toBe(true);
  });

  it("should return false when stdout is not a TTY", () => {
    Object.defineProperty(process.stdout, "isTTY", {
      value: false,
      writable: true,
    });
    expect(isInteractiveTTY()).toBe(false);
  });

  it("should return false when stdout.isTTY is undefined", () => {
    Object.defineProperty(process.stdout, "isTTY", {
      value: undefined,
      writable: true,
    });
    expect(isInteractiveTTY()).toBe(false);
  });
});
