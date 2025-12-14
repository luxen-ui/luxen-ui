/**
 * PostCSS plugin that rewrites all `l-` prefixed identifiers in CSS.
 *
 * Runs after `postcss-import` inlines all `@import`s, so imported files
 * like `_tokens.css` are also rewritten.
 *
 * Supports separate element and CSS prefixes:
 * - Element prefix: type selectors (`l-toast` → `{elementPrefix}-toast`)
 * - CSS prefix: classes, custom properties, keyframes, animation references
 *
 * @param {{ elementPrefix?: string, cssPrefix?: string }} opts
 */
const plugin = (opts = {}) => {
  const elementPrefix = opts.elementPrefix || 'l';
  const cssPrefix = opts.cssPrefix || 'l';
  if (elementPrefix === 'l' && cssPrefix === 'l') return { postcssPlugin: 'luxen-prefix' };

  return {
    postcssPlugin: 'luxen-prefix',

    Once(root) {
      root.walk((node) => {
        if (node.type === 'atrule') {
          if (node.name === 'keyframes' && node.params.startsWith('l-')) {
            node.params = node.params.replace(/^l-/, `${cssPrefix}-`);
          }
        }

        if (node.type === 'rule') {
          node.selector = rewriteSelector(node.selector, elementPrefix, cssPrefix);
        }

        if (node.type === 'decl') {
          if (node.prop.startsWith('--l-')) {
            node.prop = node.prop.replace(/^--l-/, `--${cssPrefix}-`);
          }

          if (node.value.includes('l-')) {
            node.value = rewriteValue(node.value, cssPrefix);
          }
        }
      });
    },
  };
};

plugin.postcss = true;

function rewriteSelector(selector, elementPrefix, cssPrefix) {
  let result = selector;
  result = result.replace(/\.l-/g, `.${cssPrefix}-`);
  result = result.replace(/(^|[\s,>+~(])l-/gm, `$1${elementPrefix}-`);
  return result;
}

function rewriteValue(value, cssPrefix) {
  let result = value;
  result = result.replaceAll('--l-', `--${cssPrefix}-`);
  result = result.replace(/(?<![-\w])l-/g, `${cssPrefix}-`);
  return result;
}

export default plugin;
