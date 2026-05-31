/*
 * cem-plugin: native-meta
 *
 * Native Luxen elements (button, kbd, progress, select, close-button,
 * disclosure) are CSS-only — they have no LitElement class for the analyzer to
 * read. To give them the SAME metadata profile as custom elements, each ships a
 * sidecar `<name>.meta.ts` carrying a JSDoc-only class:
 *
 *   / **
 *    * @summary Buttons trigger actions...
 *    * @nativeElement button        // host tag → marks the declaration native
 *    * @selector .l-button          // consumer-facing selector
 *    * @attribute data-variant - primary | destructive — Visual variant
 *    * @cssproperty [--height] - Button height
 *    * /
 *   export class ButtonMeta {}
 *
 * The analyzer already parses @summary/@cssproperty/@csspart/@slot on any class.
 * This plugin adds the Luxen-specific bits:
 *   - @nativeElement  → declaration.customElement = false, _native = true
 *   - @selector       → declaration.selector
 *   - @attribute data-* → declaration._attributes (name/values/description)
 *
 * We write to `_attributes`, NOT the CEM-standard `attributes`, because for
 * a Lit custom element `attributes` holds the kebab-case forms of reactive
 * properties (title, open, …) — those are already represented as properties and
 * must not be conflated with `data-*` styling knobs. The `@attribute` tag works
 * on custom-element classes too, so any public `data-*` knob lands here
 * uniformly across native and custom elements.
 *
 * Implementation note: the analyzer finalizes declarations in a phase AFTER
 * analyzePhase, so direct mutations to a declaration during analyzePhase are not
 * reliably preserved. We STASH parsed data in analyzePhase (where the TS node +
 * JSDoc are available) and APPLY it in packageLinkPhase (which operates on the
 * final manifest). filterPrivatePlugin runs after this one, so it sees the
 * applied fields.
 */
const stash = new Map(); // key: `${modulePath}#${className}` → { tag, selector, attributes }

function tagComment(tag) {
  return typeof tag.comment === 'string'
    ? tag.comment
    : (tag.comment ?? []).map((c) => c.text).join('');
}

// "data-variant - primary | destructive — Visual variant"
// → { name, values?, description }
function parseAttribute(raw) {
  const text = String(raw).trim();
  const m = text.match(/^(\S+)\s*-?\s*(.*)$/s);
  if (!m) return null;
  const name = m[1];
  const rest = m[2].trim();

  // Optional "values — description": an em dash separates enumerated values
  // (pipe-delimited) from the prose. Otherwise the whole rest is description.
  let values;
  let description = rest;
  const dash = rest.indexOf('—'); // em dash
  if (dash !== -1) {
    const left = rest.slice(0, dash).trim();
    if (left.includes('|')) {
      values = left
        .split('|')
        .map((v) => v.trim())
        .filter(Boolean);
      description = rest.slice(dash + 1).trim();
    }
  }
  return { name, ...(values ? { values } : {}), description };
}

export function nativeMetaPlugin() {
  return {
    name: 'luxen-native-meta',
    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;

      let isNative = false;
      let selector;
      let nativeTag;
      const attributes = [];

      for (const doc of node.jsDoc ?? []) {
        for (const tag of doc.tags ?? []) {
          const name = tag.tagName?.getText();
          if (name === 'nativeElement') {
            isNative = true;
            nativeTag = tagComment(tag).trim() || undefined;
          } else if (name === 'selector') {
            selector = tagComment(tag).trim() || undefined;
          } else if (name === 'attribute' || name === 'attr') {
            const attr = parseAttribute(tagComment(tag));
            if (attr) attributes.push(attr);
          }
        }
      }

      // Stash when there's anything to apply: a native marker, a selector
      // override, or one or more `data-*` attributes (which custom elements may
      // also declare).
      if (!isNative && !selector && attributes.length === 0) return;
      stash.set(`${moduleDoc.path}#${node.name.getText()}`, {
        isNative,
        tag: nativeTag,
        selector,
        attributes,
      });
    },
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        for (const decl of mod.declarations ?? []) {
          const data = stash.get(`${mod.path}#${decl.name}`);
          if (!data) continue;
          if (data.isNative) {
            decl.customElement = false;
            decl._native = true;
            if (data.tag) decl._nativeTag = data.tag;
          }
          if (data.selector) decl.selector = data.selector;
          if (data.attributes.length) decl._attributes = data.attributes;
        }
      }
    },
  };
}
