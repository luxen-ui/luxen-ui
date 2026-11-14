// Reads the built token stylesheets (`dist/css`, written by `pnpm build`; CI
// builds before it tests).
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { declaredTokens } from './helpers/declared-tokens';

const CSS = resolve(import.meta.dirname, '../dist/css');
const tokensOf = (...files: string[]) => {
  const tokens = new Set<string>();
  for (const file of files) {
    for (const token of declaredTokens(readFileSync(join(CSS, file), 'utf-8'))) tokens.add(token);
  }
  return tokens;
};

describe('luxen-ui/css/tokens splits into primitives, aliases and components', () => {
  it('declares exactly the tokens of its three parts, so the split drops none', () => {
    const whole = tokensOf('tokens.css');
    const parts = tokensOf('tokens/primitives.css', 'tokens/aliases.css', 'tokens/components.css');
    expect(
      [...whole].filter((token) => !parts.has(token)),
      'missing from the parts',
    ).toEqual([]);
    expect(
      [...parts].filter((token) => !whole.has(token)),
      'not in tokens.css',
    ).toEqual([]);
  });

  it('ships every component token family in tokens/components', () => {
    const components = [...tokensOf('tokens/components.css')];
    for (const family of ['form-control', 'tooltip', 'popover', 'menu-item', 'button']) {
      expect(
        components.some((token) => token.startsWith(`--l-${family}-`)),
        family,
      ).toBe(true);
    }
  });
});
