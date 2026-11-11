// Generates a skill with the real CLI from the built templates
// (`dist/templates`, written by `pnpm build`; CI builds before it tests) and
// reads the Foundations guide the way an agent will.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

const CLI = resolve(import.meta.dirname, '../bin/cli.mjs');
const TMP = mkdtempSync(join(tmpdir(), 'luxen-skill-foundations-'));
const OUT = join(TMP, 'out');

beforeAll(() => {
  // cwd = an empty folder, so no luxen.config.mjs is picked up.
  execFileSync(
    process.execPath,
    [CLI, 'generate-skill', '--out', OUT, '--element-prefix', 'pulse', '--css-prefix', 'p'],
    { cwd: TMP, stdio: 'pipe' },
  );
});

afterAll(() => rmSync(TMP, { recursive: true, force: true }));

const read = (path: string) => readFileSync(join(OUT, path), 'utf-8');

describe('The generated skill ships the Foundations guides', () => {
  it('writes the focus guide under references/foundations', () => {
    expect(existsSync(join(OUT, 'references/foundations/focus.md'))).toBe(true);
  });

  it('points SKILL.md at the focus guide', () => {
    expect(read('SKILL.md')).toContain('(references/foundations/focus.md)');
  });

  it('reads as plain markdown, with no docs-site markup left', () => {
    const guide = read('references/foundations/focus.md');
    expect(guide).not.toMatch(
      /<script setup>|<FocusFigure|<DesignTokens|<ComponentWrapper|<AccessibilityTable/,
    );
    expect(guide).not.toMatch(/\]\(\/(?!\/)/); // no root-relative docs-site links
  });

  it('inlines the examples and lists the focus tokens', () => {
    const guide = read('references/foundations/focus.md');
    expect(guide).toContain('```html');
    expect(guide).toMatch(/- `--p-focus-ring-color` \(default: `#d9461f`\) — /);
    expect(guide).toMatch(/- `--p-form-control-focus-halo-width` \(default: `3px`\) — /);
    expect(guide).toContain('### Rules');
  });

  it('applies the custom prefixes to tokens, tags and classes', () => {
    const guide = read('references/foundations/focus.md');
    expect(guide).toContain('var(--p-focus-ring-width)');
    expect(guide).toContain('<pulse-segmented-control');
    expect(guide).toContain('class="p-button"');
    expect(guide).not.toMatch(/--l-|<l-|`l-|class="l-/);
  });
});
