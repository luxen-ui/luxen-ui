<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { version } from '../../../../ui/package.json';

const prefixes = ['l-', 'acme-', 'pulse-'];
const current = ref(0);
const typed = ref('l-');
let timer = null;
let phase = 'pause';
let i = 0;

function tick() {
  const target = prefixes[current.value];
  if (phase === 'pause') {
    phase = 'erase';
    timer = setTimeout(tick, 1400);
    return;
  }
  if (phase === 'erase') {
    if (typed.value.length > 0) {
      typed.value = typed.value.slice(0, -1);
      timer = setTimeout(tick, 60);
    } else {
      current.value = (current.value + 1) % prefixes.length;
      phase = 'type';
      i = 0;
      timer = setTimeout(tick, 200);
    }
    return;
  }
  if (phase === 'type') {
    if (i < target.length) {
      typed.value += target[i++];
      timer = setTimeout(tick, 90);
    } else {
      phase = 'pause';
      timer = setTimeout(tick, 1800);
    }
  }
}

onMounted(() => {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    timer = setTimeout(tick, 1500);
  }
});
onUnmounted(() => clearTimeout(timer));

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

const principles = [
  { key: 'html', body: 'native first. extend until the platform catches up.' },
  { key: 'css', body: 'modern only — :has(), color-mix(), light-dark().' },
  { key: 'dom', body: 'light dom by default. shadow only when it earns its keep.' },
  { key: 'js', body: 'tiny runtime. tree-shakeable. no framework lock-in.' },
  { key: 'a11y', body: 'wcag 2.2 aa — semantics, aria, focus.' },
  { key: 'agent', body: 'ships an agent skill for ai code generation.' },
];

const railTags = [
  'l-avatar',
  'l-badge',
  'l-carousel',
  'l-dialog',
  'l-divider',
  'l-drawer',
  'l-dropdown',
  'l-icon',
  'l-input-otp',
  'l-input-stepper',
  'l-popover',
  'l-rating',
  'l-skeleton',
  'l-spinner',
  'l-tabs',
  'l-toast',
  'l-tooltip',
  'l-tree',
];
</script>

<template>
  <div
    class="terminal"
    data-landing="terminal"
  >
    <div class="bg-grid" />
    <div class="bg-glow" />

    <header class="topbar">
      <a
        class="brand"
        href="/"
        aria-label="Luxen UI home"
      >
        <img
          src="/logos/luxen.svg"
          alt=""
          width="26"
          height="26"
        />
        <span>luxen-ui</span>
        <small class="ver">v{{ version }}</small>
        <span class="badge-preview">//&nbsp;public&nbsp;preview</span>
      </a>
      <div class="topbar-end">
        <ul
          class="metrics"
          aria-label="Library highlights"
        >
          <li>
            <span
              class="dot ok"
              aria-hidden="true"
            ></span>
            {{ railTags.length }}&nbsp;custom&nbsp;elements
          </li>
          <li>
            <span
              class="dot ok"
              aria-hidden="true"
            ></span>
            light&nbsp;dom
          </li>
          <li>
            <span
              class="dot ok"
              aria-hidden="true"
            ></span>
            wcag&nbsp;2.2
          </li>
        </ul>
        <a
          class="gh"
          href="https://github.com/luxen-ui/luxen-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
            />
          </svg>
          luxen-ui/luxen-ui
        </a>
      </div>
    </header>

    <section
      class="hero"
      aria-labelledby="hero-title"
    >
      <div class="left">
        <p
          class="kicker"
          aria-hidden="true"
        >
          <span class="cursor">▍</span>
          <span class="path">~/design-system/setup.config</span>
        </p>
        <h1 id="hero-title">
          <span class="grey">an HTML-first</span><br />
          <span class="accent">design&nbsp;system</span><span class="dot-pulse">.</span>
        </h1>
        <p class="lede">
          Native HTML. Modern CSS. Progressive custom elements by default, Shadow DOM when it pays
          off. Rename the <code class="prefix-inline">l-</code> prefix to ship a design system that
          bears your name.
        </p>

        <div class="ctas">
          <a
            class="btn primary"
            href="/overview/getting-started"
          >
            Get started
            <span
              class="arrow"
              aria-hidden="true"
              >→</span
            >
          </a>
          <a
            class="btn ghost"
            href="/elements/badge"
          >
            Browse components
          </a>
        </div>

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

        <section
          class="principles"
          aria-labelledby="principles-title"
        >
          <h2
            id="principles-title"
            class="p-head"
          >
            <span class="cmt">//&nbsp;principles</span>
            <span
              class="p-rule"
              aria-hidden="true"
              >───────────────────</span
            >
          </h2>
          <ul>
            <li
              v-for="p in principles"
              :key="p.key"
            >
              <strong class="p-key">{{ p.key }}</strong>
              <span class="p-body">{{ p.body }}</span>
            </li>
          </ul>
        </section>
      </div>

      <figure
        class="right"
        aria-labelledby="editor-caption"
      >
        <div
          class="editor"
          aria-hidden="true"
        >
          <div class="title-bar">
            <span class="trafic"><span /><span /><span /></span>
            <div class="tabs">
              <span class="tab active">signup.html</span>
              <span class="tab">vite.config.ts</span>
              <span class="tab">theme.css</span>
            </div>
          </div>
          <div class="editor-body">
            <div class="gutter">
              <span
                v-for="n in 9"
                :key="n"
                >{{ n }}</span
              >
            </div>
            <pre
              class="code"
            ><code><span class="cmt">// rename the l- prefix to your design system</span>
