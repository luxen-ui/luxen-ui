// https://vitejs.dev/config/
import type { PluginOption } from 'vite-plus';
import { defineConfig } from 'vite-plus';
import { fileURLToPath, URL } from 'url';
import { extname, relative, resolve as pathResolve, dirname } from 'path';
import dts from 'vite-plugin-dts';
import { globSync } from 'tinyglobby';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // vite-plugin-dts types its plugin against upstream `vite`, which tsgolint
  // (typescript-go) can't reconcile with vite-plus's rolldown-based
  // `PluginOption` — the mismatch makes `defineConfig`'s overload blow the type
  // comparison depth. The cast bridges the two equivalent plugin shapes.
  plugins: [dts({ tsconfigPath: 'tsconfig.build.json' }) as PluginOption],
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
