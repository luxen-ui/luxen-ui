/*
 * cem-plugin: css-class
 *
 * The "CSS classes" reference section lists the consumer-facing classes an
 * element exposes — the base class plus any modifier/part classes. CEM has no
 * concept for this, so we capture it with a custom `@cssClass` JSDoc tag on the
 * element class (native sidecar or light-DOM custom element):
 *
 *   @cssClass .l-button - Base button style
 *   @cssClass .l-story-thumb - Thumbnail wrapper inside a story
 *
 * Output: declaration.cssClasses = [{ name, description }]
 *
 * Stashes during analyzePhase, applies during packageLinkPhase (see
 * native-meta.js for why direct analyzePhase mutations aren't reliable).
 */
const stash = new Map(); // key: `${modulePath}#${className}` → cssClasses[]

function tagComment(tag) {
  return typeof tag.comment === 'string'
    ? tag.comment
    : (tag.comment ?? []).map((c) => c.text).join('');
}

function parseCssClass(raw) {
  const text = String(raw).trim();
  const m = text.match(/^(\S+)\s*-?\s*(.*)$/s);
  if (!m) return null;
  return { name: m[1], description: m[2].trim() };
}

export function cssClassPlugin() {
  return {
    name: 'luxen-css-class',
    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const cssClasses = [];
      for (const doc of node.jsDoc ?? []) {
        for (const tag of doc.tags ?? []) {
          if (tag.tagName?.getText() !== 'cssClass') continue;
          const c = parseCssClass(tagComment(tag));
          if (c) cssClasses.push(c);
        }
      }
      if (cssClasses.length) stash.set(`${moduleDoc.path}#${node.name.getText()}`, cssClasses);
    },
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        for (const decl of mod.declarations ?? []) {
          const cssClasses = stash.get(`${mod.path}#${decl.name}`);
          if (cssClasses) decl._cssClasses = cssClasses;
        }
      }
    },
  };
}
