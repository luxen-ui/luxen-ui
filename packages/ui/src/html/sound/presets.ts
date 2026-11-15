/**
 * The sound palette — seven recipes, one per kind of thing an interface can say.
 *
 * These are tokens, not decoration. The set is deliberately small and each
 * entry is defined by its *meaning*, so that the same event always sounds the
 * same across a product: a dialog and a drawer both close with `close`, a
 * checkbox and a tab both land with `toggle`. Add an eighth only when there is
 * a distinct thing to say, never because a component wants its own noise.
 *
 * Shared grammar, so the seven read as one family:
 * · Nothing lasts longer than 150 ms — an interface sound competes with speech
 *   and with whatever the user is actually listening to.
 * · Rising pitch reveals (`open`, `notify`), falling pitch dismisses (`close`,
 *   `error`), steady pitch confirms (`tap`, `toggle`, `select`).
 * · Peak gains stay near 0.15, leaving the master volume room to move.
 *
 * Override any of them through `sound.configure({ presets: { … } })`; the shape
 * is public API and a brand is expected to retune it.
 */

import type { SoundRecipe } from './synth.js';

/** What a sound *means*. Components map their events onto these, never onto recipes. */
export type SoundName =
  /** A button was pressed. The generic acknowledgement. */
  | 'tap'
  /** A binary or discrete control landed on a value — checkbox, switch, tab, radio. */
  | 'toggle'
  /** One option was chosen out of several — menu item, dropdown row, combobox entry. */
  | 'select'
  /** Something came into view — dialog, drawer, popover, disclosure. */
  | 'open'
  /** Something was dismissed — the mirror of `open`, and of a removal. */
  | 'close'
  /** The interface spoke first, unprompted — a toast. */
  | 'notify'
  /** A refusal: an invalid submission, a destructive confirmation. */
  | 'error';

export const presets: Record<SoundName, SoundRecipe> = {
  /**
   * The classic two-part click: a noise transient for the contact, a short sine
   * under it for the body. Either half alone sounds like a defect — the noise
   * is a spit, the sine is a beep — which is the whole lesson of UI sound
   * design in one preset.
   */
  tap: [
    { wave: 'noise', filter: { type: 'highpass', frequency: 2400 }, decay: 0.008, gain: 0.1 },
    { wave: 'sine', frequency: 620, decay: 0.024, gain: 0.16 },
  ],

  /**
   * Harder and higher than `tap`, because a toggle reports a *state*, not just
   * a press. The bandpass is what keeps a square wave from sounding cheap: it
   * throws away the fundamental's buzz and keeps the edge.
   */
  toggle: [
    {
      wave: 'square',
      frequency: 1760,
      filter: { type: 'bandpass', frequency: 2400, q: 1.8 },
      decay: 0.026,
      gain: 0.14,
    },
  ],

  /**
   * A triangle rather than a square: choosing from a list is a softer act than
   * flipping a switch, and the lowpass rounds off what edge is left.
   */
  select: [
    {
      wave: 'triangle',
      frequency: 880,
      filter: { type: 'lowpass', frequency: 3200 },
      decay: 0.05,
      gain: 0.16,
    },
  ],

  /** Rising: something is arriving. The 2 ms attack keeps the glide from clicking. */
  open: [
    { wave: 'sine', frequency: { from: 420, to: 620 }, attack: 0.002, decay: 0.1, gain: 0.16 },
  ],

  /**
   * `open` played backwards, plus a lowpassed puff of air. The pair is what
   * makes an overlay feel like an object that was put away rather than deleted.
   */
  close: [
    { wave: 'sine', frequency: { from: 560, to: 380 }, attack: 0.002, decay: 0.085, gain: 0.14 },
    { wave: 'noise', filter: { type: 'lowpass', frequency: 1400 }, decay: 0.05, gain: 0.07 },
  ],

  /**
   * Two notes a fifth apart, the second delayed by the first's length. An
   * interval reads as intentional where a single tone reads as a fault — which
   * is exactly the difference between a notification and an error.
   */
  notify: [
    { wave: 'sine', frequency: 660, decay: 0.075, gain: 0.13 },
    { wave: 'sine', frequency: 990, decay: 0.11, gain: 0.11, delay: 0.075 },
  ],

  /**
   * Low, dull and falling. It has to be recognisable without being punitive, so
   * the sawtooth is buried under a 900 Hz lowpass: you hear weight, not buzz.
   */
  error: [
    {
      wave: 'sawtooth',
      frequency: { from: 220, to: 150 },
      filter: { type: 'lowpass', frequency: 900, q: 0.8 },
      attack: 0.003,
      decay: 0.14,
      gain: 0.16,
    },
  ],
};
