import { createI18n } from "vue-i18n";

function loadLocaleMessages() {
  const messages = {};
  const locales = import.meta.glob("./locales/**/**.json", { eager: true });
  for (const path in locales) {
    const matched = path.match(/\.\/locales\/([a-zA-Z0-9-_]+)\/(components|pages)\/([a-zA-Z0-9-_]+)\.json$/);
    if (matched) {
      const locale = matched[1];
      const category = matched[2];
      const name = matched[3];

      if (!messages[locale]) {
        messages[locale] = {};
      }

      if (!messages[locale][category]) {
        messages[locale][category] = {};
      }

      messages[locale][category][name] = locales[path].default;
    }
  }
  return messages;
}

const i18n = createI18n({
  legacy: false, 
  locale: "en", 
  fallbackLocale: "en", 
  messages: loadLocaleMessages(),
});

export default i18n;
