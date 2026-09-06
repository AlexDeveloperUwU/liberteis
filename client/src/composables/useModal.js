import { useModalStore } from "@/stores/modalStore";

export function useModal() {
  const modalStore = useModalStore();

  return {
    confirm: (content, title, options = {}) => {
      modalStore.confirm(content, title, {
        ...options,
        actions: options.actions?.map((action) => ({
          ...action,
          onClick: action.onClick,
        })),
      });
    },
    info: modalStore.info,
    show: modalStore.addModal,
    remove: modalStore.removeModal,
    clear: modalStore.clearAllModals,
    showBookingDetails: modalStore.showBookingDetails,
  };
}
