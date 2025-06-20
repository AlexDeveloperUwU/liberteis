import { useModalStore } from "@/stores/modalStore";

export function useModal() {
  const modalStore = useModalStore();

  return {
    confirm: modalStore.confirm,
    info: modalStore.info,
    show: modalStore.addModal,
    remove: modalStore.removeModal,
    clear: modalStore.clearAllModals,
  };
}
