<script setup>
const variants = [
  {
    id: '01',
    icon: 'luxen',
    wordmark: 'l-prefix',
    name: 'Anchor — luxen.svg + l-uxen-ui',
    desc: 'Current branded reference for comparison.',
  },
  {
    id: '02',
    icon: 'outline-l',
    wordmark: 'mono-pure',
    name: 'Outlined l- (default)',
    desc: 'Square stroke + l- in currentColor. Adapts to text token.',
  },
  {
    id: '03',
    icon: 'outline-l-accent',
    wordmark: 'mono-pure',
    name: 'Outlined l- + accent text',
    desc: 'Same square outline, l- typed in brand accent color.',
  },
  {
    id: '04',
    icon: 'filled-l',
    wordmark: 'mono-pure',
    name: 'Filled l- (inverted)',
    desc: 'Solid accent square, l- cut out. Strongest identity, scales to favicon.',
  },
  {
    id: '05',
    icon: 'outline-l-circle',
    wordmark: 'mono-pure',
    name: 'Outlined l- · circle',
    desc: 'Circle frame — softer, avatar-like.',
  },
  {
    id: '06',
    icon: 'caret-thin',
    wordmark: 'mono-pure',
    name: 'Outlined l-▍ + thin caret (gap fixed)',
    desc: 'Caret with proper breathing room from the dash. Static thin bar in accent.',
  },
  {
    id: '07',
    icon: 'caret-block',
    wordmark: 'mono-pure',
    name: 'Outlined l- + block caret',
    desc: 'Wider, thicker caret — more visible terminal cursor presence.',
  },
  {
    id: '08',
    icon: 'caret-blink',
    wordmark: 'mono-pure',
    name: 'Outlined l-▍ + blinking caret',
    desc: 'Caret that blinks (1s steps). Living, breathing terminal mark. Respects prefers-reduced-motion.',
  },
  {
    id: '09',
    icon: 'caret-as-dash',
    wordmark: 'mono-pure',
    name: 'Outlined l + caret-as-dash',
    desc: 'No "-" character — the caret replaces it visually. Reads as "l" + cursor at end of word.',
  },
  {
    id: '10',
    icon: 'brackets-l',
    wordmark: 'mono-pure',
    name: '[l-] brackets only',
    desc: 'No frame at all — just brackets around l-. Maximal minimal.',
  },
  {
    id: '11',
    icon: 'outline-l-thick',
    wordmark: 'mono-pure',
    name: 'Outlined l- · thick stroke',
    desc: 'Heavier stroke (2.5px) for boldness.',
  },
  {
    id: '12',
    icon: 'outline-l-corner',
    wordmark: 'mono-pure',
    name: 'Outlined l- + corner accent',
    desc: 'Square + small accent dot top-right.',
  },
  {
    id: '13',
    icon: 'solid-html5-l',
    wordmark: 'mono-pure',
    name: 'Solid HTML5 orange + l-',
    desc: 'Pure #E34F26 background, l- in white. No mix, works in light + dark identically.',
  },
  {
    id: '14',
    icon: 'solid-rebecca-l',
    wordmark: 'mono-pure',
    name: 'Solid Rebecca purple + l-',
    desc: 'Pure #663399 background, l- in white. No mix, works in light + dark identically.',
  },
  {
    id: '15',
    icon: 'solid-html5-chevron',
    wordmark: 'mono-pure',
    name: 'Solid HTML5 orange + chevron-X',
    desc: 'Pure #E34F26 background, crossed chevrons cut out in white. Code mark on solid brand color.',
  },
  {
    id: '16',
    icon: 'solid-rebecca-chevron',
    wordmark: 'mono-pure',
    name: 'Solid Rebecca purple + chevron-X',
    desc: 'Pure #663399 background, crossed chevrons cut out in white.',
  },
];

const themes = ['light', 'dark'];
</script>

