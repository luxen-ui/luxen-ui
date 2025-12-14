<script setup>
const thread = [
  {
    id: 1,
    author: 'Thin-Brother6266',
    color: '#38bdf8',
    time: 'il y a 9 m.',
    body: 'Toutes les touches de cette maquette correspondent au clavier Apple, certains caractères ne sont juste pas imprimés sur les majuscules.',
    votes: 2,
    children: [
      {
        id: 2,
        author: 'BlutDeCombat',
        color: '#4ade80',
        isOp: true,
        time: 'il y a 9 m.',
        body: "Mais pour un clavier Windows qu'en est-il?",
        votes: 0,
        children: [
          {
            id: 3,
            author: 'Thin-Brother6266',
            color: '#38bdf8',
            time: 'il y a 9 m.',
            body: 'Normalement, tu vas devoir remplacer les touches majuscules et la plupart des touches majuscules Windows se vendent avec le clavier (voir le post de bachifu).',
            votes: 1,
            children: [],
          },
        ],
      },
    ],
  },
];
</script>

<template>
  <div
    class="vp-raw component-wrapper bg-surface-sunken reddit-wrapper"
    style="padding: 20px 16px; align-items: stretch; flex-direction: column"
  >
    <l-tree
      class="reddit-tree"
      selection="none"
    >
      <TreeRedditComment
        v-for="c in thread"
        :key="c.id"
        :comment="c"
      />
    </l-tree>
  </div>
</template>

<style>
/* Unscoped so ::part() reaches into the shadow DOM. */
.reddit-tree {
  --indent-size: 2rem;
  --indent-guide-width: 2px;
  --indent-guide-color: light-dark(rgb(0 0 0 / 12%), rgb(255 255 255 / 15%));
  --chevron-size: 1.5rem; /* matches <l-avatar size="xs"> = 24px */
  --item-gap: 0.625rem; /* more breathing room between avatar and author */
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.reddit-tree l-tree-item::part(base) {
  padding-block: 0.25rem;
  padding-inline-end: 0;
  background: transparent;
  cursor: default;
  border-radius: 0;
}

.reddit-tree l-tree-item::part(expand-button) {
  color: var(--vp-c-text-2);
}
</style>
