<template>
  <div class="wl-rename vp-raw">
    <section
      class="col"
      data-side="luxen"
    >
      <header>Luxen default</header>
      <ul class="ids">
        <li><code>&lt;l-badge&gt;</code></li>
        <li><code>.l-button</code></li>
        <li><code>--l-color-text</code></li>
        <li><code>@keyframes l-fade</code></li>
      </ul>
    </section>

    <div
      class="arrow"
      aria-hidden="true"
    >
      <code class="cfg">elementPrefix: 'acme'</code>
      <span class="line"></span>
    </div>

    <section
      class="col"
      data-side="yours"
    >
      <header>Your design system</header>
      <ul class="ids">
        <li><code>&lt;acme-badge&gt;</code></li>
        <li><code>.acme-button</code></li>
        <li><code>--acme-color-text</code></li>
        <li class="own">
          <code>&lt;acme-map&gt;</code>
          <span class="tag">your own</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.wl-rename {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 14px;
  margin: 26px 0 32px;
}

.col {
  --accent: var(--vp-c-brand-1);
  --accent-2: var(--vp-c-brand-3);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--vp-c-divider));
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--accent) 6%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 65%
  );
  overflow: hidden;
}
.col::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  opacity: 0.85;
}
.col[data-side='luxen'] {
  --accent: #94a3b8;
  --accent-2: #cbd5e1;
}
.col[data-side='yours'] {
  --accent: var(--vp-c-brand-1);
  --accent-2: var(--vp-c-brand-3);
}

.col header {
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.ids {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ids li {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ids code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.col[data-side='yours'] .ids code {
  border-color: color-mix(in srgb, var(--accent) 32%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--accent) 7%, var(--vp-c-bg-soft));
}
.ids .own code {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--accent) 55%, var(--vp-c-divider));
}
.ids .own .tag {
  font-family: var(--vp-font-family-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--accent) 80%, var(--vp-c-text-1));
}

.arrow {
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.arrow .cfg {
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, var(--vp-c-bg));
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}
.arrow .line {
  width: 100%;
  min-width: 40px;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--vp-c-divider),
    color-mix(in srgb, var(--vp-c-brand-1) 60%, var(--vp-c-divider))
  );
  position: relative;
}
.arrow .line::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-left-color: color-mix(in srgb, var(--vp-c-brand-1) 60%, var(--vp-c-divider));
}

@media (max-width: 760px) {
  .wl-rename {
    grid-template-columns: 1fr;
  }
  .arrow {
    flex-direction: row;
    gap: 12px;
  }
  .arrow .line {
    flex: 1;
    min-width: 0;
  }
}
</style>
