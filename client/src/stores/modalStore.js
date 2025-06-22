import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalStore = defineStore("modalStore", () => {
  const modals = ref([]);

  const addModal = (modal) => {
    const id = Date.now().toString();
    modals.value.push({
      id,
      ...modal,
    });
    return id;
  };

  const removeModal = (id) => {
    if (id) {
      modals.value = modals.value.filter((modal) => modal.id !== id);
    } else {
      modals.value = [];
    }
  };

  const clearAllModals = () => {
    modals.value = [];
  };

  const confirm = (options = {}) => {
    return addModal({
      type: "confirm",
      title: options.title || "Confirmar",
      content: options.content || "¿Está seguro de realizar esta acción?",
      actions: options.actions || [
        {
          label: options.confirmText || "Confirmar",
          type: options.confirmType || "primary",
          onClick: options.onConfirm,
        },
        {
          label: options.cancelText || "Cancelar",
          type: "default",
          onClick: options.onCancel,
        },
      ],
      width: options.width || "md",
    });
  };

  const info = (content, title = "Información", options = {}) => {
    return addModal({
      type: "info",
      title,
      content,
      ...options,
    });
  };

  const showBookingDetails = (data, title = "Detalles de la Reserva", options = {}) => {
    console.log("Modal store received bookingId:", data.bookingId);
    return addModal({
      type: "bookingDetails",
      title,
      data,
      width: "xl",
      ...options,
    });
  };

  return {
    modals,
    addModal,
    removeModal,
    clearAllModals,
    confirm,
    info,
    showBookingDetails,
  };
});
