<script setup>
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
});
const emit = defineEmits(["update:page"]);
</script>

<template>
  <div class="flex items-center justify-end gap-2 text-sm text-text-body">
    <button
      type="button"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
      class="flex items-center justify-center w-8 h-8 rounded-md bg-background-100 border-[1.5px] border-background-300 hover:bg-background-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
      <ChevronLeft class="w-4 h-4" />
    </button>
    <span>Page {{ page }} of {{ totalPages }}</span>
    <button
      type="button"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
      class="flex items-center justify-center w-8 h-8 rounded-md bg-background-100 border-[1.5px] border-background-300 hover:bg-background-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
