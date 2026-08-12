import DefaultTheme from 'vitepress/theme';
import './tailwind.css';
import 'iconify-icon';
import Layout from './Layout.vue';

const components = import.meta.glob('../components/**/*.vue', { eager: true });

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    Object.entries(components).forEach(([path, module]) => {
      const componentName = path
        .split('/')
        .pop()
        .replace(/\.\w+$/, '');
      app.component(componentName, module.default);
    });

    if (!import.meta.env.SSR) {
      void import('luxen-ui/avatar');
      void import('luxen-ui/badge');
      void import('luxen-ui/button-group');
      void import('luxen-ui/carousel');
      void import('luxen-ui/combobox');
      void import('luxen-ui/carousel-item');
      void import('luxen-ui/skeleton');
      void import('luxen-ui/slider');
      void import('luxen-ui/spinner');
      void import('luxen-ui/sticky-bar');
      void import('luxen-ui/stories');
      void import('luxen-ui/story');
      void import('luxen-ui/stories-viewer');
      void import('luxen-ui/popover');
      void import('luxen-ui/tooltip');
      void import('luxen-ui/input-group');
      void import('luxen-ui/input-otp');
      void import('luxen-ui/input-stepper');
      void import('luxen-ui/divider');
      void import('luxen-ui/icon');
      void import('luxen-ui/rating');
      void import('luxen-ui/alert');
      void import('luxen-ui/alert-dialog');
      void import('luxen-ui/dialog');
      void import('luxen-ui/drawer');
      void import('luxen-ui/dropdown');
      void import('luxen-ui/dropdown-item');
      void import('luxen-ui/dropdown-label');
      void import('luxen-ui/tabs');
      void import('luxen-ui/tag');
      void import('luxen-ui/segmented-control');
      void import('luxen-ui/color-scheme-icon');
      void import('luxen-ui/select');
      void import('luxen-ui/form-field');
      void import('luxen-ui/tree');
      void import('luxen-ui/tree-item');
      void import('luxen-ui/prose-editor');

      void import('luxen-ui/toast').then(({ toast }) => {
        window.toast = toast;
      });

      // Exposed so the color-scheme-icon examples drive the real store from inline
      // handlers. `storageKey: ''` keeps the demos session-only, so browsing
      // the docs never writes a color-scheme override into a visitor's browser.
      void import('luxen-ui/color-scheme').then(({ colorScheme }) => {
        colorScheme.configure({ storageKey: '' });
        window.colorScheme = colorScheme;

        // Docs-only shim. An inline `onclick` can toggle but cannot subscribe,
        // so an example's `aria-pressed` / `checked` would start stale whenever
        // a visitor's OS is already dark. Real applications do this with
        // `colorScheme.subscribe` — see the snippets on the color-scheme-icon page.
        // Every write is guarded on the current value: `setAttribute` with an
        // unchanged value still produces a mutation record, which would feed the
        // observer below back into itself.
        const syncDemos = () => {
          const scheme = colorScheme.current;
          const dark = scheme === 'dark';
          for (const el of document.querySelectorAll('button[aria-pressed][aria-label]')) {
            if (!el.querySelector('l-color-scheme-icon')) continue;
            if (el.getAttribute('aria-pressed') !== String(dark)) {
              el.setAttribute('aria-pressed', String(dark));
            }
          }
          for (const el of document.querySelectorAll('l-dropdown-item[value="theme"]')) {
            if (el.checked !== dark) el.checked = dark;
          }
          for (const el of document.querySelectorAll('[data-color-scheme-readout]')) {
            if (el.textContent !== scheme) el.textContent = scheme;
          }
        };

        // The examples carry no inline handlers on purpose: they are inlined
        // verbatim into the generated agent skill, so they must be markup a
        // consumer can copy as-is. The interaction lives here instead, delegated
        // so it survives VitePress navigation.
        document.addEventListener('click', (event) => {
          const button = event.target.closest?.('button[aria-pressed][aria-label]');
          if (button?.querySelector('l-color-scheme-icon')) colorScheme.toggle();
        });
        document.addEventListener('select', (event) => {
          const item = event.item;
          if (item?.value === 'theme') colorScheme.set(item.checked ? 'dark' : 'light');
        });

        colorScheme.subscribe(syncDemos);
        // The first subscribe lands before any page has rendered, and VitePress
        // swaps content on client-side navigation — so watch the DOM rather than
        // guess when a demo exists.
        new MutationObserver(syncDemos).observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    }
  },
};
