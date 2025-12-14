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
      import('luxen-ui/avatar');
      import('luxen-ui/badge');
      import('luxen-ui/carousel');
      import('luxen-ui/carousel-item');
      import('luxen-ui/skeleton');
      import('luxen-ui/spinner');
      import('luxen-ui/popover');
      import('luxen-ui/tooltip');
      import('luxen-ui/input-otp');
      import('luxen-ui/input-stepper');
      import('luxen-ui/divider');
      import('luxen-ui/icon');
      import('luxen-ui/rating');
      import('luxen-ui/dialog');
      import('luxen-ui/drawer');
      import('luxen-ui/dropdown');
      import('luxen-ui/dropdown-item');
      import('luxen-ui/tabs');
      import('luxen-ui/tree');
      import('luxen-ui/tree-item');

      import('luxen-ui/toast').then(({ toast }) => {
        window.toast = toast;
      });
    }
  },
};
