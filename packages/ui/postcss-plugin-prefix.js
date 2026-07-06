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
      // Canonical `--l-*` token names whose declarations we rename to the
      // custom prefix. Used to emit the bridge block below.
      const renamedTokens = new Set();

      root.walk((node) => {
        if (node.type === 'atrule') {
          if (node.name === 'keyframes' && node.params.startsWith('l-')) {
            node.params = node.params.replace(/^l-/, `${cssPrefix}-`);
          }

          // `@scope` preludes are selector lists, not part of any child rule, so
          // the `walk` over rules never sees them — the root (and optional `to`
          // limit) would stay `l-…` and match nothing under a custom prefix,
          // leaving the whole scoped block inert. Rewrite it with the same
          // selector rewriter: it handles bare tags, `:not(…)`, attribute
          // qualifiers, comma-separated roots and a `.l-` limit for free.
          if (node.name === 'scope' && node.params) {
            node.params = rewriteSelector(node.params, elementPrefix, cssPrefix);
          }
        }

        if (node.type === 'rule') {
          node.selector = rewriteSelector(node.selector, elementPrefix, cssPrefix);
        }

        if (node.type === 'decl') {
          if (node.prop.startsWith('--l-')) {
            const suffix = node.prop.slice('--l-'.length);
            renamedTokens.add(suffix);
            node.prop = `--${cssPrefix}-${suffix}`;
          }

          if (node.value.includes('l-')) {
            node.value = rewriteValue(node.value, cssPrefix);
          }
        }
      });

      emitPrefixAliases(root, cssPrefix, renamedTokens);
    },
  };
};

plugin.postcss = true;

/**
 * Bridges the canonical `--l-*` design-token namespace to the consumer's
 * custom prefix.
 *
 * Each element ships its shadow-DOM CSS baked into the element JS, built once
 * with the default `l` prefix — that CSS never passes through this plugin, so
 * it keeps reading `var(--l-focus-ring)` etc. Meanwhile the consumer's imported
 * preset now only defines `--{cssPrefix}-*`. Without a bridge the two
 * namespaces never meet and every shadow token resolves to nothing.
 *
 * So for every `--l-*` token declaration we just renamed, append a one-time
 * `:root` alias pointing the canonical name at the prefixed one:
 *
 *   :root { --l-focus-ring: var(--p-focus-ring); … }
 *
 * The block rides along with whichever imported file defines the tokens
 * (preset / tokens / aliases), stays exhaustive automatically (it mirrors
 * exactly what was renamed), and is a no-op for the default `l` build (the
 * plugin early-returns before ever reaching here).
 *
 * @param {import('postcss').Root} root
 * @param {string} cssPrefix
 * @param {Set<string>} renamedTokens — canonical names without the `--l-` head
 */
function emitPrefixAliases(root, cssPrefix, renamedTokens) {
  if (renamedTokens.size === 0) return;
  const decls = [...renamedTokens]
    .map((name) => `  --l-${name}: var(--${cssPrefix}-${name});`)
    .join('\n');
  root.append(
    `\n/* luxen-prefix: bridge canonical --l-* tokens to --${cssPrefix}-* so shadow-DOM CSS resolves. */\n:root {\n${decls}\n}\n`,
  );
}

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