<span class="kw">import</span> <span class="brace">{</span> <span class="ident">setPrefix</span> <span class="brace">}</span> <span class="kw">from</span> <span class="str">'luxen-ui'</span>;
<span class="ident">setPrefix</span>(<span class="str">'<span class="hi">{{ typed.replace('-', '') || ' ' }}</span>'</span>);

<span class="cmt">&lt;!-- in your markup --&gt;</span>
<span class="tag">&lt;button</span> <span class="attr">class</span>=<span class="str">"<span class="hi">{{ typed }}</span>button"</span> <span class="attr">data-variant</span>=<span class="str">"primary"</span><span class="tag">&gt;</span>
  <span class="tag">&lt;<span class="hi">{{ typed }}</span>icon</span> <span class="attr">name</span>=<span class="str">"heroicons:sparkles"</span> <span class="tag">/&gt;</span>
  Ship it
<span class="tag">&lt;/button&gt;</span><span class="caret">▍</span></code></pre>
          </div>
          <div class="status-bar">
            <span class="seg ok">● built</span>
            <span class="seg"
              >prefix → <code>{{ typed }}</code></span
            >
            <span class="seg">utf-8</span>
            <span class="seg">html · css · ts</span>
          </div>
        </div>

        <figcaption
          id="editor-caption"
          class="under-hint"
        >
          <span
            class="bracket"
            aria-hidden="true"
            >[</span
          >
          tip
          <span
            class="bracket"
            aria-hidden="true"
            >]</span
          >
          PostCSS + Vite plugins rewrite every CSS class, custom property, keyframe and tag for you.
        </figcaption>
      </figure>
    </section>

    <footer class="bottom">
      <h2 class="rail-head">
        <span class="cmt">//&nbsp;catalog</span>
        <span class="rail-count">{{ railTags.length }} custom elements</span>
      </h2>
      <div
        class="rail"
        aria-hidden="true"
      >
        <div class="track">
          <code
            class="chip"
            v-for="(t, i) in [...railTags, ...railTags, ...railTags]"
            :key="i"
          >
            <span class="bk">&lt;</span><span class="hi">l-</span
            ><span class="el-name">{{ t.slice(2) }}</span
            ><span class="bk">&gt;</span>
          </code>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.terminal {
  --bg: #0b0d12;
  --bg-2: #0f1218;
  --line: #1d222c;
  --text: #d6dae3;
  --muted: #6b7384;
  --dim: #4a5160;
  --accent: #ef6c3a;
  --accent-2: #f3a26b;
  --purple: #9b6dcc;
  --ok: #34d399;
  --kw: #c792ea;
  --str: #b9d77a;
  --tag: #e8a96a;
  --attr: #9b6dcc;
  --hi: #ef6c3a;

  position: relative;
  isolation: isolate;
  min-height: 100vh;
  margin: 0 calc(50% - 50vw);
  padding: 0 max(24px, calc(50vw - 680px));
  background: var(--bg);
  color: var(--text);
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, #000 30%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.bg-glow {
  position: absolute;
  top: -120px;
  left: 50%;
  width: 1100px;
  height: 600px;
  transform: translateX(-50%);
  background:
    radial-gradient(circle at 30% 50%, rgba(239, 108, 58, 0.25), transparent 60%),
    radial-gradient(circle at 75% 40%, rgba(155, 109, 204, 0.22), transparent 60%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.topbar,
.hero,
.bottom {
  position: relative;
  z-index: 1;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 18px;
  border-bottom: 1px dashed var(--line);
  font-size: 14px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
  transition: 120ms;
}
.brand:hover {
  color: var(--accent);
}
.brand:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 4px;
}
.brand img {
  width: 26px;
  height: 26px;
  border-radius: 4px;
}
.brand .ver {
  color: var(--text);
  padding: 3px 8px;
  border: 1px solid var(--line);
  border-radius: 5px;
  font-size: 12px;
  font-weight: 400;
}
.badge-preview {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.02em;
  font-weight: 500;
}
.topbar-end {
  display: inline-flex;
  align-items: center;
  gap: 22px;
}
.metrics {
  display: inline-flex;
  align-items: center;
  gap: 22px;
  list-style: none;
  padding: 0;
  margin: 0;
  color: var(--text);
  font-weight: 500;
}
.metrics li {
  display: inline-flex;
  align-items: center;
}
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  background: var(--ok);
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.22);
}
.gh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
  padding: 7px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  transition: 120ms;
}
.gh svg {
  width: 16px;
  height: 16px;
}
.gh:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(239, 108, 58, 0.06);
}
.gh:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 56px;
  align-items: start;
  padding: 64px 0 48px;
}
.left {
  min-width: 0;
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  padding: 4px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
}
.cursor {
  color: var(--accent);
  animation: blink 1s steps(2) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

h1 {
  margin: 22px 0 22px;
  font-size: clamp(2.8rem, 5.2vw, 5rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.035em;
  color: var(--text);
}
h1 .grey {
  display: inline-block;
  color: transparent;
  -webkit-text-stroke: 1.4px var(--muted);
  font-weight: 600;
}
h1 .accent {
  position: relative;
  background: linear-gradient(
    115deg in oklch shorter hue,
    var(--accent) 0%,
    #ec4899 50%,
    var(--purple) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 10px 32px color-mix(in oklab, var(--accent) 45%, transparent));
}
.dot-pulse {
  color: var(--accent);
  filter: drop-shadow(0 0 12px color-mix(in oklab, var(--accent) 60%, transparent));
}

.lede {
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
  max-width: 520px;
}
.lede .prefix-inline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95em;
  background: rgba(239, 108, 58, 0.13);
  color: var(--accent);
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid rgba(239, 108, 58, 0.35);
}

.ctas {
  display: flex;
  gap: 12px;
  margin: 28px 0 14px;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: 160ms;
  font-family: 'Inter', system-ui, sans-serif;
}
.btn.primary {
  background: var(--accent);
  color: #0b0d12;
  box-shadow: 0 6px 20px -8px rgba(239, 108, 58, 0.5);
}
.btn.primary:hover {
  background: var(--accent-2);
  transform: translateY(-1px);
  box-shadow: 0 10px 28px -8px rgba(239, 108, 58, 0.7);
}
.btn.primary .arrow {
  font-size: 1.05em;
  transition: transform 200ms;
}
.btn.primary:hover .arrow {
  transform: translateX(3px);
}
.btn.ghost {
  color: var(--text);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
}
.btn.ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(239, 108, 58, 0.06);
}
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.install-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 32px;
  padding: 8px 12px 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  transition: 160ms;
}
.install-pill:hover {
  border-color: rgba(239, 108, 58, 0.4);
  background: rgba(239, 108, 58, 0.05);
}
.install-pill:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.install-pill .prompt {
  color: var(--accent);
}
.install-pill code {
  color: var(--text);
  background: none;
  padding: 0;
}
.install-pill .copy-ico {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--muted);
  margin-left: 4px;
  transition: color 160ms;
}
.install-pill .copy-ico svg {
  width: 14px;
  height: 14px;
}
.install-pill:hover .copy-ico {
  color: var(--accent);
}
.install-pill[aria-label*='copied'] .copy-ico {
  color: var(--ok);
}
.install-pill .copied-label {
  font-size: 11px;
  color: var(--ok);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  min-width: 0;
}

