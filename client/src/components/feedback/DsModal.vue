<script setup>
import { X } from "lucide-vue-next";
import DsButton from "../core/DsButton.vue";

defineProps({
  open: { type: Boolean, default: true },
  title: { type: String, default: null },
  width: { type: String, default: "md", validator: (v) => ["sm", "md", "lg", "xl", "2xl"].includes(v) },
  actions: { type: Array, default: () => [] }, // { label, type, onClick }
  inline: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const widthClass = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl" };
const actionVariant = { default: "neutral", primary: "primary", danger: "danger", secondary: "successSoft" };
</script>

<template>
  <transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-to-class="opacity-0">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      :class="inline ? '' : 'bg-black/70'"
      @click.self="!inline && emit('close')">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-95">
        <div v-if="open" class="w-full bg-background-100 border-[1.5px] border-background-300 rounded-lg shadow-xl" :class="widthClass[width]">
          <header v-if="title" class="flex items-center justify-between px-6 py-4 border-b-[1.5px] border-background-300">
            <h2 class="font-display font-bold text-xl text-text-heading">{{ title }}</h2>
            <button type="button" @click="emit('close')" class="text-text-500 hover:text-text-800">
              <X class="w-5 h-5" />
            </button>
          </header>
          <div class="p-6">
            <slot />
          </div>
          <footer v-if="actions.length" class="flex items-center justify-end gap-2 px-6 py-4 border-t-[1.5px] border-background-300">
            <DsButton
              v-for="(action, i) in actions"
              :key="i"
              :variant="actionVariant[action.type ?? 'default']"
              @click="action.onClick && action.onClick()">
              {{ action.label }}
            </DsButton>
          </footer>
        </div>
      </transition>
    </div>
  </transition>
</template>
