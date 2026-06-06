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
      void import('luxen-ui/carousel-item');
      void import('luxen-ui/skeleton');
      void import('luxen-ui/spinner');
      void import('luxen-ui/sticky-bar');
      void import('luxen-ui/stories');
      void import('luxen-ui/story');
      void import('luxen-ui/stories-viewer');
      void import('luxen-ui/popover');
      void import('luxen-ui/tooltip');
      void import('luxen-ui/input-otp');
      void import('luxen-ui/input-stepper');
      void import('luxen-ui/divider');
      void import('luxen-ui/icon');
      void import('luxen-ui/rating');
      void import('luxen-ui/dialog');
      void import('luxen-ui/drawer');
      void import('luxen-ui/dropdown');
      void import('luxen-ui/dropdown-item');
      void import('luxen-ui/dropdown-label');
      void import('luxen-ui/tabs');
      void import('luxen-ui/form-field');
      void import('luxen-ui/tree');
      void import('luxen-ui/tree-item');
      void import('luxen-ui/prose-editor');

      void import('luxen-ui/toast').then(({ toast }) => {
        window.toast = toast;
      });
    }
  },
};
