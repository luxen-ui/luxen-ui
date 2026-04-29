// CDN CSS build — produces runtime-ready CSS where @theme blocks are resolved
// by Tailwind v4 into :root { --l-* } declarations. dist/css/ stays source-CSS
// (consumed by bundlers running their own Tailwind); cdn/styles/ is what
// browsers load directly.
import type { UserConfig } from 'vite-plus';
import { extname, relative, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { globSync } from 'tinyglobby';
import { defineConfig } from 'vite-plus';
import luxen from './vite-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Per-element CSS files (glob excludes _-prefixed entries). These don't have
// @theme blocks, but they still pass through tailwindcss() — harmless for
// plain CSS.
const elementEntries = Object.fromEntries(
  globSync('./src/css/**/[^_]*.css').map((file) => [
    relative('src/css', file.slice(0, file.length - extname(file).length)),
    fileURLToPath(new URL(file, import.meta.url)),
  ]),
);

// Override the `index` entry to use the Tailwind-opted-in wrapper, so
// @theme inside _tokens.css gets resolved.
const input = {
  ...elementEntries,
  index: pathResolve(__dirname, './src/css/_index-cdn.css'),
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    luxen({
      elementPrefix: process.env.LUXEN_ELEMENT_PREFIX || 'l',
      cssPrefix: process.env.LUXEN_CSS_PREFIX || 'l',
    }),
  ],

  css: {
    transformer: 'postcss',
  },

  build: {
    cssCodeSplit: true,
    cssMinify: false,
    emptyOutDir: process.env.DEV !== 'true',
    outDir: 'cdn/styles',
    rolldownOptions: {
      input,
      output: {
        assetFileNames: '[name].[ext]',
      },
    },
  },
}) satisfies UserConfig;
