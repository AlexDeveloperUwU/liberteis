<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  icon: { type: String, default: null },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
});

const Icon = computed(() => {
  if (!props.icon) return null;
  return resolveIcon(props.icon);
});
</script>

<template>
  <div class="bg-background-100 border-[1.5px] border-background-300 rounded-lg shadow-md p-4">
    <div class="flex items-center gap-2 text-xs text-text-muted mb-1">
      <component :is="Icon" v-if="Icon" class="w-4 h-4 text-primary-600" />
      <span>{{ label }}</span>
    </div>
    <p class="text-2xl font-bold text-text-title">{{ value }}</p>
  </div>
</template>
