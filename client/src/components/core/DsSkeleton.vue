<script setup>
const props = defineProps({
  variant: { type: String, default: "block", validator: (v) => ["block", "text", "circle"].includes(v) },
  width: { type: String, default: null },
  height: { type: String, default: null },
  lines: { type: Number, default: 1 },
});

const style = (isLast) => ({
  width: props.width ?? (props.variant === "circle" ? "2.5rem" : isLast ? "70%" : "100%"),
  height: props.height ?? (props.variant === "text" ? "0.875rem" : props.variant === "circle" ? (props.width ?? "2.5rem") : "1rem"),
});
</script>

<template>
  <div v-if="variant === 'text'" class="flex flex-col gap-2">
    <div
      v-for="i in lines"
      :key="i"
      class="rounded-md bg-background-300 animate-pulse"
      :style="style(i === lines)" />
  </div>
  <div v-else class="bg-background-300 animate-pulse" :class="variant === 'circle' ? 'rounded-full' : 'rounded-md'" :style="style(false)" />
</template>
