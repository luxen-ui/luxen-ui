<script setup>
import { ref } from 'vue';

const tree = [
  {
    id: 'acme',
    label: 'ACME Holding',
    tag: 'organisation',
    icon: 'lucide:network',
    expanded: true,
    children: [
      { id: 'finance', label: 'Finance', tag: 'direction', icon: 'lucide:landmark' },
      { id: 'rh', label: 'Ressources humaines', tag: 'direction', icon: 'lucide:landmark' },
      {
        id: 'operations',
        label: 'Opérations',
        tag: 'direction',
        icon: 'lucide:landmark',
        expanded: true,
        children: [
          {
            id: 'production',
            label: 'Production',
            tag: 'département',
            icon: 'lucide:landmark',
            expanded: true,
            children: [
              {
                id: 'usine-nord',
                label: 'Usine Nord',
                tag: 'site',
                icon: 'lucide:landmark',
                expanded: true,
                children: [
                  {
                    id: 'assemblage',
                    label: 'Assemblage',
                    tag: 'service',
                    icon: 'lucide:landmark',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const selectedId = ref('acme');

function onSelectionChange(event) {
  selectedId.value = event.detail.selection[0]?.dataset?.id ?? null;
}
</script>

<template>
  <div
    class="vp-raw component-wrapper bg-surface-sunken"
    style="padding-block: 24px; padding-inline: 12px"
  >
    <l-tree
      selection="single"
      style="width: 100%"
      @selection-change="onSelectionChange"
    >
      <TreeActionsNode
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :selected-id="selectedId"
      />
    </l-tree>
  </div>
</template>
