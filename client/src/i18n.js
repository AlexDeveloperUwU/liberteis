import { createI18n } from "vue-i18n";

function loadLocaleMessages() {
  const messages = {};
  const locales = import.meta.glob("./locales/**/**.json", { eager: true });
  for (const path in locales) {
    const matchedPages = path.match(/\.\/locales\/([a-zA-Z0-9-_]+)\/pages\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\.json$/);
    const matchedComponents = path.match(/\.\/locales\/([a-zA-Z0-9-_]+)\/components\/([a-zA-Z0-9-_]+)\.json$/);

    if (matchedPages) {
      const locale = matchedPages[1];
      const categoria = matchedPages[2];
      const nombre = matchedPages[3];

      if (!messages[locale]) {
        messages[locale] = {};
      }

      if (!messages[locale].pages) {
        messages[locale].pages = {};
      }

      if (!messages[locale].pages[categoria]) {
        messages[locale].pages[categoria] = {};
      }

      messages[locale].pages[categoria][nombre] = locales[path].default;
    } else if (matchedComponents) {
      const locale = matchedComponents[1];
      const nombre = matchedComponents[2];

      if (!messages[locale]) {
        messages[locale] = {};
      }

      if (!messages[locale].components) {
        messages[locale].components = {};
      }

      messages[locale].components[nombre] = locales[path].default;
    }
  }
  return messages;
}

let i18n;

function createI18nInstance(mainStore) {
  i18n = createI18n({
    legacy: false,
    locale: mainStore.locale,
    fallbackLocale: "gl",
    messages: loadLocaleMessages(),
  });

  mainStore.$subscribe((mutation, state) => {
    if (mutation.storeId === "main" && mutation.events.key === "locale") {
      i18n.global.locale.value = state.locale;
    }
  });

  return i18n;
}

export { createI18nInstance, i18n };
