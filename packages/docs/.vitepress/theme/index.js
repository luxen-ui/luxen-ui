import DefaultTheme from 'vitepress/theme';
import './tailwind.css';

// Auto-import all components from .vitepress/components
const components = import.meta.glob('../components/*.vue', { eager: true });

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register all components globally
    Object.entries(components).forEach(([path, module]) => {
      const componentName = path.split('/').pop().replace(/\.\w+$/, '');
      app.component(componentName, module.default);
    });
  }
};
