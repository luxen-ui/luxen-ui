import { defineConfig } from 'vitepress';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  title: 'Luxen UI',
  description: 'Documentation for Luxen UI',
  // https://vitepress.dev/reference/site-config#vite
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  themeConfig: {
    siteTitle: false,
    logo: '/luxen.png',
    nav: [
      { text: 'Home', link: '/' },
    ],
    sidebar: [
      {
        text: 'Elements',
        items: [
          { text: 'Badge', link: '/elements/badge' }
        ]
      }
    ]
  },

  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
        crossorigin: '',
      },
    ],
  ],
});
