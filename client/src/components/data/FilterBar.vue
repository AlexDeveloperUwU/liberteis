<script setup>
import SearchField from "../forms/SearchField.vue";
import DsPill from "../core/DsPill.vue";

defineProps({
  searchValue: { type: String, default: "" },
  searchPlaceholder: { type: String, default: "Search..." },
  chips: { type: Array, default: () => [] }, // { label, icon }
  resultsText: { type: String, default: null },
});
const emit = defineEmits(["update:searchValue", "clearAll"]);
</script>

<template>
  <div class="flex flex-col gap-3 mb-4">
    <div class="flex flex-wrap items-center gap-3">
      <SearchField
        :model-value="searchValue"
        :placeholder="searchPlaceholder"
        class="max-w-xs"
        @update:model-value="(v) => emit('update:searchValue', v)" />
      <slot name="filters" />
      <div class="flex-1" />
      <slot name="actions" />
    </div>
    <div v-if="chips.length || resultsText" class="flex flex-wrap items-center gap-2">
      <DsPill v-for="(chip, i) in chips" :key="i" tone="neutral" :icon="chip.icon">{{ chip.label }}</DsPill>
      <DsPill v-if="chips.length" as="button" tone="danger" icon="x" @click="emit('clearAll')">Clear filters</DsPill>
      <span v-if="resultsText" class="ml-auto text-sm text-text-muted">{{ resultsText }}</span>
    </div>
  </div>
</template>
