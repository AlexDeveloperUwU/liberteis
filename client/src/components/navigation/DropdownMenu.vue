<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { resolveIcon } from "../icons.js";

defineProps({
  items: { type: Array, required: true }, // { label, icon, tone, selected, onClick }
  align: { type: String, default: "right" },
  width: { type: String, default: "12rem" },
});

const itemIcon = (name) => {
  if (!name) return null;
  return resolveIcon(name);
};
</script>

<template>
  <Menu as="div" class="relative inline-block text-left">
    <MenuButton as="template">
      <slot name="trigger" />
    </MenuButton>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95">
      <MenuItems
        class="absolute mt-2 origin-top-right rounded-md bg-background-100 border-[1.5px] border-background-300 shadow-lg focus:outline-none py-1 z-20"
        :class="align === 'right' ? 'right-0' : 'left-0'"
        :style="{ width }">
        <MenuItem v-for="(item, i) in items" :key="i" v-slot="{ active }">
          <button
            type="button"
            @click="item.onClick && item.onClick()"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-l-[3px] border-transparent transition-colors duration-150"
            :class="[
              item.tone === 'danger' ? 'text-accent-600' : item.selected ? 'bg-primary-100 border-l-primary-500 text-primary-700 font-medium' : 'text-text-800',
              active && !item.selected ? 'border-l-primary-300 bg-primary-50' : '',
            ]">
            <component :is="itemIcon(item.icon)" v-if="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>
