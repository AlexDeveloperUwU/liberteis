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
                {{ toast.title || $t(`components.toast.titles.${toast.type}`) }}
              </div>
              <div class="text-sm" :class="getMessageClasses(toast.type)">
                {{ toast.message.startsWith('pages.other.errors') ? t(toast.message) : toast.message }}
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
import { useI18n } from "vue-i18n";

const toastStore = useToastStore();
const toastTimers = ref({});
const { t } = useI18n();

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
      return "bg-background-50 dark:bg-background-100 border-secondary-200 dark:border-secondary-300";
    case "error":
      return "bg-background-50 dark:bg-background-100 border-accent-200 dark:border-accent-300";
    case "warning":
      return "bg-background-50 dark:bg-background-100 border-background-300 dark:border-background-400";
    case "info":
    default:
      return "bg-background-50 dark:bg-background-100 border-primary-200 dark:border-primary-300";
  }
};

const getIconClasses = (type) => {
  switch (type) {
    case "success":
      return "text-secondary-600 dark:text-secondary-500";
    case "error":
      return "text-accent-600 dark:text-accent-500";
    case "warning":
      return "text-text-700 dark:text-text-300";
    case "info":
    default:
      return "text-primary-600 dark:text-primary-500";
  }
};

const getTitleClasses = (type) => {
  switch (type) {
    case "success":
      return "text-text-900 dark:text-text-800";
    case "error":
      return "text-text-900 dark:text-text-800";
    case "warning":
      return "text-text-900 dark:text-text-800";
    case "info":
    default:
      return "text-text-900 dark:text-text-800";
  }
};

const getMessageClasses = (type) => {
  switch (type) {
    case "success":
      return "text-text-800 dark:text-text-700";
    case "error":
      return "text-text-800 dark:text-text-700";
    case "warning":
      return "text-text-800 dark:text-text-700";
    case "info":
    default:
      return "text-text-800 dark:text-text-700";
  }
};

const getCloseButtonClasses = (type) => {
  switch (type) {
    case "success":
      return "text-text-700 hover:text-text-900 dark:text-text-700 dark:hover:text-text-900";
    case "error":
      return "text-text-700 hover:text-text-900 dark:text-text-700 dark:hover:text-text-900";
    case "warning":
      return "text-text-700 hover:text-text-900 dark:text-text-700 dark:hover:text-text-900";
    case "info":
    default:
      return "text-text-700 hover:text-text-900 dark:text-text-700 dark:hover:text-text-900";
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
