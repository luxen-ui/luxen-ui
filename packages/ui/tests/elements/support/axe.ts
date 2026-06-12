import axe, { type AxeResults, type Result, type RunOptions } from 'axe-core';
import type { DisabledRule } from './a11y-fixture.js';

/**
 * WCAG tag set the suite gates on. `wcag22aa` is deliberate: RGAA 5 (the French
 * referential, due late 2026) tracks WCAG 2.2, so we hold elements to 2.2 AA now
 * (target-size, focus-not-obscured, …). `best-practice` is intentionally absent —
 * it is too opinionated to gate CI on.
 */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

/**
 * Run axe over `context` (default `document.body`, so top-layer content — open
 * `[popover]` panels, `showModal()` dialogs — is in scope). axe pierces open
 * shadow roots natively. Only the WCAG tags above are checked; `disabledRules`
 * are switched off (each must carry a justification at the fixture level).
 */
export async function runAxe(
  context: Element | Document = document.body,
  disabledRules: DisabledRule[] = [],
): Promise<AxeResults> {
  const rules = Object.fromEntries(disabledRules.map((r) => [r.id, { enabled: false }]));
  const options: RunOptions = {
    runOnly: { type: 'tag', values: [...WCAG_TAGS] },
    rules,
    resultTypes: ['violations'],
  };
  return axe.run(context, options);
}

/**
 * Render violations as a readable, copy-pasteable report — this IS the product
 * of a red run: a reviewer must be able to diagnose without rerunning locally.
 * One block per violation: rule id, impact, help text, each affected selector
 * with its failure summary, and the Deque help URL.
 */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'no violations';
  return violations
    .map((v) => {
      const nodes = v.nodes
        .map((n) => {
          const selector = Array.isArray(n.target) ? n.target.join(' ') : String(n.target);
          const summary = (n.failureSummary ?? '').replace(/\n/g, '\n        ');
          return `    • ${selector}\n        ${summary}`;
        })
        .join('\n');
      return `  ✖ ${v.id} [${v.impact ?? 'n/a'}] — ${v.help}\n${nodes}\n    ↳ ${v.helpUrl}`;
    })
    .join('\n\n');
}
