import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';
import luxen from 'luxen-ui/vite-plugin';

export default defineNuxtConfig({
  compatibilityDate: '2026-04-17',
  ssr: true,
  devtools: { enabled: true },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('ds-'),
    },
  },

  vite: {
    plugins: [tailwindcss(), luxen({ elementPrefix: 'ds', cssPrefix: 'ds' })],
  },

  css: ['~/assets/main.css'],
});
