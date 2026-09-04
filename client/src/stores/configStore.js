import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useConfigStore = defineStore("config", () => {
  const configs = ref({});
  const isLoaded = ref(false);
  let loadPromise = null;

  const loadAllConfigs = async (force = false) => {
    if (isLoaded.value && !force) return;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      try {
        const response = await axios.get("/api/config/");
        if (response.data.success) {
          const configData = response.data.data;
          configData.forEach((configItem) => {
            configs.value[configItem.id] = configItem;
          });
          isLoaded.value = true;
        } else {
          console.error("Error loading configs:", response.data.message);
        }
      } catch (error) {
        console.error("Error loading all configs:", error.message || error);
      } finally {
        loadPromise = null;
      }
    })();
    return loadPromise;
  };

  const getConfigValue = (key, defaultValue = null) => {
    return configs.value[key]?.value ?? defaultValue;
  };

  const updateConfig = async (key, value) => {
    const response = await axios.put("/api/config", { key, value });
    if (response.data.success) {
      configs.value[key] = { ...configs.value[key], id: key, value };
    }
    return response.data;
  };

  return {
    configs,
    isLoaded,
    loadAllConfigs,
    getConfigValue,
    updateConfig,
  };
});
