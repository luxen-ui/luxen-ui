import { defineConfig } from 'vitepress';
import tailwindcss from '@tailwindcss/vite';
import { luxenCdnPlugin } from './plugins/luxen-cdn.js';

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
  titleTemplate: ':title — Luxen UI',
  description:
    'Native HTML, modern CSS, progressive custom elements. Shadow DOM only when it pays off. Rename the l- prefix to white-label your design system.',

  sitemap: {
    hostname: 'https://luxen-ui.com',
    transformItems: (items) =>
      items.filter(
        (item) =>
          !item.url.startsWith('_internal/') &&
          !item.url.endsWith('AGENTS.html') &&
          !item.url.endsWith('CLAUDE.html'),
      ),
  },

  vite: {
    plugins: [tailwindcss(), luxenCdnPlugin()],
    // Pin a non-default port to avoid collisions with sibling Vite projects.
    // When IPv4 is taken, Vite silently falls back to IPv6-only and Firefox
    // happy-eyeballs hits the half-bound socket → NS_ERROR_NET_RESET.
    server: {
      host: '127.0.0.1',
      // Override with DOCS_PORT to run multiple worktrees side by side.
      port: Number(process.env.DOCS_PORT) || 5273,
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
          { text: 'Using with Tailwind', link: '/overview/using-with-tailwind' },
          {
            text: 'Customizing the <span class="sidebar-tag sidebar-tag--custom" style="display:inline;margin:0">l-</span> prefix',
            link: '/overview/customizing-prefix',
          },
        ],
      },
      {
        text: 'Foundations',
        collapsed: false,
        items: [{ text: 'Design Tokens', link: '/overview/design-tokens' }],
      },
      {
        text: 'Elements',
        collapsed: false,
        items: [
          el('Alert', 'l-alert', 'alert'),
          el('Alert dialog', 'l-alert-dialog', 'alert-dialog'),
          el('Avatar', 'l-avatar', 'avatar'),
          el('Badge', 'l-badge', 'badge'),
          el('Breadcrumb', 'nav', 'breadcrumb'),
          el('Carousel', 'l-carousel', 'carousel'),
          el('Button', 'button', 'button'),
          el('Button group', 'l-button-group', 'button-group'),
          el('Close button', 'button', 'close-button'),
          el('Dialog', 'l-dialog', 'dialog'),
          el('Divider', 'l-divider', 'divider'),
          el('Disclosure', 'details', 'disclosure'),
          el('Dropdown', 'l-dropdown', 'dropdown'),
          el('Drawer', 'l-drawer', 'drawer'),
          el('Icon', 'l-icon', 'icon'),
          el('Kbd', 'kbd', 'kbd'),
          el('Popover', 'l-popover', 'popover'),
          el('Progress', 'progress', 'progress'),
          el('Prose editor', 'l-prose-editor', 'prose-editor'),
          el('Segmented control', 'l-segmented-control', 'segmented-control'),
          el('Skeleton', 'l-skeleton', 'skeleton'),
          el('Spinner', 'l-spinner', 'spinner'),
          el('Sticky bar', 'l-sticky-bar', 'sticky-bar'),
          {
            ...el('Stories', 'l-stories', 'stories'),
            collapsed: true,
            items: [
              el('Story', 'l-story', 'story'),
              el('Stories viewer', 'l-stories-viewer', 'stories-viewer'),
            ],
          },
          el('Tabs', 'l-tabs', 'tabs'),
          el('Tag', 'l-tag', 'tag'),
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
        text: 'Forms',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/forms/overview' },
          el('Form field', 'l-form-field', 'form-field'),
          el('Checkbox', 'input', 'checkbox'),
          el('Combobox', 'l-combobox', 'combobox'),
          el('Input', 'input', 'input'),
          el('Input OTP', 'l-input-otp', 'input-otp'),
          el('Input stepper', 'l-input-stepper', 'input-stepper'),
          el('Radio', 'input', 'radio'),
          el('Rating', 'l-rating', 'rating'),
          el('Select', 'l-select', 'select'),
          el('Slider', 'l-slider', 'slider'),
          el('Switch', 'input', 'switch'),
          el('Textarea', 'textarea', 'textarea'),
        ],
      },
      {
        text: 'AI ✧',
        collapsed: false,
        items: [{ text: 'Agent Skills', link: '/resources/agent-skills' }],
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
    ['link', { rel: 'canonical', href: 'https://luxen-ui.com/' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Luxen UI' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Luxen UI — HTML-first UI library of custom elements',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Native HTML, modern CSS, progressive custom elements. Shadow DOM only when it pays off. Rename the l- prefix to white-label your design system.',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://luxen-ui.com/' }],
    ['meta', { property: 'og:image', content: 'https://luxen-ui.com/og.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:alt', content: 'Luxen UI — HTML-first design system' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'meta',
      {
        name: 'twitter:title',
        content: 'Luxen UI — HTML-first UI library of custom elements',
      },
    ],
    [
      'meta',
      {
        name: 'twitter:description',
        content:
          'Native HTML, modern CSS, progressive custom elements. Rename the l- prefix to white-label your design system.',
      },
    ],
    ['meta', { name: 'twitter:image', content: 'https://luxen-ui.com/og.png' }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: 'Luxen UI',
        description:
          'Native HTML, modern CSS, progressive custom elements. Shadow DOM only when it pays off.',
        url: 'https://luxen-ui.com/',
        codeRepository: 'https://github.com/luxen-ui/luxen-ui',
        programmingLanguage: ['HTML', 'CSS', 'TypeScript'],
        license: 'https://github.com/luxen-ui/luxen-ui/blob/main/LICENSE',
        author: { '@type': 'Organization', name: 'Luxen UI', url: 'https://luxen-ui.com/' },
      }),
    ],
  ],
});
