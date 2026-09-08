<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.settings.page.title')" :description="t('pages.dash.settings.page.description')" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.settings.preview.title')" class="h-full">
          <div class="bg-background-50 p-5 rounded-lg border border-background-200 space-y-4">
            <InfoRow icon="app-window" :label="t('pages.dash.settings.form.labels.appName')" :value="formData.appName || t('pages.dash.settings.form.placeholders.appName')" />
            <InfoRow icon="globe" :label="t('pages.dash.settings.form.labels.domain')" :value="formData.domain || t('pages.dash.settings.form.placeholders.domain')" />
            <InfoRow icon="image" :label="t('pages.dash.settings.form.labels.favicon')" :value="formData.favicon || t('pages.dash.settings.common.default')" />
            <InfoRow icon="calendar-days" :label="t('pages.dash.settings.form.labels.enableWeekends')" :value="formData.enableWeekends ? t('pages.dash.settings.common.enabled') : t('pages.dash.settings.common.disabled')" />
            <InfoRow icon="mail" :label="t('pages.dash.settings.form.labels.mailHostPort')" :value="formData.mailHostPort || t('pages.dash.settings.common.disabled')" />
            <InfoRow icon="mail" :label="t('pages.dash.settings.form.labels.mailUser')" :value="formData.mailUser || t('pages.dash.settings.common.disabled')" />
            <InfoRow icon="shield-check" :label="t('pages.dash.settings.form.labels.mailSecure')" :value="formData.mailSecure ? t('pages.dash.settings.common.enabled') : t('pages.dash.settings.common.disabled')" />
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="t('pages.dash.settings.common.edit')" class="h-full">
          <div class="space-y-6">
            <div class="bg-background-50 p-4 rounded-lg border border-background-200 space-y-4">
              <h4 class="text-sm font-medium text-text-700 mb-1 flex items-center">
                <Settings class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.settings.form.sections.general") }}
              </h4>

              <TextField
                v-model="formData.appName"
                :label="t('pages.dash.settings.form.labels.appName')"
                icon="app-window"
                :valid="!!formData.appName"
                :placeholder="t('pages.dash.settings.form.placeholders.appName')"
                required />

              <TextField
                v-model="formData.domain"
                :label="t('pages.dash.settings.form.labels.domain')"
                icon="globe"
                :valid="!!formData.domain"
                :placeholder="t('pages.dash.settings.form.placeholders.domain')"
                required />

              <div>
                <TextField
                  v-model="formData.favicon"
                  :label="t('pages.dash.settings.form.labels.favicon')"
                  icon="image"
                  :placeholder="t('pages.dash.settings.form.placeholders.favicon')" />
                <div v-if="formData.favicon && !faviconPreviewError" class="flex items-center gap-2 mt-1.5">
                  <img :src="formData.favicon" alt="favicon" class="w-5 h-5 rounded object-contain" @error="faviconPreviewError = true" @load="faviconPreviewError = false" />
                </div>
                <p class="mt-1.5 text-xs text-text-600">{{ t("pages.dash.settings.form.hints.favicon") }}</p>
              </div>

              <div class="flex items-center justify-between p-3 bg-background-100 rounded-lg border border-background-200">
                <div class="flex items-center">
                  <Calendar class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-text-800 font-medium text-sm">{{ t("pages.dash.settings.form.labels.enableWeekends") }}</p>
                    <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.placeholders.enableWeekends") }}</p>
                  </div>
                </div>
                <DsToggle v-model="formData.enableWeekends" />
              </div>
            </div>

            <div class="bg-background-50 p-4 rounded-lg border border-background-200 space-y-4">
              <h4 class="text-sm font-medium text-text-700 mb-1 flex items-center">
                <Mail class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.settings.form.sections.mail") }}
              </h4>

              <TextField v-model="formData.mailHostPort" :label="t('pages.dash.settings.form.labels.mailHostPort')" :placeholder="t('pages.dash.settings.form.placeholders.mailHostPort')" />
              <TextField v-model="formData.mailUser" autocomplete="off" :label="t('pages.dash.settings.form.labels.mailUser')" :placeholder="t('pages.dash.settings.form.placeholders.mailUser')" />

              <div>
                <TextField
                  v-model="formData.mailPassword"
                  type="password"
                  autocomplete="new-password"
                  :label="t('pages.dash.settings.form.labels.mailPassword')"
                  :placeholder="t('pages.dash.settings.form.placeholders.mailPassword')" />
                <p class="mt-1.5 text-xs text-text-600">
                  {{ t("pages.dash.settings.form.hints.mailPassword") }}
                  {{ mailPasswordConfigured ? t("pages.dash.settings.form.hints.mailPasswordSet") : t("pages.dash.settings.form.hints.mailPasswordUnset") }}
                </p>
              </div>

              <TextField
                v-model="formData.mailFromAddress"
                type="email"
                :label="t('pages.dash.settings.form.labels.mailFromAddress')"
                :placeholder="t('pages.dash.settings.form.placeholders.mailFromAddress')" />

              <div class="flex items-center justify-between p-3 bg-background-100 rounded-lg border border-background-200">
                <div class="flex items-center">
                  <ShieldCheck class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-text-800 font-medium text-sm">{{ t("pages.dash.settings.form.labels.mailSecure") }}</p>
                    <p class="text-xs text-text-600">{{ t("pages.dash.settings.form.placeholders.mailSecure") }}</p>
                  </div>
                </div>
                <DsToggle v-model="formData.mailSecure" />
              </div>
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="undo-2" @click="resetForm">
              {{ t("pages.dash.settings.common.reset") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid || !formChanged">
              <template v-if="buttonState === 'processing'">{{ t("pages.dash.settings.form.actions.updating") }}</template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.settings.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.settings.common.status.error") }}</template>
              <template v-else>{{ t("pages.dash.settings.common.update") }}</template>
            </DsButton>
          </div>
        </DsCard>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Settings, Mail, ShieldCheck, Calendar } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { useConfigStore } from "@/stores/configStore";
import PageHeader from "@/components/data/PageHeader.vue";
import DsCard from "@/components/core/DsCard.vue";
import InfoRow from "@/components/data/InfoRow.vue";
import TextField from "@/components/forms/TextField.vue";
import DsToggle from "@/components/forms/DsToggle.vue";
import DsButton from "@/components/core/DsButton.vue";

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
