import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const toastStore = useToastStore()

  return {
    success: toastStore.success,
    error: toastStore.error,
    warning: toastStore.warning,
    info: toastStore.info,
    show: toastStore.addToast,
    remove: toastStore.removeToast,
    clear: toastStore.clearAllToasts
  }
}
