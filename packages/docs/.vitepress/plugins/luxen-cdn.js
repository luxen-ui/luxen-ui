import { createReadStream, existsSync, statSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_PREFIX = '/luxen-cdn/';
const CONTENT_TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

/**
 * Serves `packages/ui/cdn/` at `/luxen-cdn/` so iframe-hosted demos can
 * load `<script type="module" src="/luxen-cdn/elements/sticky-bar/index.js">`.
 *
 * Dev: middleware streams files from disk.
 * Build: copies the tree into the docs dist so the static build works the
 * same way.
 */
export function luxenCdnPlugin() {
  const here = dirname(fileURLToPath(import.meta.url));
  const cdnRoot = resolve(here, '..', '..', '..', 'ui', 'cdn');

  return {
    name: 'luxen-cdn',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith(URL_PREFIX)) return next();
        const rel = req.url.slice(URL_PREFIX.length).split('?')[0];
        const file = join(cdnRoot, rel);
        if (!file.startsWith(cdnRoot) || !existsSync(file) || !statSync(file).isFile()) {
          return next();
        }
        const ext = file.slice(file.lastIndexOf('.'));
        res.setHeader('Content-Type', CONTENT_TYPES[ext] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
        return undefined;
      });
    },

    async closeBundle() {
      // Vitepress build outputs to `.vitepress/dist/`. Mirror cdn there.
      const distRoot = resolve(here, '..', 'dist', 'luxen-cdn');
      if (!existsSync(cdnRoot)) {
        this.warn(
          `[luxen-cdn] ${cdnRoot} does not exist — run \`vp run luxen-ui#build\` before building docs`,
        );
        return;
      }
      await cp(cdnRoot, distRoot, { recursive: true });
    },
  };
}
