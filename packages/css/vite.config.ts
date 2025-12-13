import type { UserConfig } from 'vite'
import { extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'tinyglobby'
import { defineConfig } from 'vite'

export default defineConfig({
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
    rollupOptions: {
      input: Object.fromEntries(
        globSync('./src/**/[^_]*.css').map((file) => [
          // { 'components/button': '/code/luxen/packages/css/src/components/button.css' }
          relative('src', file.slice(0, file.length - extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url)),
        ])
      ),
      output: {
        assetFileNames: '[name].[ext]',
      },
    },
  },
}) satisfies UserConfig
