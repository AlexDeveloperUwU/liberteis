<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.userConfig.page.title')" :description="t('pages.dash.userConfig.page.description')" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.userConfig.profile.preview')" class="h-full">
          <div class="bg-background-50 p-5 rounded-lg border border-background-200">
            <div class="flex items-center mb-5">
              <div class="relative mr-5">
                <div
                  class="w-20 h-20 rounded-full bg-background-200 flex items-center justify-center overflow-hidden border-2 border-background-300 shadow-md">
                  <User v-if="!formData.name" class="w-9 h-9 text-primary-600" />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-primary-700 font-bold font-display bg-primary-100"
                    style="font-size: 2rem">
                    {{ getInitials(formData.name) }}
                  </div>
                </div>
                <div
                  v-if="userData.type"
                  class="absolute -bottom-1.5 -right-1.5 rounded-full p-2 shadow-sm border border-background-50 bg-primary-100">
                  <component :is="resolveIcon(roleIcons[userData.type])" class="w-4 h-4 text-primary-600" />
                </div>
              </div>

              <div>
                <h3 class="text-xl font-bold text-text-900">
                  {{ formData.name || userData.name || t("pages.dash.userConfig.form.placeholders.name") }}
                </h3>
                <p class="text-text-600 text-sm mt-1">
                  {{ userData.type ? t(`pages.dash.users.types.${userData.type}`) : "" }}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <InfoRow icon="mail" :label="t('pages.dash.userConfig.form.labels.email')" :value="formData.email || userData.email || t('pages.dash.userConfig.form.placeholders.noEmail')" />
              <InfoRow icon="calendar-days" :label="t('pages.dash.userConfig.profile.creationDate')" :value="userData.createdDate ? formatDate(userData.createdDate) : currentDate" />
              <InfoRow icon="calendar-days" :label="t('pages.dash.userConfig.profile.lastAccess')" :value="userData.lastAccess ? formatDate(userData.lastAccess) : currentDate" />
              <InfoRow icon="palette" :label="t('pages.dash.userConfig.profile.theme')" :value="t(`pages.dash.userConfig.themes.${formData.theme || userData.theme || 'system'}`)" />
              <InfoRow icon="languages" :label="t('pages.dash.userConfig.profile.language')" :value="t(`pages.dash.userConfig.languages.${formData.language || userData.language || 'es'}`)" />

              <div class="flex items-start p-3 bg-background-100 rounded-lg border border-background-200">
                <ShieldCheck class="w-5 h-5 text-primary-600 mr-3 mt-0.5" />
                <div class="w-full">
                  <p class="text-xs text-text-600 flex items-center justify-between">
                    <span>{{ t("pages.dash.userConfig.profile.userPermissions") }}</span>
                    <span class="text-primary-600 text-[10px] font-medium bg-primary-50 px-1.5 py-0.5 rounded-full">
                      {{ permissions[userData.type]?.length || 0 }}
                    </span>
                  </p>
                  <div class="mt-1.5 space-y-1">
                    <div v-for="(permission, index) in permissions[userData.type] || []" :key="index" class="flex items-center text-text-800 text-xs">
                      <CheckCircle class="w-3 h-3 text-primary-600 mr-1.5 shrink-0" />
                      <span>{{ permission }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="t('pages.dash.userConfig.common.edit')" class="h-full">
          <div class="space-y-6">
            <div class="bg-background-50 p-4 rounded-lg border border-background-200">
              <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.userConfig.form.sections.basicInfo") }}
              </h4>

              <div class="mb-4">
                <TextField
                  v-model="formData.name"
                  :label="t('pages.dash.userConfig.form.labels.name')"
                  icon="user"
                  :disabled="isAdminAccount"
                  :error="!formSubmitted ? errors.name : null"
                  :valid="(!errors.name || formSubmitted) && !!formData.name && formData.name.length >= 3"
                  :placeholder="t('pages.dash.userConfig.form.placeholders.name')"
                  required />
                <p v-if="isAdminAccount" class="mt-1.5 text-xs text-secondary-600 flex items-center">
                  <InfoIcon class="w-3 h-3 mr-1" />
                  {{ t("pages.dash.userConfig.errors.cantChangeName") }}
                </p>
              </div>

              <div class="mb-4">
                <TextField
                  v-model="formData.email"
                  type="email"
                  :label="t('pages.dash.userConfig.form.labels.email')"
                  icon="mail"
                  :error="!formSubmitted ? errors.email : null"
                  :valid="(!errors.email || formSubmitted) && !!formData.email && isValidEmail(formData.email)"
                  :placeholder="t('pages.dash.userConfig.form.placeholders.email')"
                  required />
              </div>

              <div class="mb-4">
                <TextField
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  :label="t('pages.dash.userConfig.form.labels.password')"
                  icon="shield"
                  :error="!formSubmitted ? errors.password : null"
                  :placeholder="t('pages.dash.userConfig.form.placeholders.password')" />
                <div class="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    :title="showPassword ? t('pages.dash.userConfig.form.hidePassword') : t('pages.dash.userConfig.form.showPassword')">
                    <component :is="showPassword ? EyeOff : Eye" class="w-3.5 h-3.5" />
                    {{ showPassword ? t("pages.dash.userConfig.form.hidePassword") : t("pages.dash.userConfig.form.showPassword") }}
                  </button>
                  <Loader2 v-if="isValidatingPassword" class="w-3.5 h-3.5 text-primary-600 animate-spin" />
                </div>

                <div v-if="formData.password" class="space-y-2 mt-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-text-600">{{ t("pages.other.validators.password.strength") }}</span>
                    <DsPill :tone="passwordStrength === 'weak' ? 'danger' : passwordStrength === 'medium' ? 'warning' : 'success'">
                      {{
                        passwordStrength === "weak"
                          ? t("pages.other.validators.password.weak")
                          : passwordStrength === "medium"
                            ? t("pages.other.validators.password.medium")
                            : t("pages.other.validators.password.strong")
                      }}
                    </DsPill>
                  </div>
                  <div class="h-2 bg-background-300 rounded-full overflow-hidden">
                    <div
                      class="h-full transition-all"
                      :class="[
                        passwordStrength === 'weak' ? 'bg-accent-500 w-1/3' : passwordStrength === 'medium' ? 'bg-warning-500 w-2/3' : 'bg-primary-500 w-full',
                      ]"></div>
                  </div>
                </div>
                <label v-if="formData.password" class="flex items-center gap-2 mt-3 text-sm text-text-700">
                  <input type="checkbox" v-model="formData.invalidateOtherSessions" class="rounded" />
                  {{ t("pages.dash.userConfig.form.labels.logoutOtherSessions") }}
                </label>
              </div>
            </div>

            <div class="bg-background-50 p-4 rounded-lg border border-background-200">
              <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                <Settings class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.userConfig.form.sections.preferences") }}
              </h4>

              <div class="mb-4">
                <SelectMenu
                  v-model="formData.theme"
                  :label="t('pages.dash.userConfig.form.labels.theme')"
                  icon="palette"
                  :options="themeOptions"
                  :error="!formSubmitted && errors.theme ? errors.theme : false"
                  @update:model-value="touchedFields.theme = true" />
              </div>

              <SelectMenu
                v-model="formData.language"
                :label="t('pages.dash.userConfig.form.labels.language')"
                icon="languages"
                :options="languageOptions"
                :error="!formSubmitted && errors.language ? errors.language : false"
                @update:model-value="touchedFields.language = true" />
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="undo-2" @click="resetForm">
              {{ t("pages.dash.userConfig.common.reset") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid || !formChanged">
              <template v-if="buttonState === 'processing'">{{ t("pages.dash.userConfig.form.actions.updating") }}</template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.userConfig.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.userConfig.common.status.error") }}</template>
              <template v-else>{{ t("pages.dash.userConfig.common.update") }}</template>
            </DsButton>
          </div>
        </DsCard>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { User, ClipboardList, CheckCircle, Eye, EyeOff, Loader2, Info as InfoIcon, Settings, ShieldCheck } from "lucide-vue-next";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { isValidEmail, validateName, validateEmail, validatePassword } from "@/utils/validators";
import { useAuthStore } from "@/stores/authStore";
import { ensureLocaleLoaded } from "@/i18n";
import { resolveIcon } from "@/components/icons.js";
import PageHeader from "@/components/data/PageHeader.vue";
import DsCard from "@/components/core/DsCard.vue";
import InfoRow from "@/components/data/InfoRow.vue";
import TextField from "@/components/forms/TextField.vue";
import SelectMenu from "@/components/forms/SelectMenu.vue";
import DsPill from "@/components/core/DsPill.vue";
import DsButton from "@/components/core/DsButton.vue";

const { t, locale } = useI18n();
const toast = useToast();
const authStore = useAuthStore();

const userData = ref({});
const isLoading = ref(true);
const loadError = ref(null);
const showPassword = ref(false);

const isAdminAccount = computed(() => {
  return userData.value?.createdBy === "System" && userData.value?.name === "Administrador";
});

onMounted(async () => {
  await loadUserData();
});

const loadUserData = async () => {
  isLoading.value = true;
  loadError.value = null;

  try {
    const route = useRoute();
    if (route && route.meta && route.meta.initialData && route.meta.initialData.user) {
      userData.value = route.meta.initialData.user;
    } else {
      if (!authStore.userId) {
        throw new Error("Usuario no autenticado o ID no disponible");
      }

      const response = await axios.get(`/api/users?id=${authStore.userId}`);

      if (response.data.success) {
        userData.value = response.data.data;
      } else {
        throw new Error(response.data.message || "Error al cargar datos del usuario");
      }
    }

    formData.name = userData.value.name || "";
    formData.email = userData.value.email || "";
    formData.theme = userData.value.theme || "system";
    formData.language = userData.value.language || locale.value;

    initialFormData.name = formData.name;
    initialFormData.email = formData.email;
    initialFormData.theme = formData.theme;
    initialFormData.language = formData.language;
  } catch (error) {
    console.error("Error loading user data:", error);
    loadError.value = t("pages.dash.userConfig.errors.loadingUser");
    toast.error(t("pages.dash.userConfig.errors.loadingUser"));
  } finally {
    isLoading.value = false;
  }
};

const formData = reactive({
  name: "",
  email: "",
  password: "",
  invalidateOtherSessions: true,
  theme: "system",
  language: "es",
});

const initialFormData = reactive({
  name: "",
  email: "",
  theme: "system",
  language: "es",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  theme: "",
  language: "",
});

const touchedFields = reactive({
  name: false,
  email: false,
  password: false,
  theme: false,
  language: false,
});

const isSubmitting = ref(false);
const buttonState = ref("default");
const formSubmitted = ref(false);

const themes = ["light", "dark"];
const languages = ["es", "en", "gl"];

const themeOptions = computed(() => themes.map((theme) => ({ value: theme, label: t(`pages.dash.userConfig.themes.${theme}`) })));
const languageOptions = computed(() => languages.map((lang) => ({ value: lang, label: t(`pages.dash.userConfig.languages.${lang}`) })));

const roleIcons = {
  normalUser: "users",
  managerUser: "shield-check",
  adminUser: "shield-alert",
};

const permissions = computed(() => ({
  normalUser: [t("pages.dash.userConfig.permissions.manageOwnEvents")],
  managerUser: [
    t("pages.dash.userConfig.permissions.manageOwnEvents"),
    t("pages.dash.userConfig.permissions.manageAllEvents"),
    t("pages.dash.userConfig.permissions.manageCategories"),
    t("pages.dash.userConfig.permissions.manageSpaces"),
    t("pages.dash.userConfig.permissions.manageUsers"),
  ],
  adminUser: [
    t("pages.dash.userConfig.permissions.manageOwnEvents"),
    t("pages.dash.userConfig.permissions.manageAllEvents"),
    t("pages.dash.userConfig.permissions.manageCategories"),
    t("pages.dash.userConfig.permissions.manageSpaces"),
    t("pages.dash.userConfig.permissions.manageUsers"),
    t("pages.dash.userConfig.permissions.manageAppSettings"),
  ],
}));

const currentDate = computed(() => {
  return new Date().toLocaleDateString();
});

const getInitials = (name) => {
  if (!name) return "";
  const nameParts = name.split(" ").filter((part) => part.length > 0);
  if (nameParts.length > 1) {
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  return nameParts[0].charAt(0).toUpperCase();
};

const passwordValidationResult = reactive({
  isValid: true,
  isPwned: false,
  count: 0,
  error: false,
  minLengthError: false,
});

const passwordErrorMessage = computed(() => {
  if (!passwordValidationResult.isValid) {
    if (passwordValidationResult.isPwned) {
      const countText =
        passwordValidationResult.count === 1
          ? t("pages.other.validators.password.singular")
          : t("pages.other.validators.password.plural", { count: passwordValidationResult.count.toLocaleString() });

      return t("pages.other.validators.password.pwned", { count: countText });
    } else if (passwordValidationResult.minLengthError) {
      return t("pages.dash.userConfig.errors.passwordLength");
    }
  } else if (passwordValidationResult.error) {
    return t("pages.other.validators.password.checkError");
  }

  return "";
});

const passwordStrength = computed(() => {
  if (!formData.password) return "weak";
  if (formData.password.length < 10) return "weak";
  if (formData.password.length < 16) return "medium";
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumbers = /\d/.test(formData.password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(formData.password);
  const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  if (charTypes >= 3) return "strong";
  return "medium";
});

const validateFormField = async (field, value) => {
  if (formSubmitted.value) return true;

  let result;

  switch (field) {
    case "name":
      result = validateName(value);
      errors.name = result.message || t("pages.dash.userConfig.errors.nameLength");
      return result.isValid;
    case "email":
      result = validateEmail(value);
      errors.email = result.message || (result.isValid ? "" : t("pages.dash.userConfig.errors.emailInvalid"));
      return result.isValid;
    case "password":
      if (!value) return true;
      result = await validatePassword(value);

      passwordValidationResult.isValid = result.isValid;
      passwordValidationResult.isPwned = result.isPwned;
      passwordValidationResult.count = result.count;
      passwordValidationResult.error = result.error || false;
      passwordValidationResult.minLengthError = !result.isValid && !result.isPwned;

      errors.password = passwordErrorMessage.value;
      return result.isValid;
    default:
      return true;
  }
};

const isValidatingPassword = ref(false);

let passwordDebounceTimeout;

watch(
  () => formData.password,
  async (newVal) => {
    touchedFields.password = true;
    clearTimeout(passwordDebounceTimeout);

    if (newVal) {
      isValidatingPassword.value = true;
      errors.password = "";

      passwordDebounceTimeout = setTimeout(async () => {
        await validateFormField("password", newVal);
        isValidatingPassword.value = false;
      }, 500);
    } else {
      errors.password = "";
      isValidatingPassword.value = false;

      Object.assign(passwordValidationResult, {
        isValid: true,
        isPwned: false,
        count: 0,
        error: false,
        minLengthError: false,
      });
    }
  },
);

watch(
  () => formData.name,
  () => {
    touchedFields.name = true;
  },
);
watch(
  () => formData.email,
  () => {
    touchedFields.email = true;
  },
);
watch(
  () => formData.theme,
  () => {
    touchedFields.theme = true;
  },
);
watch(
  () => formData.language,
  () => {
    touchedFields.language = true;
  },
);

const formChanged = computed(() => {
  if (formData.password) return true;

  return (
    formData.name !== initialFormData.name ||
    formData.email !== initialFormData.email ||
    formData.theme !== initialFormData.theme ||
    formData.language !== initialFormData.language
  );
});

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;

  if (isValidatingPassword.value) return false;

  const mandatoryFieldsValid = !errors.name && !errors.email;

  const passwordValid = !formData.password || !errors.password;

  return mandatoryFieldsValid && passwordValid;
});

const validateForm = async () => {
  if (formSubmitted.value) return true;

  let isValid = true;
  errors.name = "";
  errors.email = "";
  errors.password = "";

  if (!isAdminAccount.value) {
    isValid = (await validateFormField("name", formData.name)) && isValid;
  }
  isValid = (await validateFormField("email", formData.email)) && isValid;

  if (formData.password) {
    isValid = (await validateFormField("password", formData.password)) && isValid;
  }

  return isValid;
};

const checkEmailAvailability = async (email) => {
  if (email === userData.value.email) return true;

  try {
    const response = await axios.get(`/api/users/emailCheck?email=${email}`);
    return !response.data.data.exists;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

const resetForm = () => {
  formData.name = userData.value.name || "";
  formData.email = userData.value.email || "";
  formData.password = "";
  formData.theme = userData.value.theme || "system";
  formData.language = userData.value.language || locale.value;

  touchedFields.name = false;
  touchedFields.email = false;
  touchedFields.password = false;
  touchedFields.theme = false;
  touchedFields.language = false;

  errors.name = "";
  errors.email = "";
  errors.password = "";
  errors.theme = "";
  errors.language = "";

  buttonState.value = "default";
};

const handleSubmit = async () => {
  const formValid = await validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    if (formData.email !== userData.value.email) {
      const isEmailAvailable = await checkEmailAvailability(formData.email);
      if (!isEmailAvailable) {
        errors.email = t("pages.dash.userConfig.errors.emailExists");
        toast.error(t("pages.dash.userConfig.errors.emailExists"));
        buttonState.value = "error";
        setTimeout(() => {
          buttonState.value = "default";
        }, 2000);
        isSubmitting.value = false;
        return;
      }
    }

    const userUpdate = {};

    if (formData.name !== userData.value.name) userUpdate.name = formData.name;
    if (formData.email !== userData.value.email) userUpdate.email = formData.email;
    if (formData.password) {
      userUpdate.password = formData.password;
      userUpdate.invalidateOtherSessions = formData.invalidateOtherSessions;
    }
    if (formData.theme !== userData.value.theme) userUpdate.theme = formData.theme;
    if (formData.language !== userData.value.language) userUpdate.lang = formData.language;

    if (formData.language !== locale.value) {
      await ensureLocaleLoaded(formData.language);
      locale.value = formData.language;
    }

    let success = false;

    if (Object.keys(userUpdate).length > 0) {
      success = await authStore.updateUserProfile(userUpdate);

      if (success) {
        await loadUserData();

        if (userUpdate.password) {
          formData.password = "";
        }

        initialFormData.name = formData.name;
        initialFormData.email = formData.email;
        initialFormData.theme = formData.theme;
        initialFormData.language = formData.language;

        formSubmitted.value = true;
        buttonState.value = "success";
        toast.success(t("pages.dash.userConfig.notifications.updateSuccess"));
      } else {
        buttonState.value = "error";
        toast.error(t("pages.dash.userConfig.errors.updateFailed"));
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    buttonState.value = "error";

    if (error.message && error.message.includes("BigInt")) {
      toast.error(t("pages.dash.userConfig.errors.bigIntError"));
    } else if (error.response) {
      toast.error(error.response.data?.message || t("pages.dash.userConfig.errors.unknown"));
    } else if (error.request) {
      toast.error(t("pages.dash.userConfig.errors.noResponse"));
    } else {
      toast.error(t("pages.dash.userConfig.errors.requestSetup"));
    }
  } finally {
    isSubmitting.value = false;

    if (buttonState.value === "success") {
      setTimeout(() => {
        buttonState.value = "default";
        formSubmitted.value = false;
        touchedFields.password = false;
      }, 2000);
    } else if (buttonState.value === "error") {
      setTimeout(() => {
        buttonState.value = "default";
      }, 2000);
    }
  }
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString();
}
</script>
