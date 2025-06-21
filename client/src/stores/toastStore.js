import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);
  let nextId = 0;

  const addToast = (toast) => {
    const id = nextId++;
    const newToast = {
      id,
      type: toast.type || "info",
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 2000,
      persistent: toast.persistent || false,
    };

    toasts.value.push(newToast);

    if (!newToast.persistent && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = () => {
    toasts.value = [];
  };

  const success = (message, title = "Éxito", options = {}) => {
    return addToast({
      type: "success",
      title,
      message,
      ...options,
    });
  };

  const error = (message, title = "Error", options = {}) => {
    return addToast({
      type: "error",
      title,
      message,
      ...options,
    });
  };

  const warning = (message, title = "Advertencia", options = {}) => {
    return addToast({
      type: "warning",
      title,
      message,
      ...options,
    });
  };

  const info = (message, title = "Información", options = {}) => {
    return addToast({
      type: "info",
      title,
      message,
      ...options,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
});
