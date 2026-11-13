// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference path="./vitest.d.ts" />
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vite-plus/test';
import { absolutizeDocsUrls } from '../scripts/absolutize-docs-urls.mjs';

const origin = 'https://luxen-ui.com';
const publicDir = mkdtempSync(join(tmpdir(), 'luxen-docs-public-'));
mkdirSync(join(publicDir, 'images', 'carousel'), { recursive: true });
writeFileSync(join(publicDir, 'images', 'carousel', 'forest.webp'), '');
writeFileSync(join(publicDir, 'images', 'carousel', 'forest-2x.webp'), '');
mkdirSync(join(publicDir, 'previews'));
writeFileSync(join(publicDir, 'previews', 'sticky-bar.html'), '');

afterAll(() => rmSync(publicDir, { recursive: true, force: true }));

const run = (content: string) => absolutizeDocsUrls(content, { origin, publicDir });

describe('A skill template points docs links at the published site', () => {
  it('rewrites root-relative markdown links', () => {
    expect(run('See [tokens](/foundations/tokens).')).toBe(
      'See [tokens](https://luxen-ui.com/foundations/tokens).',
    );
  });

  it('leaves protocol-relative and absolute links alone', () => {
    const content = '[a](//cdn.example.com/x) [b](https://example.com/y)';
    expect(run(content)).toBe(content);
  });
});

describe('A skill template loads example assets from the published site', () => {
  it('rewrites a src the docs serve', () => {
    expect(run('<img src="/images/carousel/forest.webp" alt="">')).toBe(
      '<img src="https://luxen-ui.com/images/carousel/forest.webp" alt="">',
    );
  });

  it('rewrites single-quoted src and poster attributes', () => {
    expect(run("<video poster='/images/carousel/forest.webp'></video>")).toBe(
      "<video poster='https://luxen-ui.com/images/carousel/forest.webp'></video>",
    );
  });

  it('rewrites every candidate of a srcset', () => {
    expect(
      run('<img srcset="/images/carousel/forest.webp 1x, /images/carousel/forest-2x.webp 2x">'),
    ).toBe(
      '<img srcset="https://luxen-ui.com/images/carousel/forest.webp 1x, https://luxen-ui.com/images/carousel/forest-2x.webp 2x">',
    );
  });

  it('keeps a query string or fragment on a served file', () => {
    expect(run('<iframe src="/previews/sticky-bar.html#top"></iframe>')).toBe(
      '<iframe src="https://luxen-ui.com/previews/sticky-bar.html#top"></iframe>',
    );
  });
});

describe("A skill template keeps paths that belong to the consumer's app", () => {
  it('leaves a src the docs do not serve as written', () => {
    const content = 'Point it at your logo: `<img src="/logo.svg" alt="Acme">`.';
    expect(run(content)).toBe(content);
  });

  it('ignores data-src even when the file exists', () => {
    const content = '<img data-src="/images/carousel/forest.webp">';
    expect(run(content)).toBe(content);
  });

  it('leaves relative and protocol-relative sources alone', () => {
    const content = '<img src="images/carousel/forest.webp"><img src="//cdn.example.com/a.webp">';
    expect(run(content)).toBe(content);
  });
});
