import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite-plus';

/**
 * Keep `@luxen-ui/design-tokens` built for the browser suites.
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
 * This is a plugin rather than a `globalSetup` so it covers watch mode too:
 * `globalSetup` fires once per invocation, which would leave `vitest --watch`
 * re-running against the pre-edit `dist/` — stale in exactly the workflow where
 * token values are most likely to be edited.
 */

const PACKAGE_DIR = fileURLToPath(new URL('../../design-tokens', import.meta.url));
const SOURCE_DIR = fileURLToPath(new URL('../../design-tokens/src', import.meta.url));
const TOKENS_CSS = fileURLToPath(new URL('../src/css/tokens.css', import.meta.url));

/**
 * Run the package's own declared `build` script rather than a copy of it —
 * hardcoding `node scripts/build.js` here would silently build less than CI does
 * the day that script grows a step.
 */
function buildDesignTokens(): void {
  const manifest = new URL('../../design-tokens/package.json', import.meta.url);
  const script: unknown = JSON.parse(readFileSync(manifest, 'utf8')).scripts?.build;
  if (typeof script !== 'string') {
    throw new Error(`@luxen-ui/design-tokens declares no \`build\` script (${PACKAGE_DIR}).`);
  }

  try {
    execSync(script, {
      cwd: PACKAGE_DIR,
      // Captured, not inherited: the build is chatty (it warns about token
      // collisions every run) and this fires ahead of every browser run, so
      // inheriting would bury a genuine failure under routine output.
      stdio: 'pipe',
      timeout: 120_000,
      env: { ...process.env, PATH: `${PACKAGE_DIR}/node_modules/.bin:${process.env.PATH}` },
    });
  } catch (cause) {
    // Rethrow the original rather than wrapping it: `new Error(…, { cause })` needs a
    // newer `lib` than the root tsconfig sets, and rethrowing keeps the spawn error's
    // own stack. Without the prefix the operator sees a bare `Command failed: node
    // scripts/build.js` with nothing tying it to a test-setup step, or to which package.
    if (cause instanceof Error) {
      const stderr = 'stderr' in cause ? `\n${String(cause.stderr)}` : '';
      cause.message =
        `Could not build @luxen-ui/design-tokens, which the browser suites read their ` +
        `--l-* tokens from. Ran \`${script}\` in ${PACKAGE_DIR}.${stderr}\n\n${cause.message}`;
    }
    throw cause;
  }
}

export function designTokens(): Plugin {
  return {
    name: 'luxen-test:design-tokens',
    buildStart() {
      buildDesignTokens();
    },
    configureServer(server) {
      // The token sources live outside this package, so Vite does not watch them.
      server.watcher.add(SOURCE_DIR);
      server.watcher.on('change', (file) => {
        if (!file.startsWith(SOURCE_DIR)) return;
        buildDesignTokens();

        // The rebuilt CSS reaches the suites through an `@import` that PostCSS
        // inlines into `tokens.css`, so Vite holds no module for it and nothing
        // above it is invalidated — the rebuild alone leaves watch mode re-running
        // the previously transformed CSS. Poke the importer instead.
        for (const mod of server.moduleGraph.getModulesByFile(TOKENS_CSS) ?? []) {
          server.moduleGraph.invalidateModule(mod);
        }
        server.watcher.emit('change', TOKENS_CSS);
      });
    },
  };
}
