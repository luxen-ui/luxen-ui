// https://vitejs.dev/config/
import { defineConfig } from 'vite-plus';
import { fileURLToPath, URL } from 'url';
import { extname, relative, resolve as pathResolve, dirname } from 'path';
import { globSync } from 'tinyglobby';

const __dirname = dirname(fileURLToPath(import.meta.url));

// CDN JS only. Its `.d.ts` files are the ones `tsc -p tsconfig.build.json`
// already emits to `dist/`, mirrored into `cdn/` by scripts/copy-cdn-assets.mjs.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/html', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'cdn',
    rolldownOptions: {
      input: Object.fromEntries(
        globSync('src/html/**/*.ts', {
          cwd: __dirname,
          absolute: false,
          // Ambient declarations, and the JSDoc-only classes that carry a
          // native element's metadata: no runtime code to serve.
          ignore: ['**/*.d.ts', '**/*.meta.ts'],
        }).map((file) => [
          // The name of the entry point
          // src/html/elements/foo/foo.ts becomes elements/foo/foo
          relative('src/html', file.slice(0, file.length - extname(file).length)),
          // The absolute path to the entry file
          pathResolve(__dirname, file),
        ]),
      ),
      // Every module is an entry a page may import by URL, so keep each one's
      // exports. Without `build.lib` Vite builds an app and defaults this to
      // `false`, which drops any export no other module imports (`toast` from
      // `elements/toast/index.js`, `setPrefix` from `index.js`…).
      // `tests/cdn-entry-exports.test.ts` guards it.
      preserveEntrySignatures: 'exports-only',
      treeshake: true,
      output: {
        exports: 'named',
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'chunks/[name].js',
        entryFileNames: '[name].js',
        globals: {
          //lit: 'lit',
        },
      },
    },
  },
});
