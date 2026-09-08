<script setup>
import { computed } from "vue";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { Check, ChevronDown, XCircle } from "lucide-vue-next";
import { resolveIcon } from "../icons.js";

const props = defineProps({
  label: { type: String, default: null },
  icon: { type: String, default: null },
  options: { type: Array, required: true }, // { value, label, icon }
  modelValue: { type: String, default: null },
  placeholder: { type: String, default: "Select..." },
  error: { type: [Boolean, String], default: false },
  width: { type: String, default: "100%" },
});
const emit = defineEmits(["update:modelValue"]);

const LeftIcon = computed(() => resolveIcon(props.icon));

const optionIcon = (name) => resolveIcon(name);

const selectedLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label ?? props.placeholder);
</script>

<template>
  <div :style="{ width }">
    <span v-if="label" class="block text-sm font-medium text-text-label mb-1.5">{{ label }}</span>
    <Listbox :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)">
      <div class="relative">
        <ListboxButton
          class="relative w-full h-10 rounded-md border-[1.5px] bg-background-50 text-sm text-left pl-3 pr-9 flex items-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :class="error ? 'border-accent-500 ring-1 ring-accent-300' : 'border-background-300'">
          <component :is="LeftIcon" v-if="LeftIcon" class="w-4 h-4 text-text-500 shrink-0" />
          <span class="truncate" :class="modelValue ? 'text-text-900' : 'text-text-500'">{{ selectedLabel }}</span>
          <XCircle v-if="error" class="absolute right-3 w-4 h-4 text-accent-500" />
          <ChevronDown v-else class="absolute right-3 w-4 h-4 text-text-500" />
        </ListboxButton>
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95">
          <ListboxOptions
            class="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-background-100 border-[1.5px] border-background-300 shadow-lg focus:outline-none py-1">
            <ListboxOption v-for="opt in options" :key="opt.value" :value="opt.value" v-slot="{ active, selected }">
              <div
                class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-l-[3px] border-transparent"
                :class="
                  selected
                    ? 'bg-primary-100 border-l-primary-500 font-medium text-primary-700'
                    : active
                      ? 'border-l-primary-300 text-primary-600 bg-primary-50'
                      : 'text-text-800'
                ">
                <component :is="optionIcon(opt.icon)" v-if="opt.icon" class="w-4 h-4" />
                <span class="flex-1 truncate">{{ opt.label }}</span>
                <Check v-if="selected" class="w-4 h-4" />
              </div>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <p v-if="typeof error === 'string' && error" class="mt-1 text-xs text-accent-600">{{ error }}</p>
  </div>
</template>
