<template>
  <Teleport to="body">
    <TransitionGroup
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <template v-for="modal in modalStore.modals" :key="modal.id">
        <div class="fixed inset-0 z-50">
          <div
            class="fixed inset-0 bg-background-950/85 dark:bg-background-50/85 transition-opacity duration-300"></div>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div
                class="relative w-full transform rounded-lg bg-background-50 dark:bg-background-100 text-left shadow-xl transition-all duration-300 sm:my-8 opacity-100 scale-100"
                :class="getModalWidth(modal.width)">
                <div class="border-b border-background-200 dark:border-background-300">
                  <div class="flex items-center justify-between p-4">
                    <h3 class="text-lg font-semibold text-text-900 dark:text-text-800">
                      {{ modal.title }}
                    </h3>
                    <button
                      @click="modalStore.removeModal(modal.id)"
                      class="rounded-md p-2 text-text-700 dark:text-text-700 hover:bg-background-100 dark:hover:bg-background-200 hover:text-text-900 dark:hover:text-text-900 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="px-6 py-4">
                  <div class="text-sm text-text-800 dark:text-text-700">
                    {{ modal.content }}
                  </div>
                </div>

                <div class="bg-background-100 dark:bg-background-200 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-2">
                  <template v-if="modal.actions && modal.actions.length">
                    <button
                      v-for="action in modal.actions"
                      :key="action.label"
                      @click="handleAction(action, modal)"
                      :class="getActionButtonClass(action.type)">
                      {{ action.label }}
                    </button>
                  </template>
                  <button
                    v-else
                    @click="modalStore.removeModal(modal.id)"
                    class="inline-flex w-full justify-center rounded-md bg-background-50 dark:bg-background-100 px-3 py-2 text-sm font-semibold text-text-800 dark:text-text-700 shadow-sm ring-1 ring-inset ring-background-300 dark:ring-background-400 hover:bg-background-100 dark:hover:bg-background-200 transition-colors sm:w-auto">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useModalStore } from "@/stores/modalStore";

const modalStore = useModalStore();

const getModalWidth = (width) => {
  const sizes = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  };
  return sizes[width] || sizes.md;
};

const getActionButtonClass = (type) => {
  const classes = {
    primary:
      "bg-primary-600 dark:bg-primary-500 text-text-50 hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors",
    secondary:
      "bg-secondary-600 dark:bg-secondary-500 text-text-50 hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors",
    danger:
      "bg-accent-600 dark:bg-accent-500 text-text-50 hover:bg-accent-700 dark:hover:bg-accent-600 transition-colors",
    default:
      "bg-background-50 dark:bg-background-100 text-text-800 dark:text-text-700 ring-1 ring-inset ring-background-300 dark:ring-background-400 hover:bg-background-100 dark:hover:bg-background-200 transition-colors",
  };
  return `inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${classes[type] || classes.default}`;
};

const handleAction = (action, modal) => {
  if (action.onClick) {
    action.onClick();
  }
  if (!action.keepOpen) {
    modalStore.removeModal(modal.id);
  }
};
</script>
