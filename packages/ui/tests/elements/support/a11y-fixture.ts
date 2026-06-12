/**
 * Fixture contract for the axe-core a11y suite (`a11y/a11y.browser.test.ts`).
 *
 * One fixture file per element under `a11y/fixtures/`. Each declares the
 * canonical markup for the element in one or more states, plus — for states a
 * user only reaches by interacting (an open dropdown, a modal dialog, a visible
 * tooltip) — a `setup` that drives the element there with the shared `userEvent`
 * helpers, exactly like the behavioral suites.
 *
 * `name` matches the element's `name` in `elements.json` (the single source of
 * truth), NOT the `l-` tag — so native CSS-only elements (button, checkbox,
 * close-button, …), which have no custom tag, fit the same contract as custom
 * elements. The completeness guard in the spec reads `elements.json` and fails
 * when an element has no fixture and is not in some fixture's `covers`.
 */

/** A rule switched off for a fixture/state, with a justification reviewed like code. */
export interface DisabledRule {
  /** axe rule id, e.g. 'color-contrast', 'aria-required-children'. */
  id: string;
  /** Why it is off. `KNOWN-ISSUE: backlog` marks a real finding tracked for a source fix. */
  reason: string;
}

/** A single named state of an element. */
export interface FixtureState {
  /** Markup mounted into the page. */
  html: string;
  /** Drive the element to this state the way a user would, before axe runs. */
  setup?: (host: HTMLElement) => Promise<void> | void;
  /** Rules disabled for this state only (merged with the fixture-level list). */
  disabledRules?: DisabledRule[];
}

export interface A11yFixture {
  /** Element name, matching `name` in `elements.json` (e.g. 'button', 'dropdown'). */
  name: string;
  /** Extra element names this fixture also exercises (sub-items: 'dropdown-item', …). */
  covers?: string[];
  /** Named states — a plain HTML string, or an object with `setup`/`disabledRules`. */
  states: Record<string, string | FixtureState>;
  /** Rules disabled for every state of this fixture, each justified. */
  disabledRules?: DisabledRule[];
}

/** Identity helper that gives fixture files full type-checking and inference. */
export function defineA11yFixture(fixture: A11yFixture): A11yFixture {
  return fixture;
}

/** Normalize a state declaration (string shorthand → full object). */
export function normalizeState(state: string | FixtureState): FixtureState {
  return typeof state === 'string' ? { html: state } : state;
}
