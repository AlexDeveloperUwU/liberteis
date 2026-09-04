import { createI18n } from "vue-i18n";

// Non-eager: each locale file is only fetched when its language is actually needed,
// instead of bundling all locales (en/es/gl) into the initial load.
const localesGlob = import.meta.glob("./locales/**/**.json");

const loadedLocales = new Set();

async function loadLocaleMessages(localeCodes) {
  const messages = {};

  const entries = Object.entries(localesGlob).filter(([path]) => {
    const match = path.match(/^\.\/locales\/([a-zA-Z0-9-_]+)\//);
    return match && localeCodes.includes(match[1]);
  });

  const loaded = await Promise.all(entries.map(([path, importFn]) => importFn().then((mod) => [path, mod])));

  for (const [path, mod] of loaded) {
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

      messages[locale].pages[categoria][nombre] = mod.default;
    } else if (matchedComponents) {
      const locale = matchedComponents[1];
      const nombre = matchedComponents[2];

      if (!messages[locale]) {
        messages[locale] = {};
      }

      if (!messages[locale].components) {
        messages[locale].components = {};
      }

      messages[locale].components[nombre] = mod.default;
    }
  }

  return messages;
}

let i18n;

async function ensureLocaleLoaded(locale) {
  if (loadedLocales.has(locale)) return;

  const messages = await loadLocaleMessages([locale]);
  if (messages[locale]) {
    i18n.global.setLocaleMessage(locale, messages[locale]);
  }
  loadedLocales.add(locale);
}

async function createI18nInstance(mainStore) {
  const localesToLoad = mainStore.locale === "gl" ? ["gl"] : [mainStore.locale, "gl"];
  const messages = await loadLocaleMessages(localesToLoad);
  localesToLoad.forEach((locale) => loadedLocales.add(locale));

  i18n = createI18n({
    legacy: false,
    locale: mainStore.locale,
    fallbackLocale: "gl",
    messages,
  });

  mainStore.$subscribe(async (mutation, state) => {
    if (mutation.storeId === "main" && mutation.events.key === "locale") {
      await ensureLocaleLoaded(state.locale);
      i18n.global.locale.value = state.locale;
    }
  });

  return i18n;
}

export { createI18nInstance, ensureLocaleLoaded, i18n };
