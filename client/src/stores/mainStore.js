import { ref } from "vue";
import { defineStore } from "pinia";

export const useMainStore = defineStore("main", () => {
  const locale = ref(localStorage.getItem("locale") || "gl");

  const setLocale = (lang) => {
    locale.value = lang;
    localStorage.setItem("locale", lang);
  };

  return {
    locale,
    setLocale,
  };
});
