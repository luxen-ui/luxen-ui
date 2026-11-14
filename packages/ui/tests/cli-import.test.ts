// Runs `luxen-ui import` with the real CLI against the built CSS (`dist/css`,
// written by `pnpm build`; CI builds before it tests), in a throwaway folder.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

const CLI = resolve(import.meta.dirname, '../bin/cli.mjs');
let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'luxen-cli-import-'));
});

afterEach(() => rmSync(cwd, { recursive: true, force: true }));

const run = (...args: string[]) =>
  execFileSync(process.execPath, [CLI, 'import', ...args], { cwd, encoding: 'utf-8' });

describe('luxen-ui import copies a CSS file into the project', () => {
  it('writes to the default path when none is given', () => {
    run('design-tokens');
    expect(existsSync(join(cwd, 'luxen-design-tokens.css'))).toBe(true);
  });

  it('creates the missing folders of a custom path', () => {
    run('design-tokens', 'src/styles/tokens.css');
    const written = readFileSync(join(cwd, 'src/styles/tokens.css'), 'utf-8');
    expect(written).toContain('--l-color-text-primary');
  });

  it('refuses to overwrite an existing file', () => {
    run('design-tokens', 'tokens.css');
    expect(() => run('design-tokens', 'tokens.css')).toThrow(/already exists/);
  });
});

describe('luxen-ui import --help tells the source from the destination', () => {
  it('prints the usage and exits cleanly', () => {
    const out = run('--help');
    expect(out).toContain('Usage: luxen-ui import <noun> [path]');
    expect(out).toMatch(
      /design-tokens\s+luxen-ui\/css\/tokens\/aliases\s+\.\/luxen-design-tokens\.css/,
    );
  });
});

// The custom properties a stylesheet declares (`--l-foo: …`), not the ones it reads.
const declaredTokens = (css: string) => new Set(css.match(/--l-[\w-]+(?=\s*:)/g));

// Resolves an `@import` the recipe prints: a `luxen-ui/css/*` entry through the
// package's own exports map, a relative path against the project folder.
const PKG_ROOT = resolve(import.meta.dirname, '..');
const { exports } = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf-8'));
const readImport = (specifier: string) =>
  specifier.startsWith('luxen-ui/')
    ? readFileSync(join(PKG_ROOT, exports[specifier.replace('luxen-ui', '.')].import), 'utf-8')
    : readFileSync(join(cwd, specifier), 'utf-8');

describe('The design-tokens recipe keeps every token Luxen ships', () => {
  it('declares every token of luxen-ui/css/tokens, component tokens included', () => {
    const out = run('design-tokens');
    // The recipe is the run of consecutive `@import` lines that loads the copy.
    const lines = out.split('\n');
    const isImport = (line = '') => /^\s*@import '/.test(line);
    let start = lines.indexOf("         @import './luxen-design-tokens.css';");
    let end = start + 1;
    expect(start).toBeGreaterThan(-1);
    while (isImport(lines[start - 1])) start--;
    while (isImport(lines[end])) end++;
    const recipe = lines.slice(start, end).map((line) => line.match(/@import '([^']+)'/)![1]);

    const declared = declaredTokens(recipe.map(readImport).join('\n'));
    const tokens = readFileSync(join(PKG_ROOT, 'dist/css/tokens.css'), 'utf-8');
    const missing = [...declaredTokens(tokens)].filter((token) => !declared.has(token));
    expect(missing).toEqual([]);
  });
});

describe('The next steps it prints name the file that was written', () => {
  it('points every step at a custom path, never at the default one', () => {
    const out = run('design-tokens', 'src/styles/tokens.css');
    expect(out).toContain("@import './src/styles/tokens.css';");
    expect(out).toContain('Edit ./src/styles/tokens.css');
    expect(out).not.toContain('luxen-design-tokens.css');
  });
});
