import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/slider/index.js';
import type { Slider } from '../../src/html/elements/slider/slider.js';

// The browser config has no setup file, so the light-DOM stylesheets are not
// loaded by default — every other suite asserts DOM/ARIA and does not need them.
// This one measures painted colour, so it pulls in the tokens plus each skin.
import '../../src/css/tokens.css';
import '../../src/css/elements/checkbox.css';
import '../../src/css/elements/radio.css';
import '../../src/css/elements/switch.css';
import '../../src/css/elements/input.css';
import '../../src/css/elements/textarea.css';

// Disabled controls follow one rule: a mark painted on an accent fill fades with
// `opacity`; everything else greys out through `--l-form-control-disabled-*`.
//
// This suite guards the second half. `opacity` is a blunt instrument — it drags a
// control's mark and its own fill toward the page together, so wherever it leaks
// onto a token-greyed control it silently undoes the calibration. Nothing else
// catches that: axe's `color-contrast` rule skips disabled controls by design
// (the WCAG 1.4.3 exemption) and only ever compares *text* to its background,
// never a glyph to the fill underneath it.
//
// Checked checkboxes, selected radios and on switches are deliberately NOT
// asserted for mark contrast. They fade, which puts the checkmark at ~1.85:1
// against its own box — a measured, accepted trade: the fade reads as "inactive"
// at a glance, and WCAG 1.4.11 exempts inactive components. Asserting a floor
// there would encode a standard the design does not claim to meet.
//
// What is asserted is what the rule actually promises: no stray fade on a
// token-greyed control, and a slider thumb that stays locatable on its track.

/** WCAG 1.4.11 floor for a non-text graphic that carries meaning. */
const MIN_MARK_CONTRAST = 3;

let host: HTMLElement;

afterEach(() => host?.remove());

// --- colour plumbing -------------------------------------------------------
// `getComputedStyle` returns a control's own declared colour, which since the
// disabled tokens became translucent is not what lands on screen. Everything
// below composites down to the surface before measuring.

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 1;
const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

type Rgba = [number, number, number, number];

