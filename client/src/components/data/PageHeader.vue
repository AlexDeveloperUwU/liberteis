<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
});
</script>

<template>
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 class="font-display font-bold text-3xl text-text-heading mb-2">{{ title }}</h1>
      <p v-if="description" class="text-base text-text-body">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </header>
</template>
