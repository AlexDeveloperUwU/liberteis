<template>
  <Teleport to="body">
    <div class="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="[getToastBaseClasses(), getToastTypeClasses(toast.type)]">
          <div class="flex gap-3">
            <div :class="getIconClasses(toast.type)" class="flex-shrink-0 flex items-center">
              <component :is="getToastIcon(toast.type)" class="w-5 h-5" />
            </div>

            <div class="flex-1 pt-0.5">
              <div v-if="toast.title" class="text-sm font-medium k2d" :class="getTitleClasses(toast.type)">
                {{ toast.title }}
              </div>
              <div class="text-sm" :class="getMessageClasses(toast.type)">
                {{ toast.message }}
              </div>
            </div>

            <button
              @click="toastStore.removeToast(toast.id)"
              class="flex-shrink-0 flex items-start pt-1.5"
              :class="getCloseButtonClasses(toast.type)">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div
            v-if="!toast.persistent && toast.duration > 0"
            class="absolute bottom-0 left-0 h-1 rounded-full"
            :style="{
              width: `${getProgressWidth(toast)}%`,
              transition: `width ${toast.duration}ms linear`,
              backgroundColor: getProgressColor(toast.type),
            }"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, X } from "lucide-vue-next";
import { useToastStore } from "@/stores/toastStore";
import { ref, onMounted } from "vue";

const toastStore = useToastStore();
const toastTimers = ref({});

const getToastIcon = (type) => {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return XCircle;
    case "warning":
      return AlertTriangle;
    case "info":
    default:
      return AlertCircle;
  }
};

const getToastBaseClasses = () => {
  return "pointer-events-auto w-full max-w-md rounded-lg p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] border-[1.5px] relative overflow-hidden transition-all duration-300";
};

const getToastTypeClasses = (type) => {
  switch (type) {
    case "success":
      return "bg-secondary-50 border-secondary-200";
    case "error":
      return "bg-accent-50 border-accent-200";
    case "warning":
      return "bg-background-50 border-background-300";
    case "info":
    default:
      return "bg-primary-50 border-primary-200";
  }
};

const getIconClasses = (type) => {
  switch (type) {
    case "success":
      return "text-secondary-600";
    case "error":
      return "text-accent-600";
    case "warning":
      return "text-text-700";
    case "info":
    default:
      return "text-primary-600";
  }
};

const getTitleClasses = (type) => {
  switch (type) {
    case "success":
      return "text-secondary-800";
    case "error":
      return "text-accent-800";
    case "warning":
      return "text-text-800";
    case "info":
    default:
      return "text-primary-800";
  }
};

const getMessageClasses = (type) => {
  switch (type) {
    case "success":
      return "text-secondary-700";
    case "error":
      return "text-accent-700";
    case "warning":
      return "text-text-700";
    case "info":
    default:
      return "text-primary-700";
  }
};

const getCloseButtonClasses = (type) => {
  switch (type) {
    case "success":
      return "text-secondary-600 hover:text-secondary-800";
    case "error":
      return "text-accent-600 hover:text-accent-800";
    case "warning":
      return "text-text-600 hover:text-text-800";
    case "info":
    default:
      return "text-primary-600 hover:text-primary-800";
  }
};

const getProgressColor = (type) => {
  switch (type) {
    case "success":
      return "var(--secondary-500)";
    case "error":
      return "var(--accent-500)";
    case "warning":
      return "var(--text-600)";
    case "info":
    default:
      return "var(--primary-500)";
  }
};

const getProgressWidth = (toast) => {
  if (!toastTimers.value[toast.id]) {
    toastTimers.value[toast.id] = {
      startTime: Date.now(),
      duration: toast.duration,
    };
    return 100;
  }
  return 0;
};

onMounted(() => {
  return () => {
    Object.values(toastTimers.value).forEach((timer) => {
      if (timer.timeoutId) {
        clearTimeout(timer.timeoutId);
      }
    });
  };
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
