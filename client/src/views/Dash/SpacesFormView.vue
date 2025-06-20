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
              {{ t("pages.dash.spacesForm.profile.preview") }}
            </h3>

            <div class="bg-background-50 p-5 rounded-lg border border-background-200">
              <div class="flex items-center mb-5">
                <div class="relative mr-5">
                  <div
                    class="w-20 h-20 rounded-full bg-background-200 flex items-center justify-center overflow-hidden border-2 border-background-300 shadow-md">
                    <Map class="w-9 h-9 text-primary-600" v-if="!formData.name" />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-primary-700 font-bold k2d bg-primary-100"
                      style="font-size: 2rem">
                      {{ getInitials(formData.name) }}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-xl font-bold text-text-900">
                    {{ formData.name || t("pages.dash.spacesForm.form.placeholders.name") }}
                  </h3>
                  <p class="text-text-600 text-sm mt-1">
                    {{ formData.location || t("pages.dash.spacesForm.form.placeholders.location") }}
                  </p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <MapPin class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.spacesForm.form.labels.location") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ formData.location || t("pages.dash.spacesForm.form.placeholders.noLocation") }}
                    </p>
                  </div>
                </div>
                <template v-if="isEditMode && initialSpaceData">
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <Mail class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.spacesForm.profile.createdBy") }}</p>
                      <p class="text-text-800 font-medium">
                        <span v-if="isLoadingCreator">{{ t("pages.dash.spacesForm.profile.loading") }}</span>
                        <span v-else-if="creatorError">{{ t("pages.dash.spacesForm.profile.errorLoading") }}</span>
                        <span v-else-if="creatorData">{{ creatorData.name }}</span>
                        <span v-else>{{ initialSpaceData.createdBy }}</span>
                      </p>
                    </div>
                  </div>
                </template>

                <div
                  v-if="formData.info"
                  class="flex items-start p-3 bg-background-100 rounded-lg border border-background-200">
                  <FileText class="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div class="w-full">
                    <p class="text-xs text-text-600">{{ t("pages.dash.spacesForm.form.labels.info") }}</p>
                    <p class="text-text-800 mt-1 whitespace-pre-wrap break-words">
                      {{ formData.info }}
                    </p>
                  </div>
                </div>
                <div v-else class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <FileText class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.spacesForm.form.labels.info") }}</p>
                    <p class="text-text-600 text-sm">
                      {{ t("pages.dash.spacesForm.form.placeholders.noInfo") }}
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
              {{ isEditMode ? t("pages.dash.spacesForm.common.edit") : t("pages.dash.spacesForm.common.create") }}
            </h3>

            <div class="space-y-6">
              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.spacesForm.form.sections.basicInfo") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="name">
                    {{ t("pages.dash.spacesForm.form.labels.name") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Map
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.name"
                      id="name"
                      type="text"
                      class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{
                        'border-accent-500 ring-1 ring-accent-300': errors.name && !formSubmitted,
                      }"
                      :placeholder="t('pages.dash.spacesForm.form.placeholders.name') || 'Nombre del espacio'"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2
                        v-if="(!errors.name || formSubmitted) && formData.name && formData.name.length >= 3"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="(formData.name || touchedFields.name) && !formSubmitted"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="location">
                    {{ t("pages.dash.spacesForm.form.labels.location") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.location"
                      id="location"
                      type="text"
                      class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.location && !formSubmitted }"
                      :placeholder="t('pages.dash.spacesForm.form.placeholders.location') || 'Localización del espacio'"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2
                        v-if="(!errors.location || formSubmitted) && formData.location && formData.location.length >= 3"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="(formData.location || touchedFields.location) && !formSubmitted"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="info">
                    {{ t("pages.dash.spacesForm.form.labels.info") }}
                  </label>
                  <div class="relative group">
                    <textarea
                      v-model="formData.info"
                      id="info"
                      rows="5"
                      class="block w-full p-3 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950"
                      :placeholder="
                        t('pages.dash.spacesForm.form.placeholders.info') || 'Información del espacio'
                      "></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end items-center mt-6 gap-2">
              <button
                type="button"
                class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-background-100 text-text-700 border border-background-300 hover:bg-background-200 transition-colors duration-150 cursor-pointer"
                @click="$router.push({ name: 'dashSpaces' })">
                <X class="w-4 h-4 mr-2" />
                {{ t("pages.dash.spacesForm.common.cancel") }}
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
                      ? t("pages.dash.spacesForm.form.actions.updating")
                      : t("pages.dash.spacesForm.form.actions.submitting")
                  }}
                </div>
                <div v-else-if="buttonState === 'success'" class="flex items-center">
                  <CheckCircle2 class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.spacesForm.common.status.success") }}
                </div>
                <div v-else-if="buttonState === 'error'" class="flex items-center">
                  <XCircle class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.spacesForm.common.status.error") }}
                </div>
                <div v-else class="flex items-center">
                  <Save class="w-4 h-4 mr-2" />
                  {{ isEditMode ? t("pages.dash.spacesForm.common.update") : t("pages.dash.spacesForm.common.create") }}
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
  Map,
  MapPin,
  Info,
  Mail,
  Loader2,
  ClipboardList,
  CheckCircle2,
  X,
  Save,
  Calendar,
  XCircle,
  FileText,
} from "lucide-vue-next";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const isEditMode = computed(() => !!route.params.id);
const spaceId = computed(() => route.params.id);
const initialSpaceData = ref(null);
const isLoading = ref(isEditMode.value);
const loadError = ref(null);

