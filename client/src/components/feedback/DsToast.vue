<script setup>
import { nextTick, onMounted, ref } from "vue";
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, X } from "lucide-vue-next";

const props = defineProps({
  type: { type: String, default: "info", validator: (v) => ["success", "error", "warning", "info"].includes(v) },
  title: { type: String, default: null },
  message: { type: String, required: true },
  /** Auto-closes after this many ms and drains the progress bar over the same span. Omit for a persistent toast (no bar). */
  autoHideMs: { type: Number, default: null },
});
const emit = defineEmits(["close"]);

const typeMeta = {
  success: { icon: CheckCircle, border: "border-secondary-500", text: "text-secondary-600", bar: "bg-secondary-500", title: "Success" },
  error: { icon: XCircle, border: "border-accent-500", text: "text-accent-600", bar: "bg-accent-500", title: "Error" },
  warning: { icon: AlertTriangle, border: "border-warning-500", text: "text-warning-600", bar: "bg-warning-500", title: "Warning" },
  info: { icon: AlertCircle, border: "border-primary-500", text: "text-primary-600", bar: "bg-primary-500", title: "Information" },
};

const meta = typeMeta[props.type];
const closing = ref(false);
const barWidth = ref(100);

const close = () => {
  closing.value = true;
  setTimeout(() => emit("close"), 300);
};

onMounted(async () => {
  if (!props.autoHideMs) return;
  await nextTick();
  barWidth.value = 0;
  setTimeout(close, props.autoHideMs);
});

defineExpose({ close });
</script>

<template>
  <div
    class="relative w-80 bg-background-100 border-[1.5px] rounded-lg shadow-xl overflow-hidden"
    :class="meta.border"
    :style="{ animation: closing ? 'ds-toast-out 300ms ease forwards' : 'ds-toast-in 300ms ease' }">
    <div class="flex items-start gap-3 p-4">
      <component :is="meta.icon" class="w-5 h-5 shrink-0 mt-0.5" :class="meta.text" :style="type === 'success' ? { animation: 'ds-pop-in 300ms cubic-bezier(0.34,1.56,0.64,1)' } : {}" />
      <div class="flex-1 min-w-0">
        <p class="font-display font-bold text-sm text-text-heading">{{ title ?? meta.title }}</p>
        <p class="text-sm text-text-body mt-0.5">{{ message }}</p>
      </div>
      <button type="button" @click="close" class="text-text-500 hover:text-text-800 shrink-0">
        <X class="w-4 h-4" />
      </button>
    </div>
    <div
      v-if="autoHideMs"
      class="absolute bottom-0 left-0 h-1"
      :class="meta.bar"
      :style="{ width: `${barWidth}%`, transition: `width ${autoHideMs}ms linear` }" />
  </div>
</template>
