<script setup>
import { computed, ref } from "vue";
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-vue-next";
import { resolveIcon } from "../icons.js";

// Attrs like autocomplete/name/maxlength must land on the actual <input>, not on the
// component's root <label> — forward them explicitly instead of relying on fallthrough.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  label: { type: String, default: null },
  icon: { type: String, default: null },
  error: { type: String, default: null },
  valid: { type: Boolean, default: false },
  hint: { type: String, default: null },
  required: { type: Boolean, default: false },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: null },
  disabled: { type: Boolean, default: false },
});

defineEmits(["update:modelValue"]);

const LeftIcon = computed(() => {
  if (!props.icon) return null;
  return resolveIcon(props.icon);
});

// type="password" gets a built-in show/hide toggle instead of the valid/error glyph —
// every form that needed this used to reimplement it externally with its own ref.
const isPasswordField = computed(() => props.type === "password");
const revealed = ref(false);
const effectiveType = computed(() => (isPasswordField.value && revealed.value ? "text" : props.type));
</script>

<template>
  <label class="block">
    <span v-if="label" class="block text-sm font-medium text-text-label mb-1.5">
      {{ label }}<span v-if="required" class="text-accent-600"> *</span>
    </span>
    <span class="relative flex items-center">
      <component :is="LeftIcon" v-if="LeftIcon" class="absolute left-3 w-4 h-4 text-text-500 pointer-events-none" />
      <input
        v-bind="$attrs"
        :type="effectiveType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full h-10 rounded-md border-[1.5px] bg-background-50 text-text-900 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
        :class="[
          LeftIcon ? 'pl-9' : 'pl-3',
          error ? 'border-accent-500 ring-1 ring-accent-300 pr-9' : valid || isPasswordField ? 'border-background-300 pr-9' : 'border-background-300 pr-3',
        ]" />
      <!-- ponytail: aria-label hardcoded in English (not visible text); wire to i18n if that's ever needed -->
      <button
        v-if="isPasswordField"
        type="button"
        tabindex="-1"
        :aria-label="revealed ? 'Hide password' : 'Show password'"
        class="absolute right-3 text-text-500 hover:text-text-800"
        @click="revealed = !revealed">
        <component :is="revealed ? EyeOff : Eye" class="w-4 h-4" />
      </button>
      <XCircle v-else-if="error" class="absolute right-3 w-4 h-4 text-accent-500" />
      <CheckCircle2 v-else-if="valid" class="absolute right-3 w-4 h-4 text-primary-500" />
    </span>
    <p v-if="error" class="mt-1 text-xs text-accent-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-text-muted">{{ hint }}</p>
  </label>
</template>