.principles {
  font-size: 13px;
}
.p-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
.p-head .cmt {
  color: var(--accent);
}
.p-rule {
  color: var(--line);
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
  font-weight: 400;
}
.principles ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.principles li {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 14px;
  align-items: baseline;
  padding: 6px 12px 6px 14px;
  border-left: 2px solid var(--line);
  transition: border-color 200ms;
}
.principles li:hover {
  border-left-color: var(--accent);
}
.p-key {
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 11px;
}
.p-body {
  color: var(--text);
  line-height: 1.5;
}
.kw {
  color: var(--kw);
}
.ident {
  color: var(--text);
}
.op,
.semi {
  color: var(--dim);
}
.val {
  color: var(--str);
}

.right {
  min-width: 0;
  margin: 0;
}
.editor {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: linear-gradient(180deg, #11141b 0%, #0d1016 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 30px 60px -20px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(239, 108, 58, 0.05);
  overflow: hidden;
  font-size: 13px;
}
.title-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  background: #0d1016;
}
.trafic {
  display: inline-flex;
  gap: 6px;
}
.trafic span {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #2a2e38;
}
.trafic span:nth-child(1) {
  background: #ff5f57;
}
.trafic span:nth-child(2) {
  background: #febc2e;
}
.trafic span:nth-child(3) {
  background: #28c840;
}
.tabs {
  display: inline-flex;
  gap: 2px;
}
.tab {
  padding: 4px 10px;
  border-radius: 5px;
  color: var(--muted);
  font-size: 12px;
}
.tab.active {
  background: rgba(239, 108, 58, 0.12);
  color: var(--accent);
  border: 1px solid rgba(239, 108, 58, 0.25);
}

