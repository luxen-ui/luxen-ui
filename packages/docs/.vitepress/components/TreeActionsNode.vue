<script setup>
defineOptions({ name: 'TreeActionsNode' });
defineProps({
  node: { type: Object, required: true },
  selectedId: { type: [String, null], default: null },
});
</script>

<template>
  <l-tree-item
    :data-id="node.id"
    :selected="selectedId === node.id || null"
    :expanded="node.expanded || null"
  >
    <l-icon
      slot="prefix"
      :name="node.icon"
    />
    {{ node.label }}
    <span
      v-if="node.tag"
      class="tree-tag"
      >{{ node.tag }}</span
    >

    <l-dropdown
      v-if="selectedId === node.id"
      placement="bottom-start"
    >
      <button
        slot="trigger"
        class="inline-flex items-center justify-center w-7 h-6 rounded-md bg-yellow-300 hover:bg-yellow-400 text-yellow-900 cursor-pointer"
        aria-label="Actions"
      >
        <l-icon name="lucide:ellipsis" />
      </button>
      <l-dropdown-item>
        Ajouter un service
        <l-icon
          slot="suffix"
          name="lucide:plus"
        />
      </l-dropdown-item>
      <l-dropdown-item>
        Renommer « {{ node.label }} »
        <l-icon
          slot="suffix"
          name="lucide:type"
        />
      </l-dropdown-item>
      <l-dropdown-item>
        Modifier le niveau
        <l-icon
          slot="suffix"
          name="lucide:pencil"
        />
      </l-dropdown-item>
      <l-dropdown-item>
        Déplacer vers…
        <l-icon
          slot="suffix"
          name="lucide:corner-down-right"
        />
      </l-dropdown-item>
      <l-dropdown-item disabled>
        Supprimer
        <l-icon
          slot="suffix"
          name="lucide:trash-2"
        />
      </l-dropdown-item>
    </l-dropdown>

    <TreeActionsNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :selected-id="selectedId"
    />
  </l-tree-item>
</template>

<style scoped>
.tree-tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0 0.25rem;
  margin-inline: 0.125rem;
  border-radius: 0.25rem;
  color: rgb(194 65 12);
  background: rgb(255 237 213);
}
</style>
