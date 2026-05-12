// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      // Prevent the TanStack Router plugin from triggering full reloads
      // when routeTree.gen.ts is auto-regenerated.
      watch: {
        // Ignore the generated file so its writes don't cause extra HMR cycles.
        ignored: ["**/routeTree.gen.ts"],
      },
    },
  },
});