<template>
  <div class="logo-lab">
    <header class="header">
      <h1>Logo Lab — Outlined l- + caret + solid-bg explorations</h1>
      <p>
        16 variants. 01 = anchor (current branded). 02–05 = outlined l- base shapes. 06–09 = caret
        variations. 10–12 = brackets / thick / corner. 13–16 = solid HTML5 orange or Rebecca purple
        backgrounds (single color, no mix). Each shown in light + dark.
      </p>
    </header>

    <ol class="grid">
      <li
        v-for="v in variants"
        :key="v.id"
        class="card"
      >
        <header class="card-header">
          <span class="num">{{ v.id }}</span>
          <div class="meta">
            <strong>{{ v.name }}</strong>
            <p>{{ v.desc }}</p>
          </div>
        </header>

        <div class="cells">
          <div
            v-for="theme in themes"
            :key="theme"
            class="cell"
            :data-theme="theme"
          >
            <span class="theme-tag">{{ theme }}</span>
            <div class="brand">
              <!-- ICONS -->
              <img
                v-if="v.icon === 'luxen'"
                src="/logos/luxen-old.svg"
                width="32"
                height="32"
                class="icon"
                alt=""
              />

              <svg
                v-else-if="v.icon === 'outline-l'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="currentColor"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'outline-l-accent'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="var(--brand-1)"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'filled-l'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  rx="6"
                  fill="var(--brand-1)"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="var(--bg)"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'outline-l-circle'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="14.25"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="currentColor"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'caret-thin'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="12"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="14"
                  font-weight="700"
                  fill="currentColor"
                >
                  l-
                </text>
                <rect
                  x="22"
                  y="9"
                  width="1.5"
                  height="14"
                  fill="var(--brand-1)"
                />
              </svg>

              <svg
                v-else-if="v.icon === 'caret-block'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="12"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="14"
                  font-weight="700"
                  fill="currentColor"
                >
                  l-
                </text>
                <rect
                  x="21"
                  y="8"
                  width="3"
                  height="16"
                  fill="var(--brand-1)"
                />
              </svg>

              <svg
                v-else-if="v.icon === 'caret-blink'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="12"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="14"
                  font-weight="700"
                  fill="currentColor"
                >
                  l-
                </text>
                <rect
                  class="caret-anim"
                  x="22"
                  y="9"
                  width="1.5"
                  height="14"
                  fill="var(--brand-1)"
                />
              </svg>

              <svg
                v-else-if="v.icon === 'caret-as-dash'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="13"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="currentColor"
                >
                  l
                </text>
                <rect
                  x="19"
                  y="8"
                  width="3"
                  height="16"
                  fill="var(--brand-1)"
                />
              </svg>

              <svg
                v-else-if="v.icon === 'brackets-l'"
                viewBox="0 0 36 32"
                class="icon icon-mark"
                aria-hidden="true"
                style="width: 36px"
              >
                <text
                  x="18"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="18"
                  font-weight="700"
                  fill="currentColor"
                >
                  [
                </text>
                <text
                  x="18"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="14"
                  font-weight="700"
                  fill="var(--brand-1)"
                >
                  l-
                </text>
                <text
                  x="18"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="18"
                  font-weight="700"
                  fill="currentColor"
                  dx="14"
                >
                  ]
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'outline-l-thick'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="2"
                  width="28"
                  height="28"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="800"
                  fill="currentColor"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'outline-l-corner'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="29"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="currentColor"
                >
                  l-
                </text>
                <circle
                  cx="26"
                  cy="6"
                  r="2.5"
                  fill="var(--brand-1)"
                />
              </svg>

              <svg
                v-else-if="v.icon === 'solid-html5-l'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  rx="6"
                  fill="#E34F26"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="#ffffff"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'solid-rebecca-l'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  rx="6"
                  fill="#663399"
                />
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="15"
                  font-weight="700"
                  fill="#ffffff"
                >
                  l-
                </text>
              </svg>

              <svg
                v-else-if="v.icon === 'solid-html5-chevron'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  rx="6"
                  fill="#E34F26"
                />
                <path
                  d="M22 8 L12 16 L22 24"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 8 L20 16 L10 24"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <svg
                v-else-if="v.icon === 'solid-rebecca-chevron'"
                viewBox="0 0 32 32"
                class="icon icon-mark"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  rx="6"
                  fill="#663399"
                />
                <path
                  d="M22 8 L12 16 L22 24"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 8 L20 16 L10 24"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <!-- WORDMARKS -->
              <span
                v-if="v.wordmark === 'l-prefix'"
                class="wm wm-mono"
              >
                <span class="wm-prefix">l-</span><span>uxen-ui</span>
              </span>
              <span
                v-else-if="v.wordmark === 'mono-pure'"
                class="wm wm-mono"
                >luxen-ui</span
              >
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.logo-lab {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 28px 80px;
  font-family: 'Inter', system-ui, sans-serif;
}
.header {
  margin-bottom: 36px;
}
.header h1 {
  font-family: 'Sora', sans-serif;
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
  line-height: 1.05;
}
.header p {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  margin: 0;
  max-width: 760px;
  line-height: 1.5;
}

.grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 18px;
}

.card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.card-header {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: start;
}
.card-header .num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--vp-c-text-3);
  padding-top: 1px;
  letter-spacing: 0.06em;
}
.card-header strong {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}
.card-header p {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.45;
}

.cells {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.cell {
  position: relative;
  min-height: 110px;
  padding: 32px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  --bg: #ffffff;
  --bg-alt: #faf8f6;
  --text-1: #213547;
  --text-2: #5c6873;
  --text-3: #8a93a3;
  --divider: #e2e2e3;
  --brand-1: #d9461f;
  --brand-3: #e35233;
  --purple: #663399;
}
.cell[data-theme='dark'] {
  --bg: #1a1a1e;
  --bg-alt: #2a2520;
  --text-1: rgba(255, 255, 255, 0.87);
  --text-2: rgba(235, 235, 245, 0.6);
  --text-3: rgba(235, 235, 245, 0.38);
  --divider: rgba(82, 82, 89, 0.68);
  --brand-1: #ef6c3a;
  --brand-3: #fb9e70;
  --purple: #9b6dcc;
}
.cell + .cell {
  border-left: 1px solid var(--vp-c-divider);
}
.cell {
  background: var(--bg);
  color: var(--text-1);
}

.theme-tag {
  position: absolute;
  top: 8px;
  left: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.icon {
  display: block;
}
img.icon {
  border-radius: 4px;
}
.icon-mark {
  width: 32px;
  height: 32px;
  color: var(--text-1);
}

.wm {
  color: var(--text-1);
}
.wm-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.wm-mono .wm-prefix {
  background: color-mix(in oklab, var(--brand-1) 14%, transparent);
  color: var(--brand-1);
  padding: 0 4px;
  border-radius: 3px;
  border: 1px solid color-mix(in oklab, var(--brand-1) 32%, transparent);
  margin-right: 1px;
  font-weight: 600;
}

.caret-anim {
  animation: caret-blink 1s steps(2) infinite;
}
@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .caret-anim {
    animation: none;
  }
}

@media (max-width: 720px) {
  .logo-lab {
    padding: 32px 20px 64px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
