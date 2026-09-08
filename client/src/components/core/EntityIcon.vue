<script>
export const DEFAULT_ENTITY_ICONS = {
  home: "home",
  users: "users",
  settings: "settings",
  categories: "bookmark",
  locations: "map-pin",
  events: "calendar-days",
  bookings: "calendar-clock",
  spaces: "map-pin",
};
</script>

<script setup>
import { computed } from "vue";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  entity: { type: String, required: true },
  icons: { type: Object, default: () => DEFAULT_ENTITY_ICONS },
  size: { type: Number, default: 20 },
  color: { type: String, default: null },
});

const Icon = computed(() => {
  const name = props.icons[props.entity] ?? "circle";
  return resolveIcon(name) ?? resolveIcon("circle");
});
</script>

<template>
  <component :is="Icon" :size="size" :color="color ?? 'var(--icon-color)'" />
</template>
