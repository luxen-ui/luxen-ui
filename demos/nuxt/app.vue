<template>
  <div class="min-h-screen">
    <header class="mx-auto max-w-5xl px-6 pt-20 pb-10 text-center">
      <span
        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase pill"
      >
        <span class="size-1.5 rounded-full bg-current opacity-70" />
        Luxen UI demo · Nuxt 4
      </span>

      <h1 class="mt-6 text-5xl font-semibold tracking-tight md:text-6xl">
        Bring Luxen UI under
        <span
          class="block bg-gradient-to-r from-[#ef652a] via-[#e34f26] to-[#663399] bg-clip-text text-transparent"
        >
          your own prefix.
        </span>
      </h1>

      <p class="mx-auto mt-6 max-w-2xl text-lg text-balance opacity-80">
        Default <code class="chip">l-</code> tags, classes and tokens are remapped to
        <code class="chip chip-brand">ds-</code> via the
        <code class="chip">luxen-ui/vite-plugin</code> + a single
        <code class="chip">setPrefix()</code> call.
      </p>

      <div
        class="mt-8 inline-flex items-center gap-3 rounded-2xl border border-color px-4 py-2 text-sm font-mono backdrop-blur surface-glass"
      >
        <code class="text-color-secondary">&lt;l-badge&gt;</code>
        <svg
          viewBox="0 0 24 24"
          class="size-4 opacity-60"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <code class="text-[color:var(--ds-color-text-info)]">&lt;ds-badge&gt;</code>
      </div>
    </header>

    <main class="mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:grid-cols-2">
      <!-- Setup snippet -->
      <section class="card md:col-span-2">
        <header class="card-head">
          <h2>Setup</h2>
          <span class="card-tag">2 files</span>
        </header>
        <div
          v-pre
          class="grid gap-4 md:grid-cols-2"
        >
          <pre class="code"><span class="comment">// nuxt.config.ts</span>
import luxen from <span class="str">'luxen-ui/vite-plugin'</span>;

export default defineNuxtConfig({
  vite: {
    plugins: [luxen({
      elementPrefix: <span class="str">'ds'</span>,
      cssPrefix: <span class="str">'ds'</span>,
    })],
  },
});</pre>
          <pre class="code"><span class="comment">// plugins/luxen.client.ts</span>
import { setPrefix } from <span class="str">'luxen-ui'</span>;

