<script setup>
import { computed, useAttrs } from "vue";
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

// as="span" (the default) with a @click passed in isn't a native interactive element,
// so it needs role/tabindex/keyboard wiring itself — as="button"/"a" already get that for free.
const attrs = useAttrs();
const isClickableNonNative = computed(() => props.as !== "button" && props.as !== "a" && !!attrs.onClick);

function onKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  attrs.onClick?.(event);
}
</script>

<template>
  <component
    :is="as"
    :role="isClickableNonNative ? 'button' : undefined"
    :tabindex="isClickableNonNative ? 0 : undefined"
    @keydown="isClickableNonNative ? onKeydown : undefined"
    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
    :class="[
      toneClasses[tone],
      as === 'button' || isClickableNonNative ? 'cursor-pointer hover:opacity-80 transition-opacity' : '',
    ]">
    <component :is="Icon" v-if="Icon" class="w-3 h-3" />
    <slot />
  </component>
</template>
