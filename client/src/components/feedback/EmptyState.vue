<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  icon: { type: String, default: "calendar-x" },
  title: { type: String, required: true },
  description: { type: String, default: null },
});

const Icon = computed(() => {
  return resolveIcon(props.icon) ?? resolveIcon("calendar-x");
});
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center py-12 px-6">
    <span class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
      <component :is="Icon" class="w-7 h-7 text-primary-500" />
    </span>
    <p class="text-base font-medium text-text-title">{{ title }}</p>
    <p v-if="description" class="text-sm text-text-muted mt-1">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
