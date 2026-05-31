/*
 * cem-plugin: jsdoc-example
 *
 * The analyzer records `@example` JSDoc tags as raw text but doesn't structure
 * them. This plugin promotes each `@example` on a custom-element class to a
 * structured entry on the declaration:
 *
 *   declaration.examples = [{ title, language, code }]
 *
 * Title is the optional first line after `@example` when it isn't code; the
 * language is inferred from the snippet (html by default, css for `@import` /
 * selector blocks, js for `import`/`const`).
 *
 * Mirrors the approach used by cobalt's cem-plugin-jsdoc-example.
 */
function inferLanguage(code) {
  const head = code.trimStart();
  if (/^(<template|<[a-z])/i.test(head)) return 'html';
  if (/^(import\s|const\s|let\s|function\s|document\.)/.test(head)) return 'js';
  if (/^(@import|@layer|[.#a-z][\w-]*\s*\{)/i.test(head)) return 'css';
  return 'html';
}

function parseExample(raw) {
  // `@example` payload may start with a title line, then a fenced or bare body.
  let text = String(raw).trim();
  let title;

  // Strip a leading markdown code fence if present (```html ... ```).
  const fenced = text.match(/^```(\w+)?\n([\s\S]*?)```$/);
  if (fenced) {
    return {
      title: undefined,
      language: fenced[1] || inferLanguage(fenced[2]),
      code: fenced[2].trim(),
    };
  }

  // Otherwise: an optional non-code title line, then the code.
  const lines = text.split('\n');
  if (lines.length > 1 && !/^[<@.#]|^(import|const|let)\b/.test(lines[0].trim())) {
    title = lines[0].trim();
    text = lines.slice(1).join('\n').trim();
  }
  return { title, language: inferLanguage(text), code: text };
}

export function jsdocExamplePlugin() {
  return {
    name: 'luxen-jsdoc-example',
    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const className = node.name.getText();
      const decl = moduleDoc.declarations?.find((d) => d.name === className);
      if (!decl) return;

      const jsDocs = node.jsDoc ?? [];
      const examples = [];
      for (const doc of jsDocs) {
        for (const tag of doc.tags ?? []) {
          if (tag.tagName?.getText() !== 'example') continue;
          const comment =
            typeof tag.comment === 'string'
              ? tag.comment
              : (tag.comment ?? []).map((c) => c.text).join('');
          if (comment.trim()) examples.push(parseExample(comment));
        }
      }
      if (examples.length) decl.examples = examples;
    },
  };
}
