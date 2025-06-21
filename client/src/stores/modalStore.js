import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalStore = defineStore("modal", () => {
  const modals = ref([]);
  let nextId = 0;

  const addModal = (modal) => {
    const id = nextId++;
    const newModal = {
      id,
      type: modal.type || "info",
      title: modal.title,
      content: modal.content,
      persistent: modal.persistent || false,
      width: modal.width || "md",
      actions: modal.actions || [],
    };

    modals.value.push(newModal);
    return id;
  };

  const removeModal = (id) => {
    const index = modals.value.findIndex((modal) => modal.id === id);
    if (index !== -1) {
      modals.value.splice(index, 1);
    }
  };

  const clearAllModals = () => {
    modals.value = [];
  };

  const confirm = (content, title = "Confirmar", options = {}) => {
    return addModal({
      type: "confirm",
      title,
      content,
      ...options,
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

  return {
    modals,
    addModal,
    removeModal,
    clearAllModals,
    confirm,
    info,
  };
});
