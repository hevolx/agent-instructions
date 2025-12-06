import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      include: ["scripts/**/*.ts"],
      exclude: [
        "scripts/**/*.test.ts",
        "scripts/__tests__/**",
        "scripts/*.d.ts",
        "scripts/build.ts", // Build entry point - output tested via snapshots
      ],
    },
  },
});
