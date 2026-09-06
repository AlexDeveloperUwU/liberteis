<template>
  <div class="h-full w-full p-6">
    <div class="flex items-center mb-2">
      <h1 class="text-3xl font-bold text-text-950 k2d">
        {{ t("pages.dash.settings.page.title") }}
      </h1>
    </div>
    <p class="text-text-800 mb-6">{{ t("pages.dash.settings.page.description") }}</p>

    <div class="relative">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="order-2 lg:order-1">
          <div
            class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] h-full">
            <h3 class="text-lg font-medium text-text-900 mb-4">
              {{ t("pages.dash.settings.preview.title") }}
            </h3>

            <div class="bg-background-50 p-5 rounded-lg border border-background-200 space-y-4">
              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <AppWindow class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.appName") }}</p>
                  <p class="text-text-800 font-medium">
                    {{ formData.appName || t("pages.dash.settings.form.placeholders.appName") }}
                  </p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <Globe class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.domain") }}</p>
                  <p class="text-text-800 font-medium break-all">
                    {{ formData.domain || t("pages.dash.settings.form.placeholders.domain") }}
                  </p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <Image class="w-5 h-5 text-primary-600 mr-3 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.favicon") }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <img
                      v-if="formData.favicon"
                      :src="formData.favicon"
                      alt="favicon"
                      class="w-5 h-5 rounded object-contain bg-background-50 border border-background-200"
                      @error="faviconPreviewError = true"
                      @load="faviconPreviewError = false" />
                    <p class="text-text-800 font-medium truncate">
                      {{ formData.favicon || t("pages.dash.settings.common.default") }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <CalendarDays class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.enableWeekends") }}</p>
                  <p class="text-text-800 font-medium">
                    {{
                      formData.enableWeekends
                        ? t("pages.dash.settings.common.enabled")
                        : t("pages.dash.settings.common.disabled")
                    }}
                  </p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <Mail class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.mailHostPort") }}</p>
                  <p class="text-text-800 font-medium break-all">
                    {{ formData.mailHostPort || t("pages.dash.settings.common.disabled") }}
                  </p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <Mail class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.mailUser") }}</p>
                  <p class="text-text-800 font-medium break-all">
                    {{ formData.mailUser || t("pages.dash.settings.common.disabled") }}
                  </p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <ShieldCheck class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.labels.mailSecure") }}</p>
                  <p class="text-text-800 font-medium">
                    {{
                      formData.mailSecure
                        ? t("pages.dash.settings.common.enabled")
                        : t("pages.dash.settings.common.disabled")
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <div
            class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] h-full">
            <h3 class="text-lg font-medium text-text-900 mb-4">
              {{ t("pages.dash.settings.common.edit") }}
            </h3>

            <div class="space-y-6">
              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <Settings class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.settings.form.sections.general") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="appName">
                    {{ t("pages.dash.settings.form.labels.appName") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AppWindow
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.appName"
                      id="appName"
                      type="text"
                      class="block w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :placeholder="t('pages.dash.settings.form.placeholders.appName')"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2 v-if="formData.appName" class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle v-else class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="domain">
                    {{ t("pages.dash.settings.form.labels.domain") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.domain"
                      id="domain"
                      type="text"
                      class="block w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :placeholder="t('pages.dash.settings.form.placeholders.domain')"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2 v-if="formData.domain" class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle v-else class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="favicon">
                    {{ t("pages.dash.settings.form.labels.favicon") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Image
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.favicon"
                      id="favicon"
                      type="text"
                      class="block w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :placeholder="t('pages.dash.settings.form.placeholders.favicon')" />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <img
                        v-if="formData.favicon && !faviconPreviewError"
                        :src="formData.favicon"
                        alt="favicon"
                        class="w-5 h-5 rounded object-contain"
                        @error="faviconPreviewError = true"
                        @load="faviconPreviewError = false" />
                      <XCircle v-else-if="formData.favicon" class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                  <p class="mt-1.5 text-xs text-text-600">
                    {{ t("pages.dash.settings.form.hints.favicon") }}
                  </p>
                </div>

                <div class="mb-1">
                  <div
                    class="flex items-center justify-between p-3 bg-background-100 rounded-lg border border-background-200">
                    <div class="flex items-center">
                      <CalendarDays class="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p class="text-text-800 font-medium text-sm">
                          {{ t("pages.dash.settings.form.labels.enableWeekends") }}
                        </p>
                        <p class="text-xs text-text-600">
                          {{ t("pages.dash.settings.form.placeholders.enableWeekends") }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="formData.enableWeekends"
                      @click="formData.enableWeekends = !formData.enableWeekends"
                      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                      :class="formData.enableWeekends ? 'bg-primary-500' : 'bg-background-300'">
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-background-50 shadow transition-transform duration-200"
                        :class="formData.enableWeekends ? 'translate-x-6' : 'translate-x-1'" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <Mail class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.settings.form.sections.mail") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="mailHostPort">
                    {{ t("pages.dash.settings.form.labels.mailHostPort") }}
                  </label>
                  <input
                    v-model="formData.mailHostPort"
                    id="mailHostPort"
                    type="text"
                    class="block w-full px-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                    :placeholder="t('pages.dash.settings.form.placeholders.mailHostPort')" />
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="mailUser">
                    {{ t("pages.dash.settings.form.labels.mailUser") }}
                  </label>
                  <input
                    v-model="formData.mailUser"
                    id="mailUser"
                    type="text"
                    autocomplete="off"
                    class="block w-full px-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                    :placeholder="t('pages.dash.settings.form.placeholders.mailUser')" />
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="mailPassword">
                    {{ t("pages.dash.settings.form.labels.mailPassword") }}
                  </label>
                  <input
                    v-model="formData.mailPassword"
                    id="mailPassword"
                    type="password"
                    autocomplete="new-password"
                    class="block w-full px-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                    :placeholder="t('pages.dash.settings.form.placeholders.mailPassword')" />
                  <p class="mt-1.5 text-xs text-text-600">
                    {{ t("pages.dash.settings.form.hints.mailPassword") }}
                    {{
                      mailPasswordConfigured
                        ? t("pages.dash.settings.form.hints.mailPasswordSet")
                        : t("pages.dash.settings.form.hints.mailPasswordUnset")
                    }}
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="mailFromAddress">
                    {{ t("pages.dash.settings.form.labels.mailFromAddress") }}
                  </label>
                  <input
                    v-model="formData.mailFromAddress"
                    id="mailFromAddress"
                    type="email"
                    class="block w-full px-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                    :placeholder="t('pages.dash.settings.form.placeholders.mailFromAddress')" />
                </div>

                <div class="mb-1">
                  <div
                    class="flex items-center justify-between p-3 bg-background-100 rounded-lg border border-background-200">
                    <div class="flex items-center">
                      <ShieldCheck class="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p class="text-text-800 font-medium text-sm">
                          {{ t("pages.dash.settings.form.labels.mailSecure") }}
                        </p>
                        <p class="text-xs text-text-600">
                          {{ t("pages.dash.settings.form.placeholders.mailSecure") }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="formData.mailSecure"
                      @click="formData.mailSecure = !formData.mailSecure"
                      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                      :class="formData.mailSecure ? 'bg-primary-500' : 'bg-background-300'">
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-background-50 shadow transition-transform duration-200"
                        :class="formData.mailSecure ? 'translate-x-6' : 'translate-x-1'" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end items-center mt-6 gap-2">
              <button
                type="button"
                class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-background-100 text-text-700 border border-background-300 hover:bg-background-200 transition-colors duration-150 cursor-pointer"
                @click="resetForm">
                <Undo2 class="w-4 h-4 mr-2" />
                {{ t("pages.dash.settings.common.reset") }}
              </button>
              <button
                type="submit"
                class="h-10 px-5 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                :class="{
                  'bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200':
                    buttonState === 'default',
                  'bg-background-200 text-text-500': buttonState === 'processing',
                  'bg-secondary-100 text-secondary-800 border border-secondary-200': buttonState === 'success',
                  'bg-accent-100 text-accent-800 border border-accent-200': buttonState === 'error',
                }"
                :disabled="isSubmitting || !isFormValid || !formChanged">
                <div v-if="buttonState === 'processing'" class="flex items-center">
                  <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                  {{ t("pages.dash.settings.form.actions.updating") }}
                </div>
                <div v-else-if="buttonState === 'success'" class="flex items-center">
                  <CheckCircle2 class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.settings.common.status.success") }}
                </div>
                <div v-else-if="buttonState === 'error'" class="flex items-center">
                  <XCircle class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.settings.common.status.error") }}
                </div>
                <div v-else class="flex items-center">
                  <Save class="w-4 h-4 mr-2" />
                  {{ t("pages.dash.settings.common.update") }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  AppWindow,
  Globe,
  CalendarDays,
  Image,
  Settings,
  Save,
  Undo2,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { useConfigStore } from "@/stores/configStore";

const { t } = useI18n();
const toast = useToast();
const configStore = useConfigStore();

const formData = reactive({
  appName: "",
  domain: "",
  enableWeekends: false,
  favicon: "",
  mailHostPort: "",
  mailSecure: false,
  mailUser: "",
  mailPassword: "",
  mailFromAddress: "",
});

const initialFormData = reactive({
  appName: "",
  domain: "",
  enableWeekends: false,
  favicon: "",
  mailHostPort: "",
  mailSecure: false,
  mailUser: "",
  mailFromAddress: "",
});

const isSubmitting = ref(false);
const buttonState = ref("default");
const faviconPreviewError = ref(false);
const mailPasswordConfigured = ref(false);

const loadSettings = () => {
  formData.appName = configStore.getConfigValue("appName", "EvenTeis");
  formData.domain = configStore.getConfigValue("domain", "http://localhost:3000");
  formData.enableWeekends = configStore.getConfigValue("enableWeekends", "true") === "true";
  formData.favicon = configStore.getConfigValue("favicon", "");
  formData.mailHostPort = configStore.getConfigValue("mailHostPort", "");
  formData.mailSecure = configStore.getConfigValue("mailSecure", "false") === "true";
  formData.mailUser = configStore.getConfigValue("mailUser", "");
  formData.mailPassword = "";
  formData.mailFromAddress = configStore.getConfigValue("mailFromAddress", "");
  mailPasswordConfigured.value = configStore.getConfigValue("mailPassword", "") === "set";

  initialFormData.appName = formData.appName;
  initialFormData.domain = formData.domain;
  initialFormData.enableWeekends = formData.enableWeekends;
  initialFormData.favicon = formData.favicon;
  initialFormData.mailHostPort = formData.mailHostPort;
  initialFormData.mailSecure = formData.mailSecure;
  initialFormData.mailUser = formData.mailUser;
  initialFormData.mailFromAddress = formData.mailFromAddress;
};

onMounted(async () => {
  if (!configStore.isLoaded) {
    await configStore.loadAllConfigs();
  }
  loadSettings();
});

const formChanged = computed(() => {
  return (
    formData.appName !== initialFormData.appName ||
    formData.domain !== initialFormData.domain ||
    formData.enableWeekends !== initialFormData.enableWeekends ||
    formData.favicon !== initialFormData.favicon ||
    formData.mailHostPort !== initialFormData.mailHostPort ||
    formData.mailSecure !== initialFormData.mailSecure ||
    formData.mailUser !== initialFormData.mailUser ||
    formData.mailFromAddress !== initialFormData.mailFromAddress ||
    formData.mailPassword !== ""
  );
});

const isFormValid = computed(() => {
  return Boolean(formData.appName) && Boolean(formData.domain);
});

const resetForm = () => {
  formData.appName = initialFormData.appName;
  formData.domain = initialFormData.domain;
  formData.enableWeekends = initialFormData.enableWeekends;
  formData.favicon = initialFormData.favicon;
  formData.mailHostPort = initialFormData.mailHostPort;
  formData.mailSecure = initialFormData.mailSecure;
  formData.mailUser = initialFormData.mailUser;
  formData.mailPassword = "";
  formData.mailFromAddress = initialFormData.mailFromAddress;
  faviconPreviewError.value = false;
  buttonState.value = "default";
};

const handleSubmit = async () => {
  if (!isFormValid.value || !formChanged.value) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    const updates = [];
    if (formData.appName !== initialFormData.appName) {
      updates.push(configStore.updateConfig("appName", formData.appName));
    }
    if (formData.domain !== initialFormData.domain) {
      updates.push(configStore.updateConfig("domain", formData.domain));
    }
    if (formData.enableWeekends !== initialFormData.enableWeekends) {
      updates.push(configStore.updateConfig("enableWeekends", formData.enableWeekends ? "true" : "false"));
    }
    if (formData.favicon !== initialFormData.favicon) {
      updates.push(configStore.updateConfig("favicon", formData.favicon));
    }
    if (formData.mailHostPort !== initialFormData.mailHostPort) {
      updates.push(configStore.updateConfig("mailHostPort", formData.mailHostPort));
    }
    if (formData.mailSecure !== initialFormData.mailSecure) {
      updates.push(configStore.updateConfig("mailSecure", formData.mailSecure ? "true" : "false"));
    }
    if (formData.mailUser !== initialFormData.mailUser) {
      updates.push(configStore.updateConfig("mailUser", formData.mailUser));
    }
    if (formData.mailFromAddress !== initialFormData.mailFromAddress) {
      updates.push(configStore.updateConfig("mailFromAddress", formData.mailFromAddress));
    }
    const passwordChanged = formData.mailPassword !== "";
    if (passwordChanged) {
      updates.push(configStore.updateConfig("mailPassword", formData.mailPassword));
    }

    const results = await Promise.all(updates);
    const failed = results.find((r) => !r.success);

    if (failed) {
      buttonState.value = "error";
      toast.error(failed.message || t("pages.dash.settings.errors.updateFailed"));
    } else {
      if (passwordChanged) {
        configStore.configs.mailPassword = { id: "mailPassword", value: "set" };
      }
      loadSettings();
      buttonState.value = "success";
      toast.success(t("pages.dash.settings.notifications.updateSuccess"));
    }
  } catch (error) {
    buttonState.value = "error";
    toast.error(error.response?.data?.message || t("pages.dash.settings.errors.updateFailed"));
  } finally {
    isSubmitting.value = false;
    setTimeout(() => {
      buttonState.value = "default";
    }, 2000);
  }
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
