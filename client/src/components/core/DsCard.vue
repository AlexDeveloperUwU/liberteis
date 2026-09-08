<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  title: { type: String, default: null },
  icon: { type: String, default: null },
  padding: { type: String, default: "lg", validator: (v) => ["lg", "md", "none"].includes(v) },
  interactive: { type: Boolean, default: false },
});

const Icon = computed(() => {
  if (!props.icon) return null;
  return resolveIcon(props.icon);
});

const paddingClass = { lg: "p-6", md: "p-4", none: "" };
</script>

<template>
  <section
    class="bg-background-100 border-[1.5px] border-background-300 rounded-lg shadow-card transition-all duration-200"
    :class="interactive ? 'hover:shadow-card-hover hover:border-primary-400 hover:-translate-y-0.5' : ''">
    <header v-if="title" class="flex items-center justify-between px-6 pt-6 pb-4 border-b-[1.5px] border-background-300">
      <div class="flex items-center gap-2">
        <span v-if="Icon" class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
          <component :is="Icon" class="w-4 h-4 text-primary-600" />
        </span>
        <h2 class="font-display font-bold text-xl text-text-heading">{{ title }}</h2>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div :class="paddingClass[padding]">
      <slot />
    </div>
  </section>
</template>
