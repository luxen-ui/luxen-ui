// https://vitejs.dev/config/
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import { extname, relative, resolve as pathResolve, dirname } from 'path'
import dts from 'vite-plugin-dts'
import { globSync } from 'tinyglobby'
// import pkg from './package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    dts(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'cdn',
    rollupOptions: {
      input: Object.fromEntries(
        globSync('src/**/*.ts', { cwd: __dirname, absolute: false }).map((file) => [
          // The name of the entry point
          // src/components/foo/foo.ts becomes components/foo/foo
          relative('src', file.slice(0, file.length - extname(file).length)),
          // The absolute path to the entry file
          pathResolve(__dirname, file),
        ])
      ),
      // https://rollupjs.org/configuration-options/#treeshake
      treeshake: 'recommended',
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
}) satisfies UserConfig
