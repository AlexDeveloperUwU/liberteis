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
                class="relative w-full transform rounded-lg bg-background-50 dark:bg-background-100 text-left shadow-xl transition-all duration-300 sm:my-8 opacity-100 scale-100 border border-background-200 dark:border-background-300 overflow-hidden"
                :class="getModalWidth(modal.width)">
                <div class="">
                  <div class="flex items-center justify-between p-4">
                    <h3 class="text-lg font-semibold text-text-900 dark:text-text-800">
                      {{ modal.titleKey ? $t(modal.titleKey) : modal.title }}
                    </h3>
                    <button
                      @click="modalStore.removeModal(modal.id)"
                      class="rounded-md p-2 text-text-700 dark:text-text-700 hover:bg-background-100 dark:hover:bg-background-200 hover:text-text-900 dark:hover:text-text-900 transition-colors cursor-pointer">
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

                <div v-if="modal.type === 'bookingDetails'" class="px-6 py-4">
                  <div class="text-sm text-text-800 dark:text-text-700 space-y-4">
                    <div v-if="modal.data?.coverUrl" class="mb-4">
                      <div class="flex flex-col items-center">
                        <div
                          class="relative overflow-hidden bg-background-200 dark:bg-background-300"
                          style="max-width: 15%; height: auto">
                          <img
                            :src="modal.data.coverUrl"
                            alt="Imagen del evento"
                            class="w-full object-contain aspect-9/16" />
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.event") }}
                        </p>
                        <p class="text-text-900 font-medium">
                          {{ modal.data?.eventName || $t("components.modals.common.notAvailable") }}
                        </p>
                      </div>
                    </div>

                    <div v-if="modal.data?.eventDescription" class="flex items-start p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3 mt-1 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.description") }}
                        </p>
                        <p class="text-text-900 whitespace-pre-wrap wrap-break-word">
                          {{ modal.data?.eventDescription }}
                        </p>
                      </div>
                    </div>

                    <div
                      v-if="!modal.data?.coverUrl && modal.data?.eventDescription"
                      class="flex items-start p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3 mt-1 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.description") }}
                        </p>
                        <p class="text-text-900 whitespace-pre-wrap wrap-break-word">
                          {{ modal.data?.eventDescription }}
                        </p>
                      </div>
                    </div>

                    <div v-if="modal.data?.bookingInfo" class="flex items-start p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3 mt-1 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.additionalInfo") }}
                        </p>
                        <p class="text-text-900 whitespace-pre-wrap wrap-break-word">
                          {{ modal.data?.bookingInfo }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.dateTime") }}
                        </p>
                        <p class="text-text-900 font-medium">
                          {{ modal.data?.dateTime || $t("components.modals.common.notAvailable") }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.duration") }}
                        </p>
                        <p class="text-text-900 font-medium">
                          {{ modal.data?.duration || $t("components.modals.common.notAvailable") }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.space") }}
                        </p>
                        <p class="text-text-900 font-medium">
                          {{ modal.data?.space || $t("components.modals.common.notAvailable") }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.category") }}
                        </p>
                        <p class="text-text-900 font-medium">
                          {{ modal.data?.category || $t("components.modals.common.notAvailable") }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center p-3 bg-background-100">
                      <div class="bg-primary-100 p-2 rounded-full border-primary-300 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-5 h-5 text-primary-700">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs text-text-600">
                          {{ $t("components.modals.bookingDetails.bookedBy") }}
                        </p>
                        <p class="text-text-900 font-medium">
                          {{ modal.data?.bookedBy || $t("components.modals.common.notAvailable") }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="px-6 py-4">
                  <div class="text-sm text-text-800 dark:text-text-700">
                    {{ modal.content }}
                  </div>
                </div>

                <div class="bg-background-100 dark:bg-background-200 px-6 py-4 sm:flex sm:flex-row sm:gap-2">
                  <div class="w-full sm:w-auto sm:ml-auto flex gap-2 justify-end">
                    <template v-if="modal.actions && modal.actions.length">
                      <button
                        v-for="action in modal.actions"
                        :key="action.label"
                        @click="handleAction(action, modal)"
                        :class="getActionButtonClass(action.type) + ' cursor-pointer'">
                        {{ action.label }}
                      </button>
                    </template>
                    <button
                      v-else
                      @click="modalStore.removeModal(modal.id)"
                      class="inline-flex justify-center rounded-md bg-background-50 dark:bg-background-100 px-3 py-2 text-sm font-semibold text-text-800 dark:text-text-700 shadow-sm ring-1 ring-inset ring-background-300 dark:ring-background-400 hover:bg-background-100 dark:hover:bg-background-200 transition-colors sm:w-auto cursor-pointer">
                      {{ $t("components.modals.common.close") }}
                    </button>
                  </div>

                  <div
                    v-if="modal.type === 'bookingDetails' && modal.data?.bookingId"
                    class="w-full sm:w-auto mb-2 sm:mb-0 sm:mr-auto flex gap-2 flex-col sm:flex-row">
                    <button
                      @click="navigateToBookingEdit(modal.data.bookingId)"
                      class="inline-flex justify-center rounded-md bg-primary-600 dark:bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors w-full sm:w-auto cursor-pointer mb-2 sm:mb-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4 mr-2">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                      {{ $t("components.modals.bookingDetails.edit") }}
                    </button>
                    <button
                      v-if="modal.data?.isActive && modal.data?.onDeactivate"
                      @click="modal.data.onDeactivate(modal.id)"
                      class="inline-flex justify-center rounded-md bg-accent-600 dark:bg-accent-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-700 dark:hover:bg-accent-600 transition-colors w-full sm:w-auto cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4 mr-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {{ $t("components.modals.bookingDetails.deactivate") }}
                    </button>
                  </div>
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
import { useRouter } from "vue-router";

const modalStore = useModalStore();
const router = useRouter();

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
  return `inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${
    classes[type] || classes.default
  }`;
};

const handleAction = async (action, modal) => {
  if (action.onClick) {
    try {
      await action.onClick(modal.id);
      if (!action.keepOpen) {
        modalStore.removeModal(modal.id);
      }
    } catch (e) {}
  } else {
    modalStore.removeModal(modal.id);
  }
};

const navigateToBookingEdit = (bookingId) => {
  if (!bookingId) return;
  modalStore.removeModal();
  router.push({ name: "dashBookingsEdit", params: { id: bookingId } });
};
</script>
