import { defineConfig } from 'vitepress';
import tailwindcss from '@tailwindcss/vite';

function el(name, tag, link) {
  const isCustom = tag.startsWith('l-');
  const cls = isCustom ? 'sidebar-tag--custom' : 'sidebar-tag--native';
  return {
    text: `${name} <span class="sidebar-tag ${cls}">&lt;${tag}&gt;</span>`,
    link: `/elements/${link}`,
  };
}

export default defineConfig({
  title: 'Luxen UI',
  description: 'An HTML & CSS-first UI library built with modern CSS and HTML custom elements',

  vite: {
    plugins: [tailwindcss()],
    // Pin a non-default port to avoid collisions with sibling Vite projects.
    // When IPv4 is taken, Vite silently falls back to IPv6-only and Firefox
    // happy-eyeballs hits the half-bound socket → NS_ERROR_NET_RESET.
    server: {
      host: '127.0.0.1',
      port: 5273,
      strictPort: true,
    },
    build: {
      assetsInlineLimit: 0,
    },
  },

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('l-'),
      },
    },
  },

  // https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts#L50
  markdown: {
    theme: 'github-dark',
    defaultHighlightLang: 'html',

    async shikiSetup(highlighter) {
      await highlighter.loadTheme('dark-plus');
      highlighter.setTheme('dark-plus');
    },
  },

  themeConfig: {
    siteTitle: false,

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/luxen-ui/luxen-ui' }],

    nav: [
      {
        text: 'Getting started',
        link: '/overview/getting-started',
        activeMatch: '/overview/',
      },
      {
        text: 'Components',
        link: '/elements/badge',
        activeMatch: '/elements/',
      },
    ],

    sidebar: [
      {
        text: 'Getting started',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/overview/introduction' },
          { text: 'Quick start', link: '/overview/getting-started' },
          {
            text: 'Customizing the <span class="sidebar-tag sidebar-tag--custom" style="display:inline;margin:0">l-</span> prefix',
            link: '/overview/customizing-prefix',
          },
        ],
      },
      {
        text: 'Elements',
        collapsed: false,
        items: [
          el('Avatar', 'l-avatar', 'avatar'),
          el('Badge', 'l-badge', 'badge'),
          el('Carousel', 'l-carousel', 'carousel'),
          el('Button', 'button', 'button'),
          el('Close button', 'button', 'close-button'),
          el('Dialog', 'l-dialog', 'dialog'),
          el('Divider', 'l-divider', 'divider'),
          el('Disclosure', 'details', 'disclosure'),
          el('Dropdown', 'l-dropdown', 'dropdown'),
          el('Drawer', 'l-drawer', 'drawer'),
          el('Icon', 'l-icon', 'icon'),
          el('Input OTP', 'l-input-otp', 'input-otp'),
          el('Input stepper', 'l-input-stepper', 'input-stepper'),
          el('Kbd', 'kbd', 'kbd'),
          el('Select', 'select', 'select'),
          el('Popover', 'l-popover', 'popover'),
          el('Progress', 'progress', 'progress'),
          el('Rating', 'l-rating', 'rating'),
          el('Skeleton', 'l-skeleton', 'skeleton'),
          el('Spinner', 'l-spinner', 'spinner'),
          el('Tabs', 'l-tabs', 'tabs'),
          el('Toast', 'l-toast', 'toast'),
          el('Tooltip', 'l-tooltip', 'tooltip'),
          {
            ...el('Tree', 'l-tree', 'tree'),
            collapsed: true,
            items: [el('Tree item', 'l-tree-item', 'tree-item')],
          },
        ],
      },
      {
        text: 'AI ✧',
        collapsed: false,
        items: [
          { text: 'Agent Skills', link: '/resources/agent-skills' },
          { text: 'Claude Design', link: '/resources/claude-design' },
        ],
      },
      {
        text: 'Resources',
        collapsed: false,
        items: [{ text: 'Changelog', link: '/resources/changelog' }],
      },
    ],
  },

  head: [
    ['link', { rel: 'icon', href: '/logos/luxen.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Sora:wght@400;500;600;700&display=swap',
        crossorigin: '',
      },
    ],
  ],
});
