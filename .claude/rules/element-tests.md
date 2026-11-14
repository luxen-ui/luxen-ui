---
paths:
  - 'packages/ui/tests/**'
---

# Element tests

Two runners, two jobs:

- **Node unit tests** — flat `tests/*.test.ts` (`vitest.config.ts`). For non-DOM logic only (CLI, PostCSS).
- **Component tests** — `tests/elements/*.browser.test.ts` (`vitest.browser.config.ts`, real Chromium via Playwright). **Required** for anything touching ARIA via `ElementInternals`, `getByRole`, `:state()`, `showModal`/popover — jsdom/happy-dom can't observe these. CDN-bundle smoke tests stay in Playwright (`tests/cdn/browser/*.spec.ts`, `pnpm test:e2e`).

Run: `vp run test` (both) · `pnpm test:unit` · `pnpm test:components`.

## Traps

- **Component suites load no CSS.** An assertion on a computed style in
  `tests/elements/<name>.browser.test.ts` passes whatever the stylesheet says.
  Style behavior goes in its own `*-style.browser.test.ts` suite that imports
  the tokens and the skin it tests (`src/css/tokens.css`,
  `src/css/elements/<name>.css`). Reference:
  `tests/elements/focus-ring-style.browser.test.ts`.
- **Prove the test can fail.** Run a new test against the code before the fix
  (set the change aside, do not weaken the test) and watch it fail. Polling
  assertions on position or style pass on unfixed code more often than expected.
- **The viewport is narrow** (414px wide by default). An anchored overlay placed
  past that edge is clamped back by `shift()`, so a position assertion measures
  the clamp, not the placement. Keep anchors inside the viewport.
- **A popover's `:popover-open` stays true until its hide animation resolves**,
  even at a duration of 0, and `document.getAnimations()` does not see into
  shadow roots. Wait for the element's `after-hide` event, not for a fixed delay.
- **`vp check` does not run the tests.** Before pushing: `pnpm test:components`,
  which includes the axe suite (`pnpm test:components a11y` alone). That suite
  runs with the real CSS and fails on contrast and on interactive targets under
  24px, and it needs a fixture for every element — see `packages/ui/AGENTS.md` →
  "Adding an element".

## Writing component tests

- **User-oriented, never theatre.** Drive the element like a person (click rows, press keys via a real `KeyboardEvent`) then assert what a user, their screen reader, or their CSS observes — focus, selection, the accessibility tree, selector targetability. Don't assert internal wiring or re-test the framework.
- **`describe`/`it` read like a book's table of contents.** `describe` = a capability or persona scenario ("A keyboard user can move through the tree"); `it` = one observable outcome ("jumps to the first and last item with Home and End"). The verbose reporter should read as prose.
- **Assert via `getByRole`** (name + state filters `{ selected, expanded, level, disabled }`) — these match because roles/states are mirrored to DOM attributes alongside `ElementInternals`. For ARIA with no role filter (`aria-posinset`/`setsize`/`busy`/`multiselectable`), assert the mirrored attribute. Avoid `expect.element` (untyped under `vp check`) — use `locator.elements()`/`.query()` after settling.
- **Settle Lit updates** before asserting: `await el.updateComplete` + a macrotask (`setTimeout(…, 0)`), since the tree syncs on a microtask + MutationObserver.
- **Simulate a real user — `userEvent` only.** All interactions go through
  `userEvent` from `vite-plus/test/browser/context` — `click()`,
  `keyboard('{ArrowDown}')`, `tab()`, `type()`, `hover()`. These send trusted
  CDP events and exercise native behaviors (popover light-dismiss, focus
  delegation) that synthetic events can't. Never use `dispatchEvent`, DOM
  `.click()`, or manual `.focus()` in a test. `userEvent.keyboard` targets the
  focused element: establish focus the way a user would (`userEvent.tab()` or
  a click), never with `.focus()`. Import the shared `userEvent` singleton from
  `tests/elements/support/user-event.ts` (it re-exports the
  `userEvent` singleton from `vite-plus/test/browser/context`); never re-create it
  per-suite.
- **Query like assistive tech.** `page.getByRole(role, { name, ...states })`
  is the default query — it pierces open shadow DOM and proves the accessible
  name/state is actually exposed. `getByLabelText` for form controls. Get
  handles with `locator.element()` / `.query()` / `.elements()` after settling.
- **Systematic `describe('Accessibility', …)` block.** Every component test
  file ends with one, containing three sub-describes whose cases come from the
  matching [WAI-ARIA APG pattern](https://www.w3.org/WAI/ARIA/apg/patterns/)
  (menu button, dialog modal, tabs, tree…):
  1. `Roles and accessible names` — what `getByRole` exposes (roles, names,
     `aria-*` states).
  2. `Keyboard interaction (APG <pattern>)` — every key the pattern mandates.
  3. `Focus management` — tab order, roving tabindex, focus return/trap.
     Where a test maps to a WCAG/RGAA success criterion, reference it in the
     title: `it('… (WCAG 2.1.1 / RGAA 7.3)')`. Common mappings: keyboard
     operability → WCAG 2.1.1 / RGAA 7.3 · no keyboard trap → WCAG 2.1.2 /
     RGAA 12.9 · focus order → WCAG 2.4.3 / RGAA 12.8 · name, role, value →
     WCAG 4.1.2 / RGAA 7.1.
- **Focus assertions across shadow roots** use `deepActiveElement()` from
  `tests/elements/support/a11y.ts`. Reference suite:
  `tests/elements/dropdown.browser.test.ts`.
- **Shared vs local test helpers.** `userEvent` and `waitForEvent` live in
  `tests/elements/support/` — import them, never re-declare them. But
  **`mount()` and `settle()` stay local to each suite**: each `settle()`
  encodes that element's real synchronization contract (e.g. dialog/
  stories-viewer need two macrotasks because `dialog.close()` schedules a
  second Lit cycle; tree awaits all `l-tree-item`s). Do not unify them into a
  shared helper — a one-size `settle()` either over-waits everywhere (masking
  scheduling regressions) or needs so many options it earns nothing.
