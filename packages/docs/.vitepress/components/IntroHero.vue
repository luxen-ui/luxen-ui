<script setup>
import { ref } from 'vue';
import { version } from '../../../ui/package.json';

const copied = ref(false);
let copyTimer = null;
function copyInstall() {
  navigator.clipboard?.writeText('npm i luxen-ui').then(() => {
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 1800);
  });
}
</script>

<template>
  <section
    class="intro-hero"
    aria-labelledby="intro-h1"
  >
    <div
      class="bg-grid"
      aria-hidden="true"
    ></div>
    <div
      class="bg-glow"
      aria-hidden="true"
    ></div>

    <div class="content">
      <p
        class="kicker"
        aria-hidden="true"
      >
        <span class="cursor">▍</span>
        <span class="path">~/design-system/setup.config</span>
      </p>

      <h1 id="intro-h1">
        <span class="grey">an HTML-first</span><br />
        <span class="accent">design&nbsp;system</span><span class="dot-pulse">.</span>
      </h1>

      <p class="lede">
        Native HTML. Modern CSS. Built-in accessibility. Progressive custom elements by default,
        Shadow DOM only when it pays off. A foundation you rename and ship as your own — starting
        with the <code class="prefix-inline">l-</code> prefix.
      </p>

      <div class="meta-row">
        <button
          class="install-pill"
          type="button"
          @click="copyInstall"
          :aria-label="copied ? 'Install command copied to clipboard' : 'Copy install command'"
        >
          <span
            class="prompt"
            aria-hidden="true"
            >$</span
          >
          <code>npm i luxen-ui</code>
          <span
            class="copy-ico"
            aria-hidden="true"
          >
            <svg
              v-if="!copied"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
              />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span
            class="copied-label"
            aria-live="polite"
            >{{ copied ? 'copied' : '' }}</span
          >
        </button>

        <span class="ver-row">
          <small class="ver">v{{ version }}</small>
          <span class="badge-preview">//&nbsp;public&nbsp;preview</span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.intro-hero {
  --hero-accent: var(--vp-c-brand-1);
  --hero-accent-2: var(--vp-c-brand-3);
  --hero-purple: #663399;

  position: relative;
  isolation: isolate;
  margin: 32px 0 48px;
  padding: 56px 32px 56px;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}
:global(.dark) .intro-hero {
  --hero-purple: #9b6dcc;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--vp-c-divider) 1px, transparent 1px),
    linear-gradient(90deg, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: -1px -1px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}
.bg-glow {
  position: absolute;
  top: -80px;
  left: 50%;
  width: 800px;
  height: 500px;
  transform: translateX(-50%);
  background:
    radial-gradient(
      circle at 30% 50%,
      color-mix(in oklab, var(--hero-accent) 18%, transparent),
      transparent 60%
    ),
    radial-gradient(
      circle at 75% 40%,
      color-mix(in oklab, var(--hero-purple) 14%, transparent),
      transparent 60%
    );
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
}
.cursor {
  color: var(--hero-accent);
  animation: blink 1s steps(2) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

h1 {
  margin: 0 0 22px !important;
  padding: 0 !important;
  border: none !important;
  font-size: clamp(2.4rem, 5vw, 4.4rem) !important;
  font-weight: 800 !important;
  line-height: 0.95 !important;
  letter-spacing: -0.035em !important;
  color: var(--vp-c-text-1);
}
h1 .grey {
  display: inline-block;
  color: transparent;
  -webkit-text-stroke: 1.4px var(--vp-c-text-2);
  font-weight: 600;
}
h1 .accent {
  background: linear-gradient(
    115deg in oklch shorter hue,
    var(--hero-accent) 0%,
    #ec4899 50%,
    var(--hero-purple) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 8px 26px color-mix(in oklab, var(--hero-accent) 35%, transparent));
}
.dot-pulse {
  color: var(--hero-accent);
  filter: drop-shadow(0 0 10px color-mix(in oklab, var(--hero-accent) 50%, transparent));
}

.lede {
  font-size: 1.05rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto 28px;
}
.prefix-inline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.92em;
  background: color-mix(in oklab, var(--hero-accent) 12%, transparent);
  color: var(--hero-accent);
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid color-mix(in oklab, var(--hero-accent) 32%, transparent);
}

.meta-row {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.install-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 8px 14px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: 160ms;
}
.install-pill:hover {
  border-color: color-mix(in oklab, var(--hero-accent) 45%, var(--vp-c-divider));
  background: color-mix(in oklab, var(--hero-accent) 6%, var(--vp-c-bg-soft));
}
.install-pill:focus-visible {
  outline: 2px solid var(--hero-accent);
  outline-offset: 2px;
}
.install-pill .prompt {
  color: var(--hero-accent);
}
.install-pill code {
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
  border: none;
  font-size: inherit;
}
.install-pill .copy-ico {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-2);
  margin-left: 4px;
  transition: color 160ms;
}
.install-pill .copy-ico svg {
  width: 14px;
  height: 14px;
}
.install-pill:hover .copy-ico {
  color: var(--hero-accent);
}
.install-pill[aria-label*='copied'] .copy-ico {
  color: #34d399;
}
.install-pill .copied-label {
  font-size: 11px;
  color: #34d399;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.ver-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}
.ver {
  color: var(--vp-c-text-1);
  padding: 3px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  font-size: 11px;
  font-weight: 400;
}
.badge-preview {
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
  font-weight: 500;
}

@media (max-width: 640px) {
  .intro-hero {
    padding: 40px 20px;
    margin: 24px 0 36px;
  }
  h1 {
    font-size: 2.2rem !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor,
  .dot-pulse {
    animation: none !important;
  }
}
</style>
