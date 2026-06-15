import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      },
      exclude: [
        "**/.next/**",
        "**/node_modules/**",
        "**/postcss.config.mjs",
        "**/tailwind.config.ts",
        "**/eslint.config.mjs",
        "**/next-env.d.ts",
        "**/next.config.ts",
        "src/app/layout.tsx", // Next.js layout root, hard to test in vitest without next router mocks
        "src/components/QueryProvider.tsx", // Next.js layout
      ]
    },
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