onMounted(() => {
  if (isEditMode.value && route.meta.initialData) {
    initialSpaceData.value = route.meta.initialData.space;

    if (initialSpaceData.value) {
      formData.name = initialSpaceData.value.name || "";
      formData.location = initialSpaceData.value.location || "";
      formData.info = initialSpaceData.value.info || "";
      isLoading.value = false;
    } else if (route.meta.initialData.error) {
      loadError.value = t("pages.dash.spacesForm.errors.loadingSpace");
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});

watch(
  () => initialSpaceData.value,
  (newVal) => {
    if (newVal && newVal.createdBy) {
      loadCreatorData(newVal.createdBy);
    }
  },
  { immediate: true },
);

const pageTitle = computed(() => {
  return isEditMode.value ? t("pages.dash.spacesForm.page.editTitle") : t("pages.dash.spacesForm.page.createTitle");
});

const pageDescription = computed(() => {
  return isEditMode.value
    ? t("pages.dash.spacesForm.page.editDescription")
    : t("pages.dash.spacesForm.page.createDescription");
});

const formData = reactive({
  name: "",
  location: "",
  info: "",
});

const errors = reactive({
  name: "",
  location: "",
  info: "",
});

const touchedFields = reactive({
  name: false,
  location: false,
  info: false,
});

const isSubmitting = ref(false);
const buttonState = ref("default");
const formSubmitted = ref(false);

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

const validateFormField = (field, value) => {
  if (formSubmitted.value) return true;

  switch (field) {
    case "name":
      const isNameValid = value && value.length >= 3 && value.length <= 100;
      errors.name = isNameValid ? "" : t("pages.dash.spacesForm.errors.nameLength");
      return isNameValid;
    case "location":
      const isLocationValid = value && value.length >= 3;
      errors.location = isLocationValid ? "" : t("pages.dash.spacesForm.errors.locationLength");
      return isLocationValid;
    default:
      return true;
  }
};

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;

  const mandatoryFieldsValid = !errors.name && !errors.location;
  const fieldsNotEmpty = formData.name && formData.location;

  return mandatoryFieldsValid && fieldsNotEmpty;
});

watch(
  () => formData.name,
  (newVal) => {
    touchedFields.name = true;
    validateFormField("name", newVal);
  },
);

watch(
  () => formData.location,
  (newVal) => {
    touchedFields.location = true;
    validateFormField("location", newVal);
  },
);

const validateForm = () => {
  if (formSubmitted.value) return true;

  let isValid = true;
  errors.name = "";
  errors.location = "";

  isValid = validateFormField("name", formData.name) && isValid;
  isValid = validateFormField("location", formData.location) && isValid;

  return isValid;
};

const handleSubmit = async () => {
  const formValid = validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    if (isEditMode.value) {
      const spaceUpdate = { ...formData };

      const response = await axios.put(`/api/spaces?id=${spaceId.value}`, spaceUpdate);

      if (response.status === 200) {
        formSubmitted.value = true;
        errors.name = "";
        errors.location = "";
        errors.info = "";
        buttonState.value = "success";
        toast.success(t("pages.dash.spacesForm.notifications.updateSuccess"));
        setTimeout(() => router.push({ name: "dashSpaces" }), 2000);
      }
    } else {
      const spaceData = {
        ...formData,
        createdBy: authStore.userId,
      };

      const response = await axios.post("/api/spaces", spaceData);

      if (response.status === 201) {
        formSubmitted.value = true;
        errors.name = "";
        errors.location = "";
        errors.info = "";
        buttonState.value = "success";
        toast.success(t("pages.dash.spacesForm.notifications.createSuccess"));
        setTimeout(() => router.push({ name: "dashSpaces" }), 2000);
      }
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    buttonState.value = "error";

    if (error.response) {
      toast.error(error.response.data?.message || t("pages.dash.spacesForm.errors.unknown"));
    } else if (error.request) {
      toast.error(t("pages.dash.spacesForm.errors.noResponse"));
    } else {
      toast.error(t("pages.dash.spacesForm.errors.requestSetup"));
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
  if (!creatorId) return;

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
