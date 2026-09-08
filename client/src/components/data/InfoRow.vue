<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  icon: { type: String, default: null },
  label: { type: String, required: true },
  value: { type: [String, Number], default: "Not available" },
  align: { type: String, default: "center", validator: (v) => ["center", "start"].includes(v) },
  bubble: { type: Boolean, default: true },
});

const Icon = computed(() => {
  if (!props.icon) return null;
  return resolveIcon(props.icon);
});
</script>

<template>
  <div class="flex gap-3" :class="align === 'start' ? 'items-start' : 'items-center'">
    <span
      v-if="Icon"
      class="flex items-center justify-center w-8 h-8 shrink-0"
      :class="bubble ? 'rounded-full bg-primary-100' : ''">
      <component :is="Icon" class="w-4 h-4 text-primary-600" />
    </span>
    <div class="min-w-0">
      <p class="text-xs text-text-muted">{{ label }}</p>
      <p class="text-text-900 font-medium truncate">{{ value }}</p>
    </div>
  </div>
</template>
