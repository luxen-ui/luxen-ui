// vite.config.cdn-standalone.ts — produces cdn/standalone.js, a single
// self-contained ESM bundle that registers every mockup-eligible element.
// One <script type="module"> in a standalone HTML mockup is enough to make
// every <l-*> (or rebranded <pulse-*>) tag a real custom element.
//
// The companion CSS file is built by scripts/build-standalone.mjs (concat).
// The entry consumed here is auto-generated at src/_generated/.

import type { UserConfig } from 'vite-plus';
import { defineConfig } from 'vite-plus';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/html', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'cdn',
    emptyOutDir: false, // keep the code-split cdn/ output produced by vite.config.ts
    // Don't minify: the CLI substitutes prefix literals at consumer-run time
    // and needs predictable patterns (`_elementPrefix = 'l'` etc.). Minified
    // output would collapse them into one-letter identifiers.
    minify: false,
    lib: {
      entry: fileURLToPath(new URL('./src/_generated/cdn-standalone-entry.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'standalone.js',
    },
    rolldownOptions: {
      // Side-effect imports (`import './elements/foo/index'`) register custom
      // elements with the global registry — they must NOT be tree-shaken,
      // otherwise the bundle ends up containing only re-exports.
      treeshake: false,
      output: {
        // Single output file, no chunk graph.
        inlineDynamicImports: true,
      },
    },
  },
}) satisfies UserConfig;
