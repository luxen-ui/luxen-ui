<script setup>
defineOptions({ name: 'TreeRedditComment' });
defineProps({
  comment: { type: Object, required: true },
});
</script>

<template>
  <l-tree-item expanded>
    <l-icon
      slot="expand-icon"
      name="lucide:circle-plus"
      class="text-2xl"
    ></l-icon>
    <l-avatar
      slot="collapse-icon"
      size="xs"
      :name="comment.author"
      :style="{ '--color': comment.color, '--appearance': 'circle' }"
    ></l-avatar>

    <div class="flex items-center gap-1 text-sm">
      <strong>{{ comment.author }}</strong>
      <span
        v-if="comment.isOp"
        class="ms-1 rounded-[3px] bg-blue-600 px-[5px] py-[1px] text-[0.625rem] font-semibold tracking-wide text-white"
        >AO</span
      >
      <span class="text-[color:var(--vp-c-text-3)] text-[0.8125rem] font-normal"
        >&middot; {{ comment.time }}</span
      >
    </div>

    <div
      slot="content"
      class="flex flex-col gap-2 pt-1 pb-2"
      @click.stop
    >
      <p class="m-0 text-[0.9375rem] leading-[1.55] text-[color:var(--vp-c-text-1)]">
        {{ comment.body }}
      </p>
      <div
        class="flex flex-wrap items-center gap-1 text-[0.8125rem] text-[color:var(--vp-c-text-2)]"
      >
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent p-1 font-medium hover:bg-[var(--l-color-bg-state-hover)] hover:text-[color:var(--vp-c-text-1)]"
          aria-label="Upvote"
        >
          <l-icon name="lucide:arrow-big-up"></l-icon>
        </button>
        <span class="min-w-4 text-center text-[0.8125rem] font-semibold">{{ comment.votes }}</span>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent p-1 font-medium hover:bg-[var(--l-color-bg-state-hover)] hover:text-[color:var(--vp-c-text-1)]"
          aria-label="Downvote"
        >
          <l-icon name="lucide:arrow-big-down"></l-icon>
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-2.5 py-1 font-medium hover:bg-[var(--l-color-bg-state-hover)] hover:text-[color:var(--vp-c-text-1)]"
        >
          <l-icon name="lucide:message-circle"></l-icon> Répondre
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-2.5 py-1 font-medium hover:bg-[var(--l-color-bg-state-hover)] hover:text-[color:var(--vp-c-text-1)]"
        >
          <l-icon name="lucide:award"></l-icon> Récompenser
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-2.5 py-1 font-medium hover:bg-[var(--l-color-bg-state-hover)] hover:text-[color:var(--vp-c-text-1)]"
        >
          <l-icon name="lucide:share"></l-icon> Partager
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent p-1 font-medium hover:bg-[var(--l-color-bg-state-hover)] hover:text-[color:var(--vp-c-text-1)]"
          aria-label="More"
        >
          <l-icon name="lucide:more-horizontal"></l-icon>
        </button>
      </div>
    </div>

    <TreeRedditComment
      v-for="child in comment.children"
      :key="child.id"
      :comment="child"
    />
  </l-tree-item>
</template>
