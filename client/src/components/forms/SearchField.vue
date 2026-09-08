<script setup>
import { Search, X } from "lucide-vue-next";

defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Search..." },
});
const emit = defineEmits(["update:modelValue", "clear"]);
</script>

<template>
  <span class="relative flex items-center">
    <Search class="absolute left-3 w-4 h-4 text-text-500 pointer-events-none" />
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', $event.target.value)"
      class="w-full h-10 rounded-md border-[1.5px] border-background-300 bg-background-50 text-text-900 text-sm pl-9 pr-9 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
    <button
      v-if="modelValue"
      type="button"
      @click="
        emit('update:modelValue', '');
        emit('clear');
      "
      class="absolute right-3 text-text-500 hover:text-text-800">
      <X class="w-4 h-4" />
    </button>
  </span>
</template>
