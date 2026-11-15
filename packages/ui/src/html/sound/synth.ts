/**
 * A very small Web Audio synthesiser, sized for UI feedback and nothing else.
 *
 * Every sound the library plays is generated here from oscillators and noise —
 * there are no audio files to fetch, decode, cache or version, and a consumer
 * who never enables sound pays nothing for it. The whole engine is a few
 * hundred bytes gzipped once the recipes are inlined.
 *
 * The deliberate limits: one-shots only (no sustain, no loops, no release
 * stage), at most one filter per layer, and no effect bus. Interface sounds are
 * under 150 ms and must never draw attention to themselves; anything that would
 * need a reverb tail is the wrong sound for a button.
 *
 * SSR-safe: nothing here touches `AudioContext` at module scope. Browsers only
 * let a context start inside a user gesture, so the store calls
 * {@linkcode unlock} synchronously from its click and key listeners — Safari
 * refuses a context resumed even one task later — and {@linkcode play} drops a
 * sound the browser held back rather than playing it late.
 */

/** A steady pitch in Hz, or an exponential glide across the layer's life. */
export type SoundFrequency = number | { from: number; to: number };

/** One voice. A recipe stacks a few of them to build a single perceived sound. */
export interface SoundLayer {
  /**
   * Oscillator waveform, or `'noise'` for white noise — the usual transient.
   * Not `'custom'`, which needs a periodic wave this engine never sets.
   */
  wave: Exclude<OscillatorType, 'custom'> | 'noise';
  /** Hz. Required for every wave but `'noise'`, which has no pitch. */
  frequency?: SoundFrequency;
  /** One biquad, the cheapest way to give noise a colour and a body a shape. */
  filter?: { type: BiquadFilterType; frequency: number; q?: number };
  /** Seconds of linear fade in. Omit for a click: an instant attack *is* the click. */
  attack?: number;
  /** Seconds to fall back to silence. Also decides how long the layer lives. */
  decay: number;
  /** Peak gain, before the store's master volume. Keep well under 1. */
  gain?: number;
  /** Seconds to wait before this layer starts, for two-note chimes. */
  delay?: number;
}

/** A complete sound: one or more layers played together. */
export type SoundRecipe = readonly SoundLayer[];

/**
 * `exponentialRampToValueAtTime` rejects zero and `setTargetAtTime` never
 * arrives, so silence is −80 dB rather than an actual 0. Inaudible, and it
 * keeps the gain curve a true exponential instead of leaving a DC offset.
 */
const SILENCE = 1e-4;

/**
 * An exponential approach covers ~95% of its distance in three time constants,
 * so a `decay` of 40 ms is authored as 40 ms and *sounds* like 40 ms.
 */
const TIME_CONSTANTS = 3;

/** Slack between the envelope reaching silence and the source being stopped. */
const TAIL = 0.05;

/**
 * How long a sound may wait for the context to start before it is dropped.
 * The first gesture can take this long to bring the audio hardware up; a sound
 * asked for before any gesture — a toast on page load — would otherwise play
 * the moment the visitor first clicks, seconds later and out of context.
 */
const LATE = 250;

let context: AudioContext | null = null;
let master: GainNode | null = null;

/**
 * The shared context, created on demand. A page gets exactly one: contexts are a
 * limited resource in every browser, and leaking them across a long session is
 * one of the few ways a sound feature can degrade a whole tab.
 */
function getContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;

  if (!context || context.state === 'closed') {
    context = new AudioContext({ latencyHint: 'interactive' });
    // A `GainNode` belongs to one context; a fresh context invalidates it.
    master = null;
  }

  return context;
}

/**
 * Open the context and ask it to start. Call it synchronously from a gesture
 * handler: that is the only place every browser lets audio begin.
 *
 * Suspended is the normal state before the first gesture, and after the tab has
 * been backgrounded long enough for the browser to reclaim the hardware; Safari
 * adds `interrupted`, during a call. The promise rejects when the browser is not
 * ready to allow it — a normal outcome, not an unhandled rejection.
 */
