<template>
  <div class="ssr-pipelines vp-raw">
    <article
      class="pipe"
      data-side="shadow"
    >
      <header>
        <span
          class="glyph"
          aria-hidden="true"
          >⬢</span
        >
        <div class="heading">
          <h4>100% Shadow DOM library</h4>
          <p class="sub">every component encapsulated · SSR retrofitted</p>
        </div>
      </header>

      <pre class="markup"><code>&lt;x-button&gt;Save&lt;/x-button&gt;
<span class="comment">&lt;!-- an empty box until JS runs --&gt;</span></code></pre>

      <ol class="steps">
        <li>
          <strong>Serialize</strong>
          <span>render Declarative Shadow DOM for every component, via a per-framework plugin</span>
        </li>
        <li>
          <strong>Load</strong>
          <span>a dedicated SSR loader must import hydration support before any component</span>
        </li>
        <li>
          <strong>Hydrate</strong>
          <span
            >wait for <code>whenDefined()</code> + first update before setting any property</span
          >
        </li>
        <li>
          <strong>Interactive</strong>
          <span>slots can't be detected server-side; icons stay blank until upgrade</span>
        </li>
      </ol>

      <ul class="chips">
        <li>framework plugin required</li>
        <li>hydration order matters</li>
        <li>“not meant to fully work without JavaScript”</li>
      </ul>
    </article>

    <div
      class="vs"
      aria-hidden="true"
    >
      vs
    </div>

    <article
      class="pipe"
      data-side="luxen"
    >
      <header>
        <span
          class="glyph"
          aria-hidden="true"
          >⏣</span
        >
        <div class="heading">
          <h4>Luxen UI</h4>
          <p class="sub">HTML-first · Shadow DOM when it pays off</p>
        </div>
      </header>

      <pre class="markup"><code>&lt;button class="l-button"&gt;Save&lt;/button&gt;
<span class="comment">&lt;!-- a real button, already works --&gt;</span></code></pre>

      <ol class="steps">
        <li>
          <strong>Render</strong>
          <span>the server sends plain HTML — the markup you write is the markup you ship</span>
        </li>
        <li>
          <strong>Paint</strong>
          <span>CSS styles it: themed, accessible and functional before any JavaScript</span>
        </li>
        <li>
          <strong>Upgrade</strong>
          <span>JS enhances behavior where it pays off — keyboard nav, positioning, animation</span>
        </li>
      </ol>

      <ul class="chips">
        <li>zero hydration</li>
        <li>nothing to serialize</li>
        <li>usable without JS</li>
      </ul>
    </article>
  </div>
</template>

<style scoped>
.ssr-pipelines {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 14px;
  margin: 28px 0 36px;
}

.pipe {
  --accent: var(--vp-c-brand-1);
  --accent-2: var(--vp-c-brand-3);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--vp-c-divider));
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--accent) 6%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 65%
  );
  overflow: hidden;
}
.pipe::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  opacity: 0.85;
}

.pipe[data-side='shadow'] {
  --accent: #d97706;
  --accent-2: #fbbf24;
}
.pipe[data-side='luxen'] {
  --accent: #0e9f6e;
  --accent-2: #34d399;
}
:global(.dark) .pipe[data-side='shadow'] {
  --accent: #fbbf24;
  --accent-2: #fcd34d;
}
:global(.dark) .pipe[data-side='luxen'] {
  --accent: #34d399;
  --accent-2: #6ee7b7;
}

.pipe header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.glyph {
  font-size: 1.4rem;
  line-height: 1;
  color: var(--accent);
}
.heading h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}
.heading .sub {
  margin: 2px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

.markup {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 0.74rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  overflow-x: auto;
}
.markup .comment {
  color: var(--vp-c-text-3);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
  flex: 1;
}
.steps li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px 0 14px 34px;
  counter-increment: step;
}
.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 8px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--accent) 10%, var(--vp-c-bg));
  color: var(--accent);
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  font-weight: 700;
}
.steps li:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 10.5px;
  top: 34px;
  bottom: -4px;
  width: 1px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 45%, var(--vp-c-divider)),
    var(--vp-c-divider)
  );
}
.steps strong {
  font-size: 0.82rem;
  font-weight: 650;
  color: var(--vp-c-text-1);
}
.steps span {
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.steps code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  color: var(--vp-c-text-1);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.chips li {
  margin: 0;
  padding: 3px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 11%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  color: color-mix(in srgb, var(--accent) 78%, var(--vp-c-text-1));
  font-family: var(--vp-font-family-mono);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.vs {
  align-self: center;
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  padding: 4px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
}

@media (max-width: 760px) {
  .ssr-pipelines {
    grid-template-columns: 1fr;
  }
  .vs {
    justify-self: center;
  }
}
</style>
