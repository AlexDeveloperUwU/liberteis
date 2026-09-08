<template>
  <Teleport to="body">
    <TransitionGroup
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <DsModal
        v-for="modal in modalStore.modals"
        :key="modal.id"
        :title="modal.titleKey ? $t(modal.titleKey) : modal.title"
        :width="modal.width || 'md'"
        :actions="actionsFor(modal)"
        @close="modalStore.removeModal(modal.id)">
        <div v-if="modal.type === 'bookingDetails'" class="space-y-4">
          <div v-if="modal.data?.coverUrl" class="flex justify-center mb-2">
            <img
              :src="modal.data.coverUrl"
              :alt="$t('components.modals.common.eventImageAlt')"
              class="max-w-[15%] object-contain aspect-9/16 bg-background-200" />
          </div>

          <InfoRow icon="calendar-days" :label="$t('components.modals.bookingDetails.event')" :value="modal.data?.eventName ?? notAvailable" />
          <InfoRow
            v-if="modal.data?.eventDescription"
            icon="file-text"
            align="start"
            :label="$t('components.modals.bookingDetails.description')"
            :value="modal.data.eventDescription" />
          <InfoRow
            v-if="modal.data?.bookingInfo"
            icon="clipboard-list"
            align="start"
            :label="$t('components.modals.bookingDetails.additionalInfo')"
            :value="modal.data.bookingInfo" />
          <InfoRow icon="clock" :label="$t('components.modals.bookingDetails.dateTime')" :value="modal.data?.dateTime ?? notAvailable" />
          <InfoRow icon="clock" :label="$t('components.modals.bookingDetails.duration')" :value="modal.data?.duration ?? notAvailable" />
          <InfoRow icon="map-pin" :label="$t('components.modals.bookingDetails.space')" :value="modal.data?.space ?? notAvailable" />
          <InfoRow icon="bookmark" :label="$t('components.modals.bookingDetails.category')" :value="modal.data?.category ?? notAvailable" />
          <InfoRow icon="user" :label="$t('components.modals.bookingDetails.bookedBy')" :value="modal.data?.bookedBy ?? notAvailable" />
        </div>
        <p v-else class="text-sm text-text-body">{{ modal.content }}</p>
      </DsModal>
    </TransitionGroup>
  </Teleport>
</template>

<script>
export default { name: "AppModals" };
</script>

<script setup>
import { computed } from "vue";
import { useModalStore } from "@/stores/modalStore";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import DsModal from "./feedback/DsModal.vue";
import InfoRow from "./data/InfoRow.vue";

const modalStore = useModalStore();
const router = useRouter();
const { t } = useI18n();

const notAvailable = computed(() => t("components.modals.common.notAvailable"));

const navigateToBookingEdit = (bookingId) => {
  if (!bookingId) return;
  modalStore.removeModal();
  router.push({ name: "dashBookingsEdit", params: { id: bookingId } });
};

const handleAction = async (action, modal) => {
  if (action.onClick) {
    try {
      await action.onClick(modal.id);
      if (!action.keepOpen) modalStore.removeModal(modal.id);
    } catch {
      /* Ignore action errors, modal stays open for the user to retry */
    }
  } else {
    modalStore.removeModal(modal.id);
  }
};

const actionsFor = (modal) => {
  const actions = [];

  if (modal.type === "bookingDetails" && modal.data?.bookingId) {
    actions.push({
      label: t("components.modals.bookingDetails.edit"),
      type: "primary",
      onClick: () => navigateToBookingEdit(modal.data.bookingId),
    });
    if (modal.data?.isActive && modal.data?.onDeactivate) {
      actions.push({
        label: t("components.modals.bookingDetails.deactivate"),
        type: "danger",
        onClick: () => modal.data.onDeactivate(modal.id),
      });
    }
  }

  if (modal.actions?.length) {
    actions.push(...modal.actions.map((action) => ({ ...action, onClick: () => handleAction(action, modal) })));
  } else {
    actions.push({ label: t("components.modals.common.close"), type: "default", onClick: () => modalStore.removeModal(modal.id) });
  }

  return actions;
};
</script>
