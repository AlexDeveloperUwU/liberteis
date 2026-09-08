<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  tone: {
    type: String,
    default: "primary",
    validator: (v) => ["primary", "danger", "success", "neutral", "warning"].includes(v),
  },
  icon: { type: String, default: null },
  as: { type: String, default: "span" },
});

const toneClasses = {
  primary: "bg-primary-100 text-primary-800 border-primary-200",
  danger: "bg-accent-100 text-accent-800 border-accent-200",
  success: "bg-secondary-100 text-secondary-800 border-secondary-200",
  neutral: "bg-background-200 text-text-700 border-background-300",
  warning: "bg-warning-100 text-warning-800 border-warning-200",
};

const Icon = computed(() => {
  if (!props.icon) return null;
  return resolveIcon(props.icon);
});
</script>

<template>
  <component
    :is="as"
    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
    :class="[toneClasses[tone], as === 'button' ? 'cursor-pointer hover:opacity-80 transition-opacity' : '']">
    <component :is="Icon" v-if="Icon" class="w-3 h-3" />
    <slot />
  </component>
</template>
