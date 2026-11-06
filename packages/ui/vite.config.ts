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
        globSync('src/html/**/*.ts', { cwd: __dirname, absolute: false }).map((file) => [
          // The name of the entry point
          // src/html/elements/foo/foo.ts becomes elements/foo/foo
          relative('src/html', file.slice(0, file.length - extname(file).length)),
          // The absolute path to the entry file
          pathResolve(__dirname, file),
        ]),
      ),
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
