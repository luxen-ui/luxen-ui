<template>
  <div
    class="vp-raw component-wrapper bg-surface-sunken roadmap-wrapper"
    style="padding: 20px 16px; align-items: stretch; flex-direction: column"
  >
    <l-tree
      class="roadmap-tree"
      selection="none"
    >
      <l-tree-item expanded>
        <l-icon
          slot="prefix"
          name="lucide:compass"
          class="text-lg"
          style="color: #38bdf8"
        ></l-icon>

        <span class="font-semibold">Phase 1 — Discovery</span>

        <p
          slot="content"
          class="m-0 pt-1 pb-2 text-[0.875rem] leading-[1.55] text-[color:var(--vp-c-text-2)]"
        >
          Map stakeholders, constraints, and success criteria before any design work begins.
        </p>

        <l-tree-item>
          <l-icon
            slot="prefix"
            name="lucide:square-check-big"
            class="text-base"
            style="color: var(--vp-c-text-3)"
          ></l-icon>
          <span>Stakeholder interviews</span>
          <p
            slot="content"
            class="m-0 pt-1 pb-2 text-[0.8125rem] leading-[1.55] text-[color:var(--vp-c-text-2)]"
          >
            Schedule 30-min calls with each domain owner. Capture pain points and existing
            workflows.
          </p>
        </l-tree-item>

        <l-tree-item>
          <l-icon
            slot="prefix"
            name="lucide:square-check-big"
            class="text-base"
            style="color: var(--vp-c-text-3)"
          ></l-icon>
          <span>Existing system audit</span>
          <p
            slot="content"
            class="m-0 pt-1 pb-2 text-[0.8125rem] leading-[1.55] text-[color:var(--vp-c-text-2)]"
          >
            Inventory the current stack. Note hard dependencies and pieces that block any migration.
          </p>
        </l-tree-item>
      </l-tree-item>

      <l-tree-item>
        <l-icon
          slot="prefix"
          name="lucide:pencil-ruler"
          class="text-lg"
          style="color: #a78bfa"
        ></l-icon>

        <span class="font-semibold">Phase 2 — Design</span>

        <p
          slot="content"
          class="m-0 pt-1 pb-2 text-[0.875rem] leading-[1.55] text-[color:var(--vp-c-text-2)]"
        >
          Turn discovery insights into wireframes, a component inventory, and design tokens.
        </p>

        <l-tree-item>
          <l-icon
            slot="prefix"
            name="lucide:square"
            class="text-base"
            style="color: var(--vp-c-text-3)"
          ></l-icon>
          <span>Low-fidelity wireframes</span>
        </l-tree-item>

        <l-tree-item>
          <l-icon
            slot="prefix"
            name="lucide:square"
            class="text-base"
            style="color: var(--vp-c-text-3)"
          ></l-icon>
          <span>Design tokens</span>
        </l-tree-item>
      </l-tree-item>

      <l-tree-item>
        <l-icon
          slot="prefix"
          name="lucide:hammer"
          class="text-lg"
          style="color: #4ade80"
        ></l-icon>

        <span class="font-semibold">Phase 3 — Implementation</span>

        <p
          slot="content"
          class="m-0 pt-1 pb-2 text-[0.875rem] leading-[1.55] text-[color:var(--vp-c-text-2)]"
        >
          Ship in two-week increments behind feature flags. Each increment is independently
          shippable.
        </p>
      </l-tree-item>
    </l-tree>
  </div>
</template>

<style>
/* Unscoped so ::part() reaches into the shadow DOM. */
.roadmap-tree {
  --indent-size: 1.5rem;
  --row-height: 2rem;
  --indent-guide-color: light-dark(rgb(0 0 0 / 12%), rgb(255 255 255 / 15%));
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.roadmap-tree l-tree-item::part(base) {
  padding-block: 0.375rem;
  padding-inline-end: 0;
  background: transparent;
  border-radius: 0;
}
</style>
