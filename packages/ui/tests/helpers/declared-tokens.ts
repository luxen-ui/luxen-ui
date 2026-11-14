import { stripComments } from './source-files';

/** The `--l-*` custom properties a stylesheet declares (`--l-foo: …`), not the ones it reads. */
export const declaredTokens = (css: string) =>
  new Set(stripComments(css, 'tokens.css').match(/--l-[\w-]+(?=\s*:)/g));
