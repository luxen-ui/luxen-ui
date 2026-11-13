/*
 * Root-relative URLs (`/overview/…`, `/images/…`) only resolve on the docs
 * site. The skill templates are read outside it, so they point back at the
 * published docs instead.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Rewrites the root-relative URLs of a transformed docs page to absolute ones.
 *
 * - Markdown links `](/…)` point at docs pages: always rewritten.
 * - `src`, `poster` and `srcset` attributes (either quote style) are rewritten
 *   only when the path is a file in the docs `public/` directory. A path the
 *   docs don't serve (e.g. a prose example showing the consumer's own
 *   `<img src="/logo.svg">`) is left as written.
 *
 * @param {string} content
 * @param {{ origin: string, publicDir: string }} options
 * @returns {string}
 */
export function absolutizeDocsUrls(content, { origin, publicDir }) {
  const toAbsolute = (url) => {
    if (!url.startsWith('/') || url.startsWith('//')) return url;
    let path;
    try {
      path = decodeURIComponent(url.split(/[?#]/)[0]);
    } catch {
      return url;
    }
    return existsSync(join(publicDir, path)) ? origin + url : url;
  };

  return content
    .replace(/\]\(\/(?!\/)/g, `](${origin}/`)
    .replace(/(?<![\w-])(src|poster|srcset)=(["'])(.*?)\2/g, (_match, attr, quote, value) => {
      const next =
        attr === 'srcset'
          ? value.replace(/(^|,\s*)(\S+)/g, (_candidate, sep, url) => sep + toAbsolute(url))
          : toAbsolute(value);
      return `${attr}=${quote}${next}${quote}`;
    });
}