export default defineNuxtPlugin(async () =&gt; {
  setPrefix({ element: <span class="str">'ds'</span>, css: <span class="str">'ds'</span> });
  await import(<span class="str">'luxen-ui/badge'</span>);
  await import(<span class="str">'luxen-ui/dropdown'</span>);
});</pre>
        </div>
      </section>

      <!-- Buttons -->
      <section class="card">
        <header class="card-head">
          <h2>Buttons</h2>
          <span class="card-tag">.ds-button</span>
        </header>

        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="ds-button"
              data-variant="primary"
              data-press-effect
            >
              Primary
            </button>
            <button
              class="ds-button"
              data-press-effect
            >
              Neutral
            </button>
            <button
              class="ds-button"
              data-variant="destructive"
              data-press-effect
            >
              Destructive
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              class="ds-button"
              data-size="sm"
            >
              Small
            </button>
            <button class="ds-button">Medium</button>
            <button
              class="ds-button"
              data-size="lg"
            >
              Large
            </button>
            <button
              class="ds-button"
              data-size="xl"
              data-variant="primary"
            >
              Extra large
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              class="ds-button"
              data-variant="primary"
              disabled
            >
              Disabled
            </button>
            <a
              href="#"
              class="ds-button"
              >Link button</a
            >
          </div>
        </div>
      </section>

      <!-- Badges -->
      <section class="card">
        <header class="card-head">
          <h2>Badges</h2>
          <span class="card-tag">&lt;ds-badge&gt;</span>
        </header>

        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <ds-badge>Default</ds-badge>
            <ds-badge variant="info">Info</ds-badge>
            <ds-badge variant="success">Success</ds-badge>
            <ds-badge variant="warning">Warning</ds-badge>
            <ds-badge variant="danger">Danger</ds-badge>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <ds-badge appearance="filled">Filled</ds-badge>
            <ds-badge
              appearance="filled"
              variant="success"
              >Shipped</ds-badge
            >
            <ds-badge
              appearance="filled"
              variant="warning"
              >Beta</ds-badge
            >
            <ds-badge
              appearance="accent"
              variant="danger"
              >Hot</ds-badge
            >
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <ds-badge
              pill
              appearance="filled-outlined"
              >Pill</ds-badge
            >
            <ds-badge
              pill
              appearance="filled-outlined"
              variant="info"
              >12 new</ds-badge
            >
            <ds-badge
              pill
              appearance="accent"
              variant="success"
              >Live</ds-badge
            >
          </div>
        </div>
      </section>

      <!-- Dropdown -->
      <section class="card">
        <header class="card-head">
          <h2>Dropdown</h2>
          <span class="card-tag">&lt;ds-dropdown&gt;</span>
        </header>

        <div class="flex flex-wrap items-center gap-3">
          <ds-dropdown>
            <button
              slot="trigger"
              class="ds-button"
              data-variant="primary"
            >
              Actions
              <svg
                viewBox="0 0 24 24"
                class="ml-1 size-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <ds-dropdown-item value="edit">Edit</ds-dropdown-item>
            <ds-dropdown-item value="duplicate">Duplicate</ds-dropdown-item>
            <ds-dropdown-item value="archive">Archive</ds-dropdown-item>
          </ds-dropdown>

          <ds-dropdown placement="bottom-end">
            <button
              slot="trigger"
              class="ds-button"
            >
              Bottom end
            </button>
            <ds-dropdown-item>Profile</ds-dropdown-item>
            <ds-dropdown-item>Settings</ds-dropdown-item>
            <ds-dropdown-item>Sign out</ds-dropdown-item>
          </ds-dropdown>
        </div>
      </section>

      <!-- Popover (POC: build-time CSS prefix rewrite) -->
      <section class="card">
        <header class="card-head">
          <h2>
            Popover
            <span
              class="text-[10px] font-semibold tracking-wider text-[color:var(--ds-color-text-success)]"
              >POC</span
            >
          </h2>
          <span class="card-tag">&lt;ds-popover&gt; · ?inline</span>
        </header>

        <div class="flex flex-wrap items-center gap-3">
          <button
            id="popover-trigger-1"
            class="ds-button"
            data-variant="primary"
          >
            Hover me
          </button>
          <ds-popover
            for="popover-trigger-1"
            trigger="hover"
            placement="bottom"
          >
            <strong>Build-time prefix rewrite</strong><br />
            Shadow DOM tokens come from <code class="chip">popover.styles.css</code>, not
            <code class="chip">tokenPrefix()</code>.
          </ds-popover>

          <button
            id="popover-trigger-2"
            class="ds-button"
          >
            Click me
          </button>
          <ds-popover
            for="popover-trigger-2"
            trigger="click"
            placement="top"
          >
            <code class="chip">--ds-color-border</code> resolves at the consumer's build, not at
            runtime.
          </ds-popover>
        </div>
      </section>

      <!-- Divider showcase -->
      <section class="card">
        <header class="card-head">
          <h2>Divider</h2>
          <span class="card-tag">.ds-divider</span>
        </header>

        <p class="text-sm text-color-secondary">
          A native <code class="chip">&lt;hr&gt;</code> styled with the rewritten class.
        </p>
        <hr class="ds-divider my-4" />
        <p class="text-sm text-color-secondary">
          Inspect the page — every <code class="chip">--ds-*</code> token resolves; no
          <code class="chip">l-*</code> leaked through.
        </p>
      </section>

      <footer
        class="mt-4 flex flex-col items-center gap-2 text-sm text-color-tertiary md:col-span-2"
      >
        <p>
          Source ·
          <a
            class="underline-link"
            href="https://github.com/zedix/luxen"
            >github.com/zedix/luxen</a
          >
          · demos/nuxt
        </p>
        <p class="opacity-70">Built with Nuxt 4, Vite + Vue 3 and Luxen UI.</p>
      </footer>
    </main>
  </div>
</template>

<style>
.text-color-primary {
  color: var(--ds-color-text-primary);
}
.text-color-secondary {
  color: var(--ds-color-text-secondary);
}
.text-color-tertiary {
  color: var(--ds-color-text-tertiary);
}
.border-color {
  border-color: var(--ds-color-border);
}

.surface-glass {
  background: color-mix(in oklab, var(--ds-color-surface), transparent 25%);
}

.pill {
  background: color-mix(in oklab, var(--ds-color-text-info) 12%, transparent);
  color: var(--ds-color-text-info);
}

.chip {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  padding: 0.05em 0.4em;
  border-radius: 0.35rem;
  background: color-mix(in oklab, var(--ds-color-text-primary) 8%, transparent);
}
.chip-brand {
  background: color-mix(in oklab, #e34f26 18%, transparent);
  color: color-mix(in oklab, #e34f26, var(--ds-color-text-primary) 30%);
}

.card {
  background: color-mix(in oklab, var(--ds-color-surface) 80%, transparent);
  border: 1px solid var(--ds-color-border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 0 color-mix(in oklab, white 5%, transparent) inset;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.card-head h2 {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ds-color-text-secondary);
}
.card-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  color: var(--ds-color-text-tertiary);
}

.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  line-height: 1.55;
  padding: 1rem 1.1rem;
  border-radius: 0.85rem;
  background: color-mix(in oklab, var(--ds-color-text-primary) 6%, transparent);
  border: 1px solid var(--ds-color-border);
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--ds-color-text-primary);
}
.code .comment {
  color: var(--ds-color-text-tertiary);
  font-style: italic;
}
.code .str {
  color: var(--ds-color-text-success);
}

.underline-link {
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, currentColor, transparent 60%);
  text-underline-offset: 3px;
}
.underline-link:hover {
  text-decoration-color: currentColor;
}
</style>
