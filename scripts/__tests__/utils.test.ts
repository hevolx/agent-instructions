import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../utils.js";

describe("getErrorMessage", () => {
  it("should extract message from Error instance", () => {
    const error = new Error("test error message");
    expect(getErrorMessage(error)).toBe("test error message");
  });

  it("should convert non-Error values to string", () => {
    expect(getErrorMessage("string error")).toBe("string error");
    expect(getErrorMessage(42)).toBe("42");
    expect(getErrorMessage({ custom: "object" })).toBe("[object Object]");
    expect(getErrorMessage(null)).toBe("null");
    expect(getErrorMessage(undefined)).toBe("undefined");
  });
});
