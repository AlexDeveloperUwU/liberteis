<script setup>
defineProps({
  tone: { type: String, default: "active", validator: (v) => ["active", "idle", "success", "error"].includes(v) },
  size: { type: Number, default: 8 },
  label: { type: String, default: null },
});

const toneClasses = {
  active: "bg-primary-500",
  idle: "bg-background-400",
  success: "bg-secondary-500",
  error: "bg-accent-500",
};
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span class="inline-block rounded-full" :class="toneClasses[tone]" :style="{ width: `${size}px`, height: `${size}px` }" />
    <span v-if="label" class="text-sm text-text-body">{{ label }}</span>
  </span>
</template>