.editor-body {
  display: grid;
  grid-template-columns: 44px 1fr;
}
.gutter {
  display: flex;
  flex-direction: column;
  padding: 14px 0;
  color: var(--dim);
  text-align: right;
  user-select: none;
}
.gutter span {
  padding: 0 12px 0 0;
  font-size: 12px;
  line-height: 1.7;
}
.code {
  margin: 0;
  padding: 14px 16px 14px 0;
  line-height: 1.7;
  font-size: 13px;
  overflow-x: auto;
}
.cmt {
  color: var(--muted);
}
.kw {
  color: var(--kw);
}
.brace {
  color: var(--text);
}
.str {
  color: var(--str);
}
.tag {
  color: var(--tag);
}
.attr {
  color: var(--attr);
}
.hi {
  color: var(--hi);
  font-weight: 600;
  background: rgba(239, 108, 58, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}
.caret {
  color: var(--accent);
  animation: blink 1s steps(2) infinite;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 12px;
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: var(--muted);
  background: #0a0c11;
}
.seg.ok {
  color: var(--ok);
}
.seg code {
  color: var(--accent);
  background: rgba(239, 108, 58, 0.12);
  padding: 1px 6px;
  border-radius: 3px;
}

.under-hint {
  margin-top: 16px;
  font-size: 12px;
  color: var(--muted);
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px dashed var(--line);
  border-radius: 8px;
}
.bracket {
  color: var(--accent);
}

.bottom {
  padding: 32px 0 56px;
  border-top: 1px solid var(--line);
}
.rail-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 0;
  padding: 18px 0 14px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.rail-head .cmt {
  color: var(--accent);
}
.rail-head .rail-count {
  color: var(--muted);
  font-weight: 500;
}
.rail {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.track {
  display: inline-flex;
  gap: 8px;
  white-space: nowrap;
  animation: drift 80s linear infinite;
  padding: 4px 0;
}
.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 6px;
  background: linear-gradient(180deg, #15181f 0%, #11141a 100%);
  border: 1px solid var(--line);
  font-size: 12.5px;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  transition: 160ms;
  flex: none;
}
.chip:hover {
  border-color: rgba(239, 108, 58, 0.35);
  background: linear-gradient(180deg, #1a1d24 0%, #14171c 100%);
}
.chip .bk {
  color: var(--tag);
}
.chip .hi {
  color: var(--accent);
  font-weight: 600;
  background: rgba(239, 108, 58, 0.1);
  padding: 0 1px;
  border-radius: 2px;
  margin: 0 -1px;
}
.chip .el-name {
  color: var(--kw);
}
@keyframes drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-33.333%);
  }
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 0;
  }
  .terminal {
    padding: 0 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor,
  .caret,
  .dot-pulse,
  .track {
    animation: none !important;
  }
}
</style>
