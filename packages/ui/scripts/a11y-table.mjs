// Shared reader for the docs' `<AccessibilityTable>` blocks, used by
// prepare-skill-templates.mjs (to render the skill) and check-a11y-tables.mjs
// (to enforce .claude/rules/docs-accessibility.md). Keep the syntax here only.
//
//   <AccessibilityTable :data="[…]" :rules="[…]" :references="[…]" />
//   <AccessibilityTable :data="[…]" :rules="[…]">
//   <template #name>
//
//   ```html
//   …
//   ```
//
//   </template>
//   </AccessibilityTable>

// Groups: 1 `:data`, 2 `:rules` (optional), 3 slot body (optional).
export const ACCESSIBILITY_TABLE =
  /<AccessibilityTable\s+:data="(\[[\s\S]*?\])"\s*(?::rules="(\[[\s\S]*?\])"\s*)?(?::references="\[[\s\S]*?\]"\s*)?(?:\/>|>([\s\S]*?)<\/AccessibilityTable>)/g;

const SLOT = /<template #([\w-]+)>\s*(```(\w*)\n([\s\S]*?)```)\s*<\/template>/g;

export function unescapeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// The arrays are JS literals authored in this repo's docs; evaluating them is
// the simplest faithful reader of what Vue itself will evaluate.
export function evaluateArray(src) {
  // oxlint-disable-next-line typescript/no-implied-eval
  return new Function(`return ${unescapeEntities(src)}`)();
}

/**
 * Reads one `ACCESSIBILITY_TABLE` match.
 * @returns {{ data: unknown[], rules: unknown[], slots: Map<string, { fence: string, lang: string, code: string }> }}
 * @throws when `:data` or `:rules` is not a valid array literal.
 */
export function readAccessibilityTable(dataSrc, rulesSrc, slotsSrc = '') {
  const slots = new Map(
    [...slotsSrc.matchAll(SLOT)].map(([, name, fence, lang, code]) => [
      name,
      { fence, lang, code },
    ]),
  );
  return {
    data: evaluateArray(dataSrc),
    rules: rulesSrc ? evaluateArray(rulesSrc) : [],
    slots,
  };
}
