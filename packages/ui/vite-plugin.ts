import type { Plugin } from 'vite-plus';
import postcssPrefix from './postcss-plugin-prefix.js';

export interface LuxenOptions {
  /** Custom element tag name prefix. Default `'l'`. */
  elementPrefix?: string;
  /** CSS class/token/keyframe prefix. Default `'l'`. */
  cssPrefix?: string;
}

export default function luxen(options: LuxenOptions = {}): Plugin {
  const elementPrefix = options.elementPrefix || 'l';
  const cssPrefix = options.cssPrefix || 'l';

  return {
    name: 'luxen',

    config() {
      if (elementPrefix === 'l' && cssPrefix === 'l') return;
      return {
        css: {
          postcss: {
            plugins: [postcssPrefix({ elementPrefix, cssPrefix })],
          },
        },
      };
    },
  };
}
