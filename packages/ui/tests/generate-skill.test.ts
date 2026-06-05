// Pulls in the ambient `declare module 'vitest'` stub (vitest is injected by the
// Vite+ runner at runtime, so its types aren't resolvable to the lint checker).
// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference path="./vitest.d.ts" />
import { describe, expect, it } from 'vitest';
import { applyClassAttrPrefix, applyPackageName, applyPrefix } from '../bin/cli.mjs';

// The asymmetric case from RFC-skill-generation-best-practices: tags use the
// element prefix, CSS classes / custom properties use the css prefix.
const ctx = { elementPrefix: 'po', cssPrefix: 'p' };

describe('applyPrefix — class attributes use the css prefix (RFC Finding 1)', () => {
  it('rewrites a single class to the css prefix, not the element prefix', () => {
    expect(applyPrefix('<button class="l-button">Label</button>', ctx)).toBe(
      '<button class="p-button">Label</button>',
    );
  });

  it('handles multiple classes in one attribute', () => {
    expect(applyPrefix('<span class="l-badge l-large flex">x</span>', ctx)).toBe(
      '<span class="p-badge p-large flex">x</span>',
    );
  });

  it('handles single-quoted class attributes', () => {
    expect(applyPrefix("<button class='l-close' data-appearance='ring'></button>", ctx)).toBe(
      "<button class='p-close' data-appearance='ring'></button>",
    );
  });

  it('never emits the element prefix for a class', () => {
    const out = applyPrefix('<button class="l-button" data-variant="primary">x</button>', ctx);
    expect(out).not.toContain('class="po-');
    expect(out).toContain('class="p-button"');
  });

  it('leaves tag names on the element prefix', () => {
    expect(applyPrefix('<l-badge variant="success"></l-badge>', ctx)).toBe(
      '<po-badge variant="success"></po-badge>',
    );
  });

  it('rewrites CSS custom properties and selectors with the css prefix', () => {
    expect(applyPrefix('color: var(--l-color-text-primary);', ctx)).toBe(
      'color: var(--p-color-text-primary);',
    );
    expect(applyPrefix('.l-button { }', ctx)).toBe('.p-button { }');
  });

  it('is a no-op when both prefixes are the default "l"', () => {
    const src = '<l-badge></l-badge> <button class="l-button"></button> var(--l-color-x)';
    expect(applyPrefix(src, { elementPrefix: 'l', cssPrefix: 'l' })).toBe(src);
  });
});

describe('applyClassAttrPrefix', () => {
  it('only touches l- tokens inside class attributes', () => {
    expect(applyClassAttrPrefix('class="l-button" id="l-not-a-class"', 'p')).toBe(
      'class="p-button" id="l-not-a-class"',
    );
  });
});

describe('applyPackageName', () => {
  it('rewrites bare and sub-path import strings, leaving the default alone', () => {
    const both = { jsImportPath: 'pulse-ui' };
    expect(applyPackageName("import 'luxen-ui';", both)).toBe("import 'pulse-ui';");
    expect(applyPackageName("@import 'luxen-ui/css/badge';", both)).toBe(
      "@import 'pulse-ui/css/badge';",
    );
    expect(applyPackageName("import 'luxen-ui';", { jsImportPath: 'luxen-ui' })).toBe(
      "import 'luxen-ui';",
    );
  });
});
