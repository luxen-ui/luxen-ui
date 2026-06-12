// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference types="vite-plus/client" />
// oxlint-disable-next-line typescript/triple-slash-reference -- ambient *.css module for side-effect CSS imports.
/// <reference path="./a11y-env.d.ts" />
import { addCollection } from 'iconify-icon';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

// --- Real CSS, through the package's own PostCSS pipeline -------------------
// preset.css pulls in base.css + the design tokens; the glob adds every
// document-level element stylesheet (flat files + appearance skins, `_`-prefixed
// partials excluded to mirror the build). Without the tokens, contrast checks
// would silently evaluate the browser's default black-on-white — see the
// "resolves the real design tokens" guard below. Vitest browser mode isolates
// each test file in its own iframe, so this CSS does NOT leak into the
// behavioral suites.
import '../../../src/css/preset.css';
const elementCss = import.meta.glob('../../../src/css/elements/**/[^_]*.css', { eager: true });

// Register every custom element (the 29 dirs with an index.ts). The 7 native
// CSS-only elements have no index.ts and need no registration — only their CSS,
// loaded above.
import.meta.glob('../../../src/html/elements/*/index.ts', { eager: true });

// elements.json is the single source of truth for what ships — the completeness
// guard derives the expected element list from it (NOT from globbing index.ts,
// which would silently exclude the native CSS-only elements that have no other
// test coverage at all).
import registry from '../../../elements.json';

import { type A11yFixture, normalizeState } from '../support/a11y-fixture.js';
import { formatViolations, runAxe } from '../support/axe.js';

// Eagerly load every fixture file (`_`-prefixed files are shared helpers, not
// fixtures — excluded, mirroring the CSS build's `[^_]*` convention).
const fixtureModules = import.meta.glob<{ default: A11yFixture }>('./fixtures/[!_]*.ts', {
  eager: true,
});
const fixtures: A11yFixture[] = Object.values(fixtureModules).map((m) => m.default);

// --- Local Iconify collection (no network) ---------------------------------
// Mirrors the /emoji.json fixture approach (plan 023): keep the suite hermetic.
function registerTestIcons() {
  addCollection({
    prefix: 'test',
    width: 24,
    height: 24,
    icons: {
      check: {
        body: '<path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>',
      },
      close: {
        body: '<path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/>',
      },
    },
  });
}

// --- Completeness guard ----------------------------------------------------
// Enforcing (wave 2 complete): every element in elements.json must be a fixture's
// `name` or in some fixture's `covers`, the way check-metadata.mjs guards the
// manifest. A new element without an a11y fixture fails CI.
const ENFORCE_COMPLETENESS = true;

const expectedNames: string[] = (registry as { elements: { name: string }[] }).elements.map(
  (e) => e.name,
);
const coveredNames = new Set(fixtures.flatMap((f) => [f.name, ...(f.covers ?? [])]));
const missingFixtures = expectedNames.filter((n) => !coveredNames.has(n));

// --- Mount / settle ---------------------------------------------------------
let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  // Let every custom element in the fragment upgrade and finish its first render.
  const customEls = [...host.querySelectorAll('*')].filter((el) => el.tagName.includes('-'));
  await Promise.all(customEls.map((el) => customElements.whenDefined(el.tagName.toLowerCase())));
  await Promise.all(
    customEls.map((el) =>
      Promise.resolve((el as { updateComplete?: Promise<unknown> }).updateComplete),
    ),
  );
  await new Promise((r) => setTimeout(r, 0));
  return host;
}

beforeAll(() => registerTestIcons());

// --- The suite --------------------------------------------------------------

describe('Element accessibility (axe-core)', () => {
  it('loads the document-level element stylesheets', () => {
    // The glob must resolve to real modules, else contrast runs against defaults.
    expect(Object.keys(elementCss).length).toBeGreaterThan(0);
  });

  it('resolves the real design tokens (not browser defaults)', async () => {
    // A primary button's background is token-driven; if the tokens didn't load it
    // would fall back to the UA default and every contrast check would be a false
    // pass. Assert the computed background is a real, non-default color.
    await mount(`<button class="l-button" data-variant="primary">Save</button>`);
    const btn = host.querySelector('.l-button')!;
    const bg = getComputedStyle(btn).backgroundColor;
    expect(bg).not.toBe('');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)'); // transparent = tokens didn't apply
    expect(bg).not.toBe('transparent');
  });

  it(
    ENFORCE_COMPLETENESS
      ? 'every registered element has an a11y fixture'
      : 'every registered element has an a11y fixture (reported; enforced in wave 2)',
    () => {
      if (missingFixtures.length > 0) {
        const msg = `No a11y fixture for: ${missingFixtures.join(', ')}`;
        if (!ENFORCE_COMPLETENESS) {
          // eslint-disable-next-line no-console
          console.warn(`[a11y suite] ${msg} — add one under tests/elements/a11y/fixtures/.`);
        }
      }
      expect(ENFORCE_COMPLETENESS ? missingFixtures : []).toEqual([]);
    },
  );

  for (const fixture of fixtures) {
    describe(`<l-${fixture.name}>`, () => {
      for (const [stateName, rawState] of Object.entries(fixture.states)) {
        const state = normalizeState(rawState);
        const disabled = [...(fixture.disabledRules ?? []), ...(state.disabledRules ?? [])];

        it(`has no axe violations — ${stateName}`, async () => {
          await mount(state.html);
          await state.setup?.(host);
          // Scan the whole body so top-layer content (popovers, modal dialogs) is
          // in scope; axe pierces open shadow roots.
          const { violations } = await runAxe(document.body, disabled);
          expect(violations, `\n${formatViolations(violations)}\n`).toEqual([]);
        });
      }
    });
  }
});
