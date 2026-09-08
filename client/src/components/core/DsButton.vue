<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (v) => ["primary", "soft", "neutral", "danger", "dangerSoft", "success", "successSoft"].includes(v),
  },
  size: { type: String, default: "md", validator: (v) => ["md", "sm"].includes(v) },
  icon: { type: String, default: null },
  iconRight: { type: String, default: null },
  fullWidth: { type: Boolean, default: false },
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
});

const variantClasses = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white border-transparent",
  soft: "bg-primary-100 hover:bg-primary-200 text-primary-800 border-primary-200",
  neutral: "bg-background-100 hover:bg-background-200 text-text-800 border-background-300",
  danger: "bg-accent-600 hover:bg-accent-700 text-white border-transparent",
  dangerSoft: "bg-accent-100 hover:bg-accent-200 text-accent-800 border-accent-200",
  success: "bg-secondary-600 hover:bg-secondary-700 text-white border-transparent",
  successSoft: "bg-secondary-100 hover:bg-secondary-200 text-secondary-800 border-secondary-200",
};

const iconComponent = (name) => {
  if (!name) return null;
  return resolveIcon(name);
};

const IconLeft = computed(() => iconComponent(props.icon));
const IconRight = computed(() => iconComponent(props.iconRight));
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    :class="[
      variantClasses[variant],
      size === 'md' ? 'h-10 px-4 text-sm' : 'h-8 px-3 text-sm',
      fullWidth ? 'w-full' : '',
    ]">
    <component :is="IconLeft" v-if="IconLeft" class="w-4 h-4" />
    <slot />
    <component :is="IconRight" v-if="IconRight" class="w-4 h-4" />
  </button>
</template>
