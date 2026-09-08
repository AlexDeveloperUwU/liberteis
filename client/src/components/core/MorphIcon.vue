<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  icon: { type: String, required: true },
  size: { type: Number, default: 20 },
  color: { type: String, default: null },
  strokeWidth: { type: Number, default: 2 },
  duration: { type: Number, default: 220 },
});

const Icon = computed(() => {
  return resolveIcon(props.icon) ?? resolveIcon("circle");
});
</script>

<template>
  <transition
    mode="out-in"
    :enter-active-class="`transition-all ease`"
    :style="{ transitionDuration: `${duration}ms` }"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100">
    <component :is="Icon" :key="icon" :size="size" :color="color ?? 'var(--icon-color)'" :stroke-width="strokeWidth" />
  </transition>
</template>
