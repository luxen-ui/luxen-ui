import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Vitest `globalSetup`: rebuild `@luxen-ui/design-tokens` before the browser run.
 *
 * The light-DOM stylesheets these tests import (`src/css/tokens.css` and every
 * element skin that reads a `--l-*`) resolve `@luxen-ui/design-tokens/css` to
 * that package's **`dist/`** — a gitignored build artifact, not source. CI never
 * sees a stale one: `.github/workflows/ci.yml` runs `vp run --filter 'luxen-ui...'
 * build` (the `...` pulls in dependencies) before `vp run luxen-ui#test`. A local
 * `vitest run` / `pnpm test:components` invokes the runner directly and skips the
 * task graph, so it silently consumes whatever `dist/` happens to be on disk —
 * which is how a token added months ago can still be missing at test time.
 *
 * The build is ~0.3s and writes only into `dist/`, so paying it here is cheaper
 * than the class of phantom failure it removes.
 */
export default function setup() {
  const cwd = fileURLToPath(new URL('../../design-tokens', import.meta.url));
  execFileSync(process.execPath, ['scripts/build.js'], { cwd, stdio: 'inherit' });
}
