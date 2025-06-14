<template>
  <div class="h-full w-full p-6">
    <div class="flex items-center mb-2">
      <h1 class="text-3xl font-bold text-text-950 k2d">
        {{ pageTitle }}
      </h1>
    </div>
    <p class="text-text-800 mb-6">{{ pageDescription }}</p>

    <div class="relative">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="order-2 lg:order-1">
          <div
            class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] h-full">
            <h3 class="text-lg font-medium text-text-900 mb-4">
              {{ t("pages.dash.userForm.profile.preview") }}
            </h3>

            <div class="bg-background-50 p-5 rounded-lg border border-background-200">
              <div class="flex items-center mb-5">
                <div class="relative mr-5">
                  <div
                    class="w-20 h-20 rounded-full bg-background-200 flex items-center justify-center overflow-hidden border-2 border-background-300 shadow-md">
                    <User class="w-9 h-9 text-primary-600" v-if="!formData.name" />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-primary-700 font-bold k2d bg-primary-100"
                      style="font-size: 2rem">
                      {{ getInitials(formData.name) }}
                    </div>
                  </div>
                  <div
                    v-if="formData.type"
                    class="absolute -bottom-1.5 -right-1.5 rounded-full p-2 shadow-sm border border-background-50 bg-primary-100">
                    <component :is="roleIcons[formData.type]" class="w-4 h-4 text-primary-600" />
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
                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Mail class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.userForm.form.labels.email") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ formData.email || t("pages.dash.userForm.form.placeholders.noEmail") }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Calendar class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.userForm.profile.creationDate") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ isEditMode && initialUserData ? formatDate(initialUserData.createdDate) : currentDate }}
                    </p>
                  </div>
                </div>
                <template v-if="isEditMode && initialUserData">
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <Calendar class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.userForm.profile.lastAccess") }}</p>
                      <p class="text-text-800 font-medium">
                        {{
                          initialUserData.lastLogin
                            ? formatDate(initialUserData.lastLogin)
                            : t("pages.dash.userForm.profile.neverLoggedIn") || "Nunca"
                        }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <Mail class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.userForm.profile.createdBy") }}</p>
                      <p class="text-text-800 font-medium">{{ initialUserData.createdBy }}</p>
                    </div>
                  </div>
                </template>

                <div
                  v-if="formData.type"
                  class="flex items-start p-3 bg-background-100 rounded-lg border border-background-200">
                  <ShieldCheck class="w-5 h-5 text-primary-600 mr-3 mt-0.5" />
                  <div class="w-full">
                    <p class="text-xs text-text-600 flex items-center justify-between">
                      <span>{{ t("pages.dash.userForm.profile.userPermissions") }}</span>
                      <span class="text-primary-600 text-[10px] font-medium bg-primary-50 px-1.5 py-0.5 rounded-full">
                        {{ permissions[formData.type].length }}
                      </span>
                    </p>

                    <div class="mt-1.5 space-y-1">
                      <div
                        v-for="(permission, index) in permissions[formData.type]"
                        :key="index"
                        class="flex items-center text-text-800 text-xs">
                        <CheckCircle class="w-3 h-3 text-primary-600 mr-1.5 flex-shrink-0" />
                        <span>{{ permission }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Shield class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.userForm.profile.permissions") }}</p>
                    <p class="text-text-600 text-sm">
                      {{ t("pages.dash.userForm.profile.selectRoleForPermissions") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <div
            class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] h-full">
            <h3 class="text-lg font-medium text-text-900 mb-4">
              {{ isEditMode ? t("pages.dash.userForm.common.edit") : t("pages.dash.userForm.common.create") }}
            </h3>

            <div class="space-y-6">
              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.userForm.form.sections.basicInfo") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="name">
                    {{ t("pages.dash.userForm.form.labels.name") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.name"
                      id="name"
                      type="text"
                      class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.name }"
                      :placeholder="t('pages.dash.userForm.form.placeholders.name') || 'Nombre de la cuenta'"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2
                        v-if="!errors.name && formData.name && formData.name.length >= 3"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="formData.name || touchedFields.name"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="email">
                    {{ t("pages.dash.userForm.form.labels.email") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.email"
                      id="email"
                      type="email"
                      class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.email }"
                      :placeholder="t('pages.dash.userForm.form.placeholders.email') || 'E-Mail de la cuenta'"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2
                        v-if="!errors.email && formData.email && isValidEmail(formData.email)"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="formData.email || touchedFields.email"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div v-if="isEditMode" class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="password">
                    {{ t("pages.dash.userForm.form.labels.password") || "Contraseña" }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.password"
                      id="password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      class="block w-full pl-10 pr-20 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.password }"
                      :placeholder="
                        t('pages.dash.userForm.form.placeholders.password') || 'Dejar vacío para no cambiar'
                      " />
                    <div class="absolute inset-y-0 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="p-1 hover:bg-background-100 rounded-md transition-colors duration-150"
                        :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                        <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4 text-text-500" />
                      </button>
                      <CheckCircle2
                        v-if="formData.password && formData.password.length >= 6"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle v-else-if="formData.password" class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <ShieldCheck class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.userForm.form.sections.accessInfo") }}
                </h4>

                <div>
                  <label class="block text-text-700 text-sm font-medium mb-2" for="userType">
                    {{ t("pages.dash.userForm.form.labels.userType") }}
                  </label>
                  <div class="relative">
                    <Listbox v-model="formData.type" @update:modelValue="touchedFields.type = true">
                      <div class="relative">
                        <ListboxButton
                          class="relative w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 bg-background-50 text-left"
                          :class="[
                            { 'border-accent-500 ring-1 ring-accent-300': errors.type },
                            !formData.type ? 'text-text-400' : 'text-text-950 font-medium',
                          ]">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <component
                              :is="formData.type ? roleIcons[formData.type] : Shield"
                              class="w-5 h-5 text-primary-600" />
                          </div>
                          <span class="block truncate">
                            {{
                              formData.type
                                ? t(`pages.dash.users.types.${formData.type}`)
                                : t("pages.dash.userForm.form.placeholders.selectType")
                            }}
                          </span>
                          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div class="flex items-center">
                              <XCircle v-if="errors.type" class="w-5 h-5 text-accent-500 mr-2 animate-fadeIn" />
                              <ChevronDown class="w-5 h-5 text-text-400" />
                            </div>
                          </span>
                        </ListboxButton>
                        <transition
                          enter-active-class="transition ease-out duration-100"
                          enter-from-class="transform opacity-0 scale-95"
                          enter-to-class="transform opacity-100 scale-100"
                          leave-active-class="transition ease-in duration-75"
                          leave-from-class="transform opacity-100 scale-100"
                          leave-to-class="transform opacity-0 scale-95">
                          <ListboxOptions
                            class="absolute z-10 mt-1 w-full bg-background-50 border border-background-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm origin-top-right">
                            <ListboxOption
                              v-for="type in userTypes"
                              :key="type"
                              :value="type"
                              v-slot="{ active, selected }">
                              <li
                                :class="[
                                  selected
                                    ? 'bg-primary-100 border-l-primary-500 text-primary-800'
                                    : active
                                      ? 'bg-primary-50 border-l-primary-300 text-primary-600'
                                      : 'text-text-800',
                                  'cursor-default select-none relative py-2 pl-10 pr-4 transition-all duration-150 border-l-[3px]',
                                  selected ? 'border-l-[3px]' : active ? 'border-l-[3px]' : 'border-transparent',
                                ]">
                                <div class="flex items-center">
                                  <component :is="roleIcons[type]" class="mr-2 h-5 w-5 text-primary-600" />
                                  <span :class="[selected ? 'font-medium' : 'font-normal']">
                                    {{ t(`pages.dash.users.types.${type}`) }}
                                  </span>
                                </div>
                                <span
                                  v-if="selected"
                                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                                  <Check class="w-4 h-4 text-primary-600" />
                                </span>
                              </li>
                            </ListboxOption>
                          </ListboxOptions>
                        </transition>
                      </div>
                    </Listbox>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end items-center mt-6 gap-2">
              <button
                type="button"
                class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-background-100 text-text-700 border border-background-300 hover:bg-background-200 transition-colors duration-150 cursor-pointer"
                @click="$router.push({ name: 'dashUsers' })">
                <X class="w-4 h-4 mr-2" />
                {{ t("pages.dash.userForm.common.cancel") }}
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
                :disabled="isSubmitting || !isFormValid">
                <div v-if="buttonState === 'processing'" class="flex items-center">
                  <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                  {{
                    isEditMode
                      ? t("pages.dash.userForm.form.actions.updating")
                      : t("pages.dash.userForm.form.actions.submitting")
                  }}
                </div>
                <div v-else-if="buttonState === 'success'" class="flex items-center">
                  <CheckCircle2 class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.userForm.common.status.success") }}
                </div>
                <div v-else-if="buttonState === 'error'" class="flex items-center">
                  <XCircle class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.userForm.common.status.error") }}
                </div>
                <div v-else class="flex items-center">
                  <Save class="w-4 h-4 mr-2" />
                  {{ isEditMode ? t("pages.dash.userForm.common.update") : t("pages.dash.userForm.common.create") }}
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
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import {
  User,
  Mail,
  Shield,
  ChevronDown,
  Loader2,
  ClipboardList,
  CheckCircle2,
  ShieldCheck,
  X,
  Save,
  Users,
  ShieldAlert,
  Check,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-vue-next";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import axios from "axios";
import iziToast from "izitoast";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id);
const initialUserData = ref(null);
const initialEmail = ref("");
const isLoading = ref(isEditMode.value);
const loadError = ref(null);
const showPassword = ref(false);
import { useAuthStore } from "@/stores/authStore";
const authStore = useAuthStore();

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

const validateName = (value) => {
  if (!value || value.trim().length < 3) {
    errors.name = t("pages.dash.userForm.errors.nameLength");
    return false;
  }
  errors.name = "";
  return true;
};

const validateEmail = (value) => {
  if (!value) {
    errors.email = t("pages.dash.userForm.errors.emailRequired");
    return false;
  }
  if (!isValidEmail(value)) {
    errors.email = t("pages.dash.userForm.errors.emailInvalid");
    return false;
  }
  errors.email = "";
  return true;
};

const validateType = (value) => {
  if (!value) {
    errors.type = t("pages.dash.userForm.errors.typeRequired");
    return false;
  }
  errors.type = "";
  return true;
};

const validatePassword = (value) => {
  if (!value) {
    errors.password = "";
    return true;
  }
  if (value.length < 6) {
    errors.password =
      t("pages.dash.userForm.errors.passwordLength") || "La contraseña debe tener al menos 6 caracteres.";
    return false;
  }
  errors.password = "";
  return true;
};

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

const userTypes = ["normalUser", "managerUser", "adminUser"];

const roleIcons = {
  normalUser: Users,
  managerUser: ShieldCheck,
  adminUser: ShieldAlert,
};

const permissions = computed(() => ({
  normalUser: [t("pages.dash.userForm.permissions.viewContent"), t("pages.dash.userForm.permissions.editOwnProfile")],
  managerUser: [
    t("pages.dash.userForm.permissions.viewContent"),
    t("pages.dash.userForm.permissions.editOwnProfile"),
    t("pages.dash.userForm.permissions.manageUsers"),
    t("pages.dash.userForm.permissions.manageContent"),
  ],
  adminUser: [
    t("pages.dash.userForm.permissions.viewContent"),
    t("pages.dash.userForm.permissions.editOwnProfile"),
    t("pages.dash.userForm.permissions.manageUsers"),
    t("pages.dash.userForm.permissions.manageContent"),
    t("pages.dash.userForm.permissions.manageSystem"),
    t("pages.dash.userForm.permissions.fullAccess"),
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

const isFormValid = computed(() => {
  return (
    validateName(formData.name) &&
    validateEmail(formData.email) &&
    validateType(formData.type) &&
    validatePassword(formData.password)
  );
});

watch(
  () => formData.name,
  (newVal) => {
    touchedFields.name = true;
    validateName(newVal);
  },
  { immediate: true },
);

watch(
  () => formData.email,
  (newVal) => {
    touchedFields.email = true;
    validateEmail(newVal);
  },
  { immediate: true },
);

watch(
  () => formData.type,
  (newVal) => {
    touchedFields.type = true;
    validateType(newVal);
  },
  { immediate: true },
);

const validateForm = () => {
  let isValid = true;
  errors.name = "";
  errors.email = "";
  errors.type = "";
  errors.password = "";

  isValid = validateName(formData.name) && isValid;
  isValid = validateEmail(formData.email) && isValid;
  isValid = validateType(formData.type) && isValid;
  isValid = validatePassword(formData.password) && isValid;

  return isValid;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
  if (!validateForm()) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    if (!isEditMode.value || (isEditMode.value && formData.email !== initialEmail.value)) {
      const isEmailAvailable = await checkEmailAvailability(formData.email);
      if (!isEmailAvailable) {
        errors.email = t("pages.dash.userForm.errors.emailExists");
        iziToast.error({
          message: t("pages.dash.userForm.errors.emailExists"),
          position: "topRight",
        });
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

      const response = await axios.put(`/api/users?id=${userId.value}`, userUpdate);

      if (response.status === 200) {
        buttonState.value = "success";
        iziToast.success({
          message: t("pages.dash.userForm.notifications.updateSuccess"),
          position: "topRight",
        });
        setTimeout(() => router.push({ name: "dashUsers" }), 2000);
      }
    } else {
      formData.createdBy = authStore.userId;
      const response = await axios.post("/api/users", formData);

      if (response.status === 201) {
        buttonState.value = "success";
        iziToast.success({
          message: t("pages.dash.userForm.notifications.createSuccess"),
          position: "topRight",
        });
        setTimeout(() => router.push({ name: "dashUsers" }), 2000);
      }
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    buttonState.value = "error";

    if (error.message && error.message.includes("BigInt")) {
      iziToast.error({
        message: t("pages.dash.userForm.errors.bigIntError"),
        position: "topRight",
      });
    } else if (error.response) {
      iziToast.error({
        message: error.response.data?.message || t("pages.dash.userForm.errors.unknown"),
        position: "topRight",
      });
    } else if (error.request) {
      iziToast.error({
        message: t("pages.dash.userForm.errors.noResponse"),
        position: "topRight",
      });
    } else {
      iziToast.error({
        message: t("pages.dash.userForm.errors.requestSetup"),
        position: "topRight",
      });
    }
    setTimeout(() => {
      buttonState.value = "default";
    }, 2000);
  } finally {
    isSubmitting.value = false;
  }
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString();
}
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
