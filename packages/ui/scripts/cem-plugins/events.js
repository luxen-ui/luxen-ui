/*
 * cem-plugin: events
 *
 * The analyzer mangles `@event` tags when a class has multiple of them AND also
 * dispatches via `this.emit(...)` / `dispatchEvent(...)`: it keeps the first
 * event's name+description and reduces the rest to `{ type: CustomEvent }`
 * (name and description dropped). We re-parse the `@event name - description`
 * tags from the class JSDoc ourselves and OVERWRITE decl.events so the result
 * is deterministic and complete.
 *
 *   @event show - Fired when the dialog opens. Not cancelable.
 *   @event hide - Fired when about to close. Cancelable — call preventDefault().
 *
 * Output: declaration.events = [{ name, description, cancelable }]
 * `cancelable` is inferred from the prose: true when "cancelable" appears, unless
 * negated ("not cancelable" / "non-cancelable"). The dispatch site is the real
 * source of truth, but parsing emit({cancelable:true}) per event is brittle; the
 * prose convention (already written for humans) is reliable enough here.
 *
 * Stash in analyzePhase, apply in packageLinkPhase (see native-meta.js for why).
 */
const stash = new Map(); // key: `${modulePath}#${className}` → events[]

function tagComment(tag) {
  return typeof tag.comment === 'string'
    ? tag.comment
    : (tag.comment ?? []).map((c) => c.text).join('');
}

function parseEvent(raw) {
  const text = String(raw).trim();
  const m = text.match(/^(\S+)\s*-?\s*(.*)$/s);
  if (!m) return null;
  const name = m[1];
  const description = m[2].trim();
  const negated = /\b(not|non)[\s-]+cancelable\b/i.test(description);
  const cancelable = !negated && /\bcancelable\b/i.test(description);
  return { name, description, cancelable };
}

export function eventsPlugin() {
  return {
    name: 'luxen-events',
    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const events = [];
      for (const doc of node.jsDoc ?? []) {
        for (const tag of doc.tags ?? []) {
          if (tag.tagName?.getText() !== 'event') continue;
          const ev = parseEvent(tagComment(tag));
          if (ev) events.push(ev);
        }
      }
      if (events.length) stash.set(`${moduleDoc.path}#${node.name.getText()}`, events);
    },
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        for (const decl of mod.declarations ?? []) {
          const events = stash.get(`${mod.path}#${decl.name}`);
          if (events) decl.events = events;
        }
      }
    },
  };
}
