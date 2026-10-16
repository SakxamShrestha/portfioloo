import { defineConfig } from "vitest/config";

/**
 * Unit tests cover the pure engine modules only: capability selection,
 * manifest validation, shader-material helpers and audio maths.
 *
 * The WebGL and Web Audio surfaces are deliberately out of scope here --
 * meaningfully testing them needs a real GPU and audio device, so they are
 * verified by running the route, not by mocking the browser into pretending.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/app/v2/lib/__tests__/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["src/app/v2/lib/**/*.js"],
      exclude: ["src/app/v2/lib/__tests__/**", "src/app/v2/lib/loadScene.js"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
