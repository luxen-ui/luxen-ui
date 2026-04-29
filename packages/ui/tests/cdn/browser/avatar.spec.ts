import { expect, test } from '@playwright/test';

test('avatar.html upgrades <l-avatar> from cdn/ bundle', async ({ page }) => {
  await page.goto('/tests/cdn/avatar.html');

  // The page does a dynamic import of cdn/elements/avatar/avatar.js and writes
  // "✅ avatar.js loaded" into #status when it resolves. If the bundle has a
  // bare/external import the browser can't fulfil, this never appears.
  await expect(page.locator('#status')).toContainText('✅ avatar.js loaded', { timeout: 10_000 });

  const isDefined = await page.evaluate(() => customElements.get('l-avatar') !== undefined);
  expect(isDefined, 'customElements.define("l-avatar", …) did not run').toBe(true);

  const hasShadow = await page.evaluate(() => {
    const el = document.querySelector('l-avatar.probe');
    return Boolean(el?.shadowRoot);
  });
  expect(hasShadow, 'l-avatar instance has no shadowRoot — class did not upgrade').toBe(true);

  const hasBase = await page.evaluate(() => {
    const el = document.querySelector('l-avatar.probe');
    return Boolean(el?.shadowRoot?.querySelector('.base'));
  });
  expect(hasBase, 'shadow render output (.base) is missing').toBe(true);

  // Tokens loaded from cdn/styles/index.css must be resolved at runtime
  // (i.e. @theme blocks were processed by Tailwind v4 at build time and
  // emitted as :root declarations). If this is empty, the browser ignored
  // unprocessed @theme directives and components will render unstyled.
  const tokenValue = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--l-color-text-primary').trim(),
  );
  expect(
    tokenValue,
    '--l-color-text-primary did not resolve — cdn/styles/index.css ships unprocessed @theme blocks',
  ).not.toBe('');
});
