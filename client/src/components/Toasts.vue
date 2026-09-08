<template>
  <Teleport to="body">
    <div class="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md pointer-events-none">
      <TransitionGroup name="toast-list" tag="div" class="flex flex-col gap-3">
        <div v-for="toast in toastStore.toasts" :key="toast.id" class="pointer-events-auto">
          <DsToast
            :type="toast.type"
            :title="toast.title || t(`components.toast.titles.${toast.type}`)"
            :message="resolveMessage(toast.message)"
            :auto-hide-ms="toast.persistent ? null : toast.duration"
            @close="toastStore.removeToast(toast.id)" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
export default { name: "AppToasts" };
</script>

<script setup>
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import DsToast from "./feedback/DsToast.vue";

const toastStore = useToastStore();
const { t } = useI18n();

const resolveMessage = (message) => (message.startsWith("pages.other.errors") ? t(message) : message);
</script>

<style scoped>
.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