/** Parse any CSS colour (oklch, oklab, color-mix, light-dark…) into sRGB + alpha. */
function parse(color: string): Rgba {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** Composite a (possibly translucent) colour over an opaque backdrop. */
function over(fg: Rgba, bg: Rgba): Rgba {
  return [
    fg[0] * fg[3] + bg[0] * (1 - fg[3]),
    fg[1] * fg[3] + bg[1] * (1 - fg[3]),
    fg[2] * fg[3] + bg[2] * (1 - fg[3]),
    1,
  ];
}

/** Apply a group `opacity` the way the compositor would, against the backdrop. */
function fade(color: Rgba, opacity: number, bg: Rgba): Rgba {
  return over([color[0], color[1], color[2], opacity], bg);
}

function luminance([r, g, b]: Rgba): number {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// --- mounting --------------------------------------------------------------
// Each scheme is mounted in its own `color-scheme` container so `light-dark()`
// resolves per pane, letting one run cover both modes.

const SCHEMES = ['light', 'dark'] as const;
type Scheme = (typeof SCHEMES)[number];

/** The page colour each control composites onto, per scheme. */
function surfaceOf(scheme: Scheme): Rgba {
  const probe = document.createElement('div');
  probe.style.colorScheme = scheme;
  probe.style.color = 'var(--l-color-surface)';
  host.append(probe);
  const surface = parse(getComputedStyle(probe).color);
  probe.remove();
  return surface;
}

function mount(scheme: Scheme, html: string): HTMLElement {
  host ??= document.createElement('div');
  if (!host.isConnected) document.body.append(host);
  const pane = document.createElement('div');
  pane.style.colorScheme = scheme;
  pane.innerHTML = html;
  host.append(pane);
  return pane;
}

/**
 * Resolve an element's painted foreground and background down to opaque sRGB,
 * folding in any group `opacity` on the way — which is exactly what makes a
 * fade fail this test: it moves both toward the surface, closing the gap.
 */
function paintedPair(el: Element, mark: string, fill: string, surface: Rgba) {
  const style = getComputedStyle(el);
  const opacity = Number.parseFloat(style.opacity);
  const onSurface = (color: string) => {
    const painted = over(parse(color), surface);
    return opacity < 1 ? fade(painted, opacity, surface) : painted;
  };
  return { mark: onSurface(mark), fill: onSurface(fill) };
}

// ---------------------------------------------------------------------------
// Toggles
// ---------------------------------------------------------------------------

describe('An unchecked disabled toggle greys out like a text control', () => {
  const UNCHECKED: Array<[string, string]> = [
    ['checkbox', `<input type="checkbox" class="l-checkbox" disabled />`],
    ['radio', `<input type="radio" class="l-radio" disabled />`],
  ];

  it.each(UNCHECKED)(
    'gives %s the same fill and border as a disabled input',
    (_name: string, html: string) => {
      const pane = mount('light', `${html}<input class="l-input" value="x" disabled />`);
      const [toggle, input] = [...pane.querySelectorAll('input')];
      const surface = surfaceOf('light');

      const painted = (el: Element) => {
        const s = getComputedStyle(el);
        return [
          over(parse(s.backgroundColor), surface).join(),
          over(parse(s.borderTopColor), surface).join(),
        ];
      };

      // An unchecked box carries no mark, so it takes the text-control treatment
      // outright — a checkbox and an input in one disabled form must agree.
      expect(painted(toggle)).toEqual(painted(input));
    },
  );

  it.each(SCHEMES)(
    'keeps an off switch’s thumb visible on its track in %s mode',
    (scheme: Scheme) => {
      const pane = mount(
        scheme,
        `<input type="checkbox" role="switch" class="l-switch" disabled />`,
      );
      const swtch = pane.querySelector('input')!;
      const style = getComputedStyle(swtch);
      const thumb = style.getPropertyValue('--_thumb-color').trim();

      // Off + disabled is token-driven: a pale track with a grey thumb. Without the
      // thumb the control would read as an empty pill.
      const { mark, fill } = paintedPair(swtch, thumb, style.backgroundColor, surfaceOf(scheme));

      expect(contrast(mark, fill)).toBeGreaterThanOrEqual(MIN_MARK_CONTRAST);
    },
  );
});

// ---------------------------------------------------------------------------
// No group fades
// ---------------------------------------------------------------------------

describe('Disabled controls grey out through tokens, not a group fade', () => {
  // Every control on the token side of the rule. A fade leaking onto any of them
  // would dim a colour that was picked deliberately, and nothing else would say so.
  const CONTROLS: Array<[string, string]> = [
    ['an unchecked checkbox', `<input type="checkbox" class="l-checkbox" disabled />`],
    ['an unchecked radio', `<input type="radio" class="l-radio" disabled />`],
    ['an off switch', `<input type="checkbox" role="switch" class="l-switch" disabled />`],
    ['an input', `<input class="l-input" value="x" disabled />`],
    ['a textarea', `<textarea class="l-textarea" disabled>x</textarea>`],
  ];

  it.each(CONTROLS)('leaves %s at full opacity', (_name: string, html: string) => {
    const pane = mount('light', html);
    expect(getComputedStyle(pane.firstElementChild!).opacity).toBe('1');
  });

  // The other half of the rule, asserted so the split stays deliberate: a checked
  // toggle IS faded. If someone "fixes" this back to a token fill, that is a
  // design change and should show up as a failing test, not slip through.
  const FADED: Array<[string, string]> = [
    ['a checked checkbox', `<input type="checkbox" class="l-checkbox" checked disabled />`],
    ['a selected radio', `<input type="radio" class="l-radio" checked disabled />`],
    ['an on switch', `<input type="checkbox" role="switch" class="l-switch" checked disabled />`],
  ];

  it.each(FADED)('fades %s instead', (_name: string, html: string) => {
    const pane = mount('light', html);
    expect(getComputedStyle(pane.firstElementChild!).opacity).toBe('0.4');
  });

  // The slider belongs to the faded side too: its thumb is a disc ringed in the
  // accent, sitting on an accent-filled indicator. Asserted separately because
  // the fade lives on the shadow host and it upgrades asynchronously.
  it('fades a disabled slider', async () => {
    const pane = mount('light', `<l-slider label="Volume" value="40" disabled></l-slider>`);
    await customElements.whenDefined('l-slider');
    const slider = pane.querySelector<Slider>('l-slider')!;
    await slider.updateComplete;

    expect(getComputedStyle(slider).opacity).toBe('0.5');
  });
});
