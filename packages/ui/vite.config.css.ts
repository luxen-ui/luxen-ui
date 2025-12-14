import type { UserConfig } from 'vite-plus';
import { extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'tinyglobby';
import { defineConfig } from 'vite-plus';
import luxen from './vite-plugin';

export default defineConfig({
  plugins: [
    luxen({
      elementPrefix: process.env.LUXEN_ELEMENT_PREFIX || 'l',
      cssPrefix: process.env.LUXEN_CSS_PREFIX || 'l',
    }),
  ],

  css: {
    // https://vitejs.dev/guide/features#lightning-css
    // transformer: 'lightningcss',
    transformer: 'postcss',
  },

  build: {
    // https://vitejs.dev/guide/build.html#rebuild-on-files-changes
    watch: process.env.WATCH === 'true' ? {} : null,
    cssCodeSplit: true,
    cssMinify: false, // 'lightningcss'
    emptyOutDir: process.env.DEV !== 'true',
    outDir: 'dist/css',
    rolldownOptions: {
      input: Object.fromEntries(
        globSync('./src/css/**/[^_]*.css').map((file) => [
          // { 'elements/button': '/code/luxen/packages/ui/src/css/elements/button.css' }
          relative('src/css', file.slice(0, file.length - extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url)),
        ]),
      ),
      output: {
        assetFileNames: '[name].[ext]',
      },
    },
  },
}) satisfies UserConfig;