export function unlock(): void {
  const ctx = getContext();
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
}

function getMaster(ctx: AudioContext): GainNode {
  if (!master || master.context !== ctx) {
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  return master;
}

/** Noise is a buffer of random samples; `seconds` only has to outlast the decay. */
function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * Build and schedule one layer. Nodes are created per hit and thrown away —
 * there is no voice pool, because at a handful of sounds per minute pooling
 * would cost more code than it saves, and per-hit nodes make cleanup exact.
 */
function playLayer(ctx: AudioContext, layer: SoundLayer, volume: number, startTime: number): void {
  const start = startTime + (layer.delay ?? 0);
  const attack = layer.attack ?? 0;
  const peak = (layer.gain ?? 0.2) * volume;
  const duration = attack + layer.decay;

  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(SILENCE, start);
  if (attack > 0) envelope.gain.linearRampToValueAtTime(peak, start + attack);
  else envelope.gain.setValueAtTime(peak, start);
  envelope.gain.setTargetAtTime(SILENCE, start + attack, layer.decay / TIME_CONSTANTS);

  let source: AudioScheduledSourceNode;

  if (layer.wave === 'noise') {
    const node = ctx.createBufferSource();
    node.buffer = noiseBuffer(ctx, duration + TAIL);
    source = node;
  } else {
    const node = ctx.createOscillator();
    node.type = layer.wave;
    const frequency = layer.frequency ?? 440;
    if (typeof frequency === 'number') {
      node.frequency.setValueAtTime(frequency, start);
    } else {
      node.frequency.setValueAtTime(frequency.from, start);
      // Exponential, not linear: pitch is perceived logarithmically, so a linear
      // ramp between two notes audibly rushes the top of the glide.
      node.frequency.exponentialRampToValueAtTime(Math.max(frequency.to, 1), start + duration);
    }
    source = node;
  }

  let tail: AudioNode = source;
  let filterNode: BiquadFilterNode | null = null;

  if (layer.filter) {
    filterNode = ctx.createBiquadFilter();
    filterNode.type = layer.filter.type;
    filterNode.frequency.setValueAtTime(layer.filter.frequency, start);
    filterNode.Q.value = layer.filter.q ?? 1;
    tail.connect(filterNode);
    tail = filterNode;
  }

  tail.connect(envelope);
  envelope.connect(getMaster(ctx));

  source.start(start);
  source.stop(start + duration + TAIL);

  // Self-cleaning: a stopped source can never restart, so its whole chain is
  // garbage the moment it ends. Without this the graph grows for the session.
  source.addEventListener(
    'ended',
    () => {
      source.disconnect();
      filterNode?.disconnect();
      envelope.disconnect();
    },
    { once: true },
  );
}

/**
 * Play a recipe now. Silently does nothing where Web Audio is unavailable, so
 * callers never have to feature-detect.
 */
export function play(recipe: SoundRecipe, volume: number): void {
  const ctx = getContext();
  if (!ctx) return;

  const schedule = () => {
    const now = ctx.currentTime;
    for (const layer of recipe) playLayer(ctx, layer, volume, now);
  };

  if (ctx.state === 'running') {
    schedule();
    return;
  }

  // Scheduling on a context that has not started queues the sound until it
  // does, so a burst of stale sounds would play at the first click. Wait for
  // the start instead, and only play if it came promptly.
  const askedAt = performance.now();
  ctx
    .resume()
    .then(() => {
      if (ctx.state === 'running' && performance.now() - askedAt <= LATE) schedule();
    })
    .catch(() => {});
}

/** Release the audio hardware. The next {@linkcode play} opens a fresh context. */
export function close(): void {
  // A context already closed refuses to close again; nothing is left to release.
  void context?.close().catch(() => {});
  context = null;
  master = null;
}
