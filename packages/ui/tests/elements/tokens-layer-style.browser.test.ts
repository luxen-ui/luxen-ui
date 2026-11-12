import { afterEach, describe, expect, it } from 'vite-plus/test';

// Luxen ships its `--l-*` tokens in `@layer theme`, so a consumer theme on
// `:root` wins without depending on load order or specificity: unlayered CSS
// beats every layer, and `@layer base` comes after `theme` in the order Luxen
// declares (the same order as Tailwind v4). The tokens are loaded here
// (component suites load no CSS by default).
import '../../src/css/tokens.css';

const TOKEN = '--l-color-bg-fill-brand';
const OVERRIDE = 'red';

const added: HTMLStyleElement[] = [];

afterEach(() => {
  for (const style of added.splice(0)) style.remove();
});

/** Adds a stylesheet before (`prepend`) or after (`append`) Luxen's CSS. */
function addStyle(css: string, where: 'prepend' | 'append'): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head[where](style);
  added.push(style);
}

const tokenValue = () => getComputedStyle(document.documentElement).getPropertyValue(TOKEN).trim();

/** Every rule of the loaded stylesheets that declares a `--l-*` token. */
function tokenRules(): CSSStyleRule[] {
  const out: CSSStyleRule[] = [];
  const walk = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule && [...rule.style].some((p) => p.startsWith('--l-'))) {
        out.push(rule);
      }
      if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules);
  return out;
}

describe('Luxen tokens sit below any consumer theme', () => {
  it('declares every token inside @layer theme', () => {
    const rules = tokenRules();
    expect(rules.length).toBeGreaterThan(0);
    const unlayered = rules.filter(
      (rule) => !(rule.parentRule instanceof CSSLayerBlockRule && rule.parentRule.name === 'theme'),
    );
    expect(unlayered.map((rule) => rule.selectorText)).toEqual([]);
  });

  it('declares the layer order theme, base, components', () => {
    const statements: CSSLayerStatementRule[] = [];
    for (const sheet of document.styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSLayerStatementRule) statements.push(rule);
      }
    }
    expect(statements[0]?.nameList).toEqual(['theme', 'base', 'components']);
  });

  it('ships its own value with no override', () => {
    expect(tokenValue()).not.toBe('');
    expect(tokenValue()).not.toBe(OVERRIDE);
  });

  it('gives way to an unlayered :root override loaded before Luxen', () => {
    addStyle(`:root { ${TOKEN}: ${OVERRIDE}; }`, 'prepend');
    expect(tokenValue()).toBe(OVERRIDE);
  });

  it('gives way to an unlayered :root override loaded after Luxen', () => {
    addStyle(`:root { ${TOKEN}: ${OVERRIDE}; }`, 'append');
    expect(tokenValue()).toBe(OVERRIDE);
  });

  it('gives way to a :root override in @layer base', () => {
    addStyle(`@layer base { :root { ${TOKEN}: ${OVERRIDE}; } }`, 'append');
    expect(tokenValue()).toBe(OVERRIDE);
  });
});
