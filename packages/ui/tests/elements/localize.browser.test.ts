import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/spinner/index.js';
import '../../src/html/elements/input-stepper/index.js';
import '../../src/html/translations/fr.js';

// These tests drive the localization controller the way a consumer does: set
// `<html lang>` (or a scoped `lang`), mount an element, and assert the language
// shown in the accessibility tree — plus the live re-render when the document
// language changes at runtime (the MutationObserver path).

let host: HTMLElement;

afterEach(() => {
  host?.remove();
  // vitest browser isolates per FILE, not per test — a leaked document lang would
  // corrupt sibling tests.
  document.documentElement.removeAttribute('lang');
});

async function mount(html: string): Promise<HTMLElement> {
  // Collect the custom-element tags authored in the markup (before upgrade), so
  // we don't accidentally await elements an upgrade generates internally (e.g.
  // the stepper's buttons render <l-icon>, which this suite never imports).
  const authored = new Set(
    [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('*')]
      .map((el) => el.tagName.toLowerCase())
      .filter((t) => t.startsWith('l-')),
  );
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await Promise.all([...authored].map((t) => customElements.whenDefined(t)));
  await new Promise((r) => setTimeout(r, 0));
  return host;
}

const spinnerLabel = () =>
  host
    .querySelector('l-spinner')!
    .shadowRoot!.querySelector('[role="progressbar"]')!
    .getAttribute('aria-label');

describe('A consumer sees built-in strings in the page language', () => {
  it('defaults to English when no lang is set', async () => {
    await mount(`<l-spinner></l-spinner>`);
    expect(spinnerLabel()).toBe('Loading');
  });

  it('uses French under <html lang="fr">', async () => {
    document.documentElement.lang = 'fr';
    await mount(`<l-spinner></l-spinner>`);
    expect(spinnerLabel()).toBe('Chargement');
  });

  it('resolves a scoped lang on an ancestor while the document stays English', async () => {
    await mount(`<div lang="fr"><l-spinner></l-spinner></div>`);
    expect(spinnerLabel()).toBe('Chargement');
  });

  it('falls back from fr-CA to fr', async () => {
    document.documentElement.lang = 'fr-CA';
    await mount(`<l-spinner></l-spinner>`);
    expect(spinnerLabel()).toBe('Chargement');
  });

  it('falls back to English for an unregistered locale', async () => {
    document.documentElement.lang = 'de';
    await mount(`<l-spinner></l-spinner>`);
    expect(spinnerLabel()).toBe('Loading');
  });
});

describe('Built-in strings re-render when the document language changes at runtime', () => {
  it('re-renders a Lit-rendered element (spinner) when <html lang> flips', async () => {
    await mount(`<l-spinner></l-spinner>`);
    expect(spinnerLabel()).toBe('Loading');

    document.documentElement.lang = 'fr';
    // The MutationObserver schedules requestUpdate; two macrotasks let the
    // observer callback fire and the host re-render settle.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(spinnerLabel()).toBe('Chargement');
  });

  it('re-labels an imperatively-built element (input-stepper) on a language switch', async () => {
    await mount(
      `<l-input-stepper><input type="number" min="0" max="9" value="2" /></l-input-stepper>`,
    );
    // The stepper builds its buttons imperatively in light DOM; query them
    // structurally and read the aria-label set on each.
    const labels = () =>
      [...host.querySelectorAll('l-input-stepper button')].map((b) => b.getAttribute('aria-label'));
    expect(labels()).toContain('Increase value');
    expect(labels()).toContain('Decrease value');

    document.documentElement.lang = 'fr';
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(labels()).toContain('Augmenter la valeur');
    expect(labels()).toContain('Diminuer la valeur');
    expect(labels()).not.toContain('Increase value');
  });
});
