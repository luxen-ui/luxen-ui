/*
 * Shared source scanning for the guards that police what element styles may
 * reference (see `no-tailwind-spacing.test.ts`, `font-weight-tokens.test.ts`).
 *
 * Both walk the same tree and both need comments gone before matching, so the
 * tokenizer lives here rather than once per guard: a subtly different copy is
 * how one guard ends up failing open while its neighbour still passes.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SRC = fileURLToPath(new URL('../../src', import.meta.url));

export function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(css|ts)$/.test(entry)) yield path;
  }
}

/*
 * One pass rather than a regex per comment style, because either regex alone
 * gets the other case wrong: a line-anchored `//` pattern misses a trailing
 * `// never var(--spacing)` and keeps failing the build on prose, while a
 * `/* … *\/` pattern run over raw source lets a `/*` inside a string swallow
 * the declarations after it — a guard that fails open.
 *
 * String contents are kept, only recognised. `rating.ts` builds inline styles
 * holding `var(--spacing)` inside template literals, and those must stay
 * visible to the search; the same is true of any `style="font-weight:…"` a
 * template assembles.
 *
 * Newlines inside comments are preserved so line numbers survive the strip —
 * a guard that reports a location has to report the real one.
 */
export function stripComments(source: string, path: string) {
  const isTs = path.endsWith('.ts');
  let out = '';
  let i = 0;

  const blank = (text: string) => text.replace(/[^\n]/g, ' ');

  while (i < source.length) {
    const pair = source.slice(i, i + 2);

    if (pair === '/*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      out += blank(source.slice(i, stop));
      i = stop;
      continue;
    }

    // `//` opens a comment in TypeScript only; in CSS it is not one, and a bare
    // `url(https://…)` must survive.
    if (isTs && pair === '//') {
      const end = source.indexOf('\n', i + 2);
      const stop = end === -1 ? source.length : end;
      out += blank(source.slice(i, stop));
      i = stop;
      continue;
    }

    const char = source[i];
    if (char === '"' || char === "'" || (isTs && char === '`')) {
      out += char;
      i += 1;
      while (i < source.length && source[i] !== char) {
        const step = source[i] === '\\' ? 2 : 1;
        out += source.slice(i, i + step);
        i += step;
      }
      out += source[i] ?? '';
      i += 1;
      continue;
    }

    out += char;
    i += 1;
  }

  return out;
}

/** Every `.css`/`.ts` file under `src`, comments blanked out. */
export function loadSources() {
  return [...walk(SRC)].map((path) => ({
    path,
    code: stripComments(readFileSync(path, 'utf8'), path),
  }));
}
