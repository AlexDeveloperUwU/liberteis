import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useConfigStore = defineStore("config", () => {
  const configs = ref({});
  const isLoaded = ref(false);

  const loadAllConfigs = async () => {
    try {
      const response = await axios.get("/api/config/");
      if (response.data.code === 200) {
        const configData = response.data.data;
        configData.forEach((configItem) => {
          configs.value[configItem.id] = configItem;
        });
        isLoaded.value = true;
      }
    } catch (error) {
      console.error("Error loading all configs:", error.message || error);
    }
  };

  const getConfigValue = (key, defaultValue = null) => {
    return configs.value[key]?.value ?? defaultValue;
  };

  return {
    configs,
    isLoaded,
    loadAllConfigs,
    getConfigValue,
  };
});
