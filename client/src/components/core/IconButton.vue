<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  icon: { type: String, required: true },
  variant: { type: String, default: "plain", validator: (v) => ["plain", "outlined"].includes(v) },
  active: { type: Boolean, default: false },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});

const Icon = computed(() => {
  return resolveIcon(props.icon);
});
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :disabled="disabled"
    class="inline-flex items-center justify-center text-text-800 transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
    :class="[
      variant === 'plain'
        ? 'w-8 h-8 rounded-md hover:bg-background-300'
        : 'w-10 h-10 rounded-lg border-[1.5px] border-primary-400 hover:bg-primary-50',
      active ? 'bg-background-300' : '',
    ]">
    <component :is="Icon" v-if="Icon" class="w-4 h-4" />
  </button>
</template>
