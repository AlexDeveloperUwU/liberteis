<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="pageTitle" :description="pageDescription" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.userForm.profile.preview')" class="h-full">
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
                  v-if="formData.type"
                  class="absolute -bottom-1.5 -right-1.5 rounded-full p-2 shadow-sm border border-background-50 bg-primary-100">
                  <component :is="resolveIcon(roleIcons[formData.type])" class="w-4 h-4 text-primary-600" />
                </div>
              </div>

              <div>
                <h3 class="text-xl font-bold text-text-900">
                  {{ formData.name || t("pages.dash.userForm.form.placeholders.name") }}
                </h3>
                <p class="text-text-600 text-sm mt-1">
                  {{
                    formData.type
                      ? t(`pages.dash.users.types.${formData.type}`)
                      : t("pages.dash.userForm.form.placeholders.noRoleSelected")
                  }}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <InfoRow icon="mail" :label="t('pages.dash.userForm.form.labels.email')" :value="formData.email || t('pages.dash.userForm.form.placeholders.noEmail')" />
              <InfoRow
                icon="calendar-days"
                :label="t('pages.dash.userForm.profile.creationDate')"
                :value="isEditMode && initialUserData ? formatDate(initialUserData.createdDate) : currentDate" />
              <template v-if="isEditMode && initialUserData">
                <InfoRow
                  icon="calendar-days"
                  :label="t('pages.dash.userForm.profile.lastAccess')"
                  :value="initialUserData.lastLogin ? formatDate(initialUserData.lastLogin) : t('pages.dash.userForm.profile.neverLoggedIn')" />
                <InfoRow icon="mail" :label="t('pages.dash.userForm.profile.createdBy')" :value="createdByLabel" />
              </template>

              <div v-if="formData.type" class="flex items-start p-3 bg-background-100 rounded-lg border border-background-200">
                <ShieldCheck class="w-5 h-5 text-primary-600 mr-3 mt-0.5" />
                <div class="w-full">
                  <p class="text-xs text-text-600 flex items-center justify-between">
                    <span>{{ t("pages.dash.userForm.profile.userPermissions") }}</span>
                    <span class="text-primary-600 text-[10px] font-medium bg-primary-50 px-1.5 py-0.5 rounded-full">
                      {{ permissions[formData.type].length }}
                    </span>
                  </p>
                  <div class="mt-1.5 space-y-1">
                    <div v-for="(permission, index) in permissions[formData.type]" :key="index" class="flex items-center text-text-800 text-xs">
                      <CheckCircle class="w-3 h-3 text-primary-600 mr-1.5 shrink-0" />
                      <span>{{ permission }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                <Shield class="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p class="text-xs text-text-600">{{ t("pages.dash.userForm.profile.permissions") }}</p>
                  <p class="text-text-600 text-sm">{{ t("pages.dash.userForm.profile.selectRoleForPermissions") }}</p>
                </div>
              </div>
            </div>
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="isEditMode ? t('pages.dash.userForm.common.edit') : t('pages.dash.userForm.common.create')" class="h-full">
          <div class="space-y-6">
            <div class="bg-background-50 p-4 rounded-lg border border-background-200">
              <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.userForm.form.sections.basicInfo") }}
              </h4>

              <div class="mb-4">
                <TextField
                  v-model="formData.name"
                  :label="t('pages.dash.userForm.form.labels.name')"
                  icon="user"
                  :disabled="isAdminAccount"
                  :error="!formSubmitted ? errors.name : null"
                  :valid="(!errors.name || formSubmitted) && !!formData.name && formData.name.length >= 3"
                  :placeholder="t('pages.dash.userForm.form.placeholders.name')"
                  required />
                <p v-if="isAdminAccount" class="mt-1.5 text-xs text-secondary-600 flex items-center">
                  <InfoIcon class="w-3 h-3 mr-1" />
                  {{ t("pages.dash.userForm.errors.cantChangeName") || "El nombre del administrador no puede ser modificado" }}
                </p>
              </div>

              <div class="mb-4">
                <TextField
                  v-model="formData.email"
                  type="email"
                  :label="t('pages.dash.userForm.form.labels.email')"
                  icon="mail"
                  :error="!formSubmitted ? errors.email : null"
                  :valid="(!errors.email || formSubmitted) && !!formData.email && isValidEmail(formData.email)"
                  :placeholder="t('pages.dash.userForm.form.placeholders.email')"
                  required />
              </div>

              <div v-if="isEditMode" class="mb-4">
                <TextField
                  v-model="formData.password"
                  type="password"
                  autocomplete="new-password"
                  :label="t('pages.dash.userForm.form.labels.password')"
                  icon="shield"
                  :error="!formSubmitted ? errors.password : null"
                  :placeholder="t('pages.dash.userForm.form.placeholders.password')" />
                <div v-if="isValidatingPassword" class="flex items-center gap-2 mt-1.5">
                  <Loader2 class="w-3.5 h-3.5 text-primary-600 animate-spin" />
                </div>
              </div>
            </div>

            <div class="bg-background-50 p-4 rounded-lg border border-background-200">
              <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                <ShieldCheck class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.userForm.form.sections.accessInfo") }}
              </h4>

              <SelectMenu
                v-model="formData.type"
                :label="t('pages.dash.userForm.form.labels.userType')"
                :options="userTypeOptions"
                :placeholder="t('pages.dash.userForm.form.placeholders.selectType')"
                :error="!formSubmitted && errors.type ? errors.type : false"
                :disabled="isAdminAccount"
                @update:model-value="touchedFields.type = true" />
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="x" @click="$router.push({ name: 'dashUsers' })">
              {{ t("pages.dash.userForm.common.cancel") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid">
              <template v-if="buttonState === 'processing'">
                {{ isEditMode ? t("pages.dash.userForm.form.actions.updating") : t("pages.dash.userForm.form.actions.submitting") }}
              </template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.userForm.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.userForm.common.status.error") }}</template>
              <template v-else>{{ isEditMode ? t("pages.dash.userForm.common.update") : t("pages.dash.userForm.common.create") }}</template>
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
import { useRouter, useRoute } from "vue-router";
import { User, Shield, ShieldCheck, ClipboardList, CheckCircle, Loader2, Info as InfoIcon } from "lucide-vue-next";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import { isValidEmail, validateName, validateEmail, validateType, validatePassword } from "@/utils/validators";
import { resolveIcon } from "@/components/icons.js";
import PageHeader from "@/components/data/PageHeader.vue";
import DsCard from "@/components/core/DsCard.vue";
import InfoRow from "@/components/data/InfoRow.vue";
import TextField from "@/components/forms/TextField.vue";
import SelectMenu from "@/components/forms/SelectMenu.vue";
import DsButton from "@/components/core/DsButton.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id);
const initialUserData = ref(null);
const initialEmail = ref("");
const isLoading = ref(isEditMode.value);
const loadError = ref(null);

const isAdminAccount = computed(() => {
  if (initialUserData.value) {
    return initialUserData.value.createdBy === "System" && initialUserData.value.name === "Administrador";
  }
  return false;
});

onMounted(() => {
  if (isEditMode.value && route.meta.initialData) {
    initialUserData.value = route.meta.initialData.user;

    if (initialUserData.value) {
      formData.name = initialUserData.value.name || "";
      formData.email = initialUserData.value.email || "";
      formData.type = initialUserData.value.type || "";
      isLoading.value = false;
    } else if (route.meta.initialData.error) {
      loadError.value = t("pages.dash.userForm.errors.loadingUser");
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});

watch(
  () => initialUserData.value,
  (newVal) => {
    if (newVal) {
      initialEmail.value = newVal.email || "";

      if (newVal.createdBy) {
        loadCreatorData(newVal.createdBy);
      }
    }
  },
  { immediate: true },
);

const pageTitle = computed(() => {
  return isEditMode.value ? t("pages.dash.userForm.page.editTitle") : t("pages.dash.userForm.page.createTitle");
});

const pageDescription = computed(() => {
  return isEditMode.value
    ? t("pages.dash.userForm.page.editDescription")
    : t("pages.dash.userForm.page.createDescription");
});

const formData = reactive({
  name: "",
  email: "",
  type: "",
  password: "",
});

const errors = reactive({
  name: "",
  email: "",
  type: "",
  password: "",
});

const touchedFields = reactive({
  name: false,
  email: false,
  type: false,
});

const isSubmitting = ref(false);
const buttonState = ref("default");
const formSubmitted = ref(false);

const userTypes = ["normalUser", "managerUser", "adminUser"];

const roleIcons = {
  normalUser: "users",
  managerUser: "shield-check",
  adminUser: "shield-alert",
};

const userTypeOptions = computed(() =>
  userTypes.map((type) => ({ value: type, label: t(`pages.dash.users.types.${type}`), icon: roleIcons[type] })),
);

const permissions = computed(() => ({
  normalUser: [t("pages.dash.userForm.permissions.manageOwnEvents")],
  managerUser: [
    t("pages.dash.userForm.permissions.manageOwnEvents"),
    t("pages.dash.userForm.permissions.manageAllEvents"),
    t("pages.dash.userForm.permissions.manageCategories"),
    t("pages.dash.userForm.permissions.manageSpaces"),
    t("pages.dash.userForm.permissions.manageUsers"),
  ],
  adminUser: [
    t("pages.dash.userForm.permissions.manageOwnEvents"),
    t("pages.dash.userForm.permissions.manageAllEvents"),
    t("pages.dash.userForm.permissions.manageCategories"),
    t("pages.dash.userForm.permissions.manageSpaces"),
    t("pages.dash.userForm.permissions.manageUsers"),
    t("pages.dash.userForm.permissions.manageAppSettings"),
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
      return t("pages.dash.userForm.errors.passwordLength");
    }
  } else if (passwordValidationResult.error) {
    return t("pages.other.validators.password.checkError");
  }

  return "";
});

const validateFormField = async (field, value) => {
  if (formSubmitted.value) return true;

  let result;

  switch (field) {
    case "name":
      result = validateName(value);
      errors.name = result.message || t("pages.dash.userForm.errors.nameLength");
      return result.isValid;
    case "email":
      result = validateEmail(value);
      errors.email = result.message || (result.isValid ? "" : t("pages.dash.userForm.errors.emailInvalid"));
      return result.isValid;
    case "type":
      result = validateType(value);
      errors.type = result.message || t("pages.dash.userForm.errors.typeRequired");
      return result.isValid;
    case "password":
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

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;

  if (isValidatingPassword.value) return false;

  const mandatoryFieldsValid = !errors.name && !errors.email && !errors.type;

  const passwordValid = !errors.password;

  return mandatoryFieldsValid && passwordValid;
});

const validateForm = async () => {
  if (formSubmitted.value) return true;

  let isValid = true;
  errors.name = "";
  errors.email = "";
  errors.type = "";
  errors.password = "";

  if (!isAdminAccount.value) {
    isValid = (await validateFormField("name", formData.name)) && isValid;
    isValid = (await validateFormField("type", formData.type)) && isValid;
  }
  isValid = (await validateFormField("email", formData.email)) && isValid;
  isValid = (await validateFormField("password", formData.password)) && isValid;

  return isValid;
};

const checkEmailAvailability = async (email) => {
  try {
    const response = await axios.get(`/api/users/emailCheck?email=${email}`);
    return !response.data.data.exists;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

const handleSubmit = async () => {
  const formValid = await validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    if (!isEditMode.value || (isEditMode.value && formData.email !== initialEmail.value)) {
      const isEmailAvailable = await checkEmailAvailability(formData.email);
      if (!isEmailAvailable) {
        errors.email = t("pages.dash.userForm.errors.emailExists");
        toast.error(t("pages.dash.userForm.errors.emailExists"));
        buttonState.value = "error";
        setTimeout(() => {
          buttonState.value = "default";
        }, 2000);
        isSubmitting.value = false;
        return;
      }
    }

    if (isEditMode.value) {
      const userUpdate = { ...formData };
      if (!formData.password) delete userUpdate.password;

      if (isAdminAccount.value) {
        userUpdate.name = initialUserData.value.name;
        userUpdate.type = initialUserData.value.type;
      }

      const response = await axios.put(`/api/users?id=${userId.value}`, userUpdate);

      if (response.status === 200) {
        formSubmitted.value = true;
        errors.name = "";
        errors.email = "";
        errors.type = "";
        errors.password = "";
        buttonState.value = "success";
        toast.success(t("pages.dash.userForm.notifications.updateSuccess"));
        setTimeout(() => router.push({ name: "dashUsers" }), 2000);
      }
    } else {
      formData.createdBy = authStore.userId;
      const response = await axios.post("/api/users", formData);

      if (response.status === 201) {
        formSubmitted.value = true;
        errors.name = "";
        errors.email = "";
        errors.type = "";
        errors.password = "";
        buttonState.value = "success";
        toast.success(t("pages.dash.userForm.notifications.createSuccess"));
        setTimeout(() => router.push({ name: "dashUsers" }), 2000);
      }
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    buttonState.value = "error";

    if (error.message && error.message.includes("BigInt")) {
      toast.error(t("pages.dash.userForm.errors.bigIntError"));
    } else if (error.response) {
      toast.error(error.response.data?.message || t("pages.dash.userForm.errors.unknown"));
    } else if (error.request) {
      toast.error(t("pages.dash.userForm.errors.noResponse"));
    } else {
      toast.error(t("pages.dash.userForm.errors.requestSetup"));
    }
    setTimeout(() => {
      buttonState.value = "default";
    }, 2000);
  } finally {
    isSubmitting.value = false;
  }
};

const creatorData = ref(null);
const isLoadingCreator = ref(false);
const creatorError = ref(false);

const loadCreatorData = async (creatorId) => {
  if (!creatorId || creatorId === "System") return;

  isLoadingCreator.value = true;
  creatorError.value = false;

  try {
    const response = await axios.get(`/api/users?id=${creatorId}`);
    if (response.status === 200 && response.data.data) {
      creatorData.value = response.data.data;
    } else {
      creatorError.value = true;
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario creador:", error);
    creatorError.value = true;
  } finally {
    isLoadingCreator.value = false;
  }
};

const createdByLabel = computed(() => {
  if (!initialUserData.value) return "";
  if (initialUserData.value.createdBy === "System") return t("pages.dash.userForm.profile.systemUser");
  if (isLoadingCreator.value) return t("pages.dash.userForm.profile.loading");
  if (creatorError.value) return t("pages.dash.userForm.profile.errorLoading");
  if (creatorData.value) return creatorData.value.name;
  return initialUserData.value.createdBy;
});

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString();
}
</script>
