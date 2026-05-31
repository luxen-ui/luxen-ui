/*
 * cem-plugin: command
 *
 * Luxen elements (dialog, drawer) are driven by the Invoker Commands API with
 * custom commands like `--show` / `--hide`. These aren't a standard CEM concept,
 * so we capture them with a custom `@command` JSDoc tag on the element class:
 *
 *   @command --show - Sets `open = true`
 *   @command --hide - Sets `open = false`
 *
 * Output: declaration.commands = [{ name, description }]
 */
function parseCommand(raw) {
  const text = String(raw).trim();
  // `--show - description` or `--show description`
  const m = text.match(/^(\S+)\s*-?\s*(.*)$/s);
  if (!m) return null;
  return { name: m[1], description: m[2].trim() };
}

export function commandPlugin() {
  return {
    name: 'luxen-command',
    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const decl = moduleDoc.declarations?.find((d) => d.name === node.name.getText());
      if (!decl) return;

      const commands = [];
      for (const doc of node.jsDoc ?? []) {
        for (const tag of doc.tags ?? []) {
          if (tag.tagName?.getText() !== 'command') continue;
          const comment =
            typeof tag.comment === 'string'
              ? tag.comment
              : (tag.comment ?? []).map((c) => c.text).join('');
          const cmd = parseCommand(comment);
          if (cmd) commands.push(cmd);
        }
      }
      if (commands.length) decl.commands = commands;
    },
  };
}
