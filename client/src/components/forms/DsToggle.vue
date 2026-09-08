<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: null },
  description: { type: String, default: null },
  icon: { type: String, default: null },
});
const emit = defineEmits(["update:modelValue"]);

const Icon = computed(() => {
  if (!props.icon) return null;
  return resolveIcon(props.icon);
});

const toggle = () => emit("update:modelValue", !props.modelValue);
</script>

<template>
  <div v-if="label" class="flex items-start justify-between gap-4 py-1">
    <div class="flex items-start gap-3">
      <component :is="Icon" v-if="Icon" class="w-5 h-5 text-primary-600 mt-0.5" />
      <div>
        <p class="text-sm font-medium text-text-label">{{ label }}</p>
        <p v-if="description" class="text-xs text-text-muted mt-0.5">{{ description }}</p>
      </div>
    </div>
    <button
      role="switch"
      :aria-checked="modelValue"
      type="button"
      @click="toggle"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200"
      :class="modelValue ? 'bg-primary-500' : 'bg-background-300'">
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'" />
    </button>
  </div>
  <button
    v-else
    role="switch"
    :aria-checked="modelValue"
    type="button"
    @click="toggle"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200"
    :class="modelValue ? 'bg-primary-500' : 'bg-background-300'">
    <span
      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
      :class="modelValue ? 'translate-x-6' : 'translate-x-1'" />
  </button>
</template>
