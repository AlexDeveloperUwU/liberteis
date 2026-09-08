<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="pageTitle" :description="pageDescription" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.spacesForm.profile.preview')" class="h-full">
          <div class="bg-background-50 p-5 rounded-lg border border-background-200">
            <div class="flex items-center mb-5">
              <div class="relative mr-5">
                <div
                  class="w-20 h-20 rounded-full bg-background-200 flex items-center justify-center overflow-hidden border-2 border-background-300 shadow-md">
                  <Map v-if="!formData.name" class="w-9 h-9 text-primary-600" />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-primary-700 font-bold font-display bg-primary-100"
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
              <InfoRow icon="map-pin" :label="t('pages.dash.spacesForm.form.labels.location')" :value="formData.location || t('pages.dash.spacesForm.form.placeholders.noLocation')" />
              <InfoRow
                v-if="isEditMode && initialSpaceData"
                icon="mail"
                :label="t('pages.dash.spacesForm.profile.createdBy')"
                :value="createdByLabel" />
              <InfoRow
                icon="file-text"
                align="start"
                :label="t('pages.dash.spacesForm.form.labels.info')"
                :value="formData.info || t('pages.dash.spacesForm.form.placeholders.noInfo')" />
            </div>
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="isEditMode ? t('pages.dash.spacesForm.common.edit') : t('pages.dash.spacesForm.common.create')" class="h-full">
          <div class="bg-background-50 p-4 rounded-lg border border-background-200 space-y-4">
            <h4 class="text-sm font-medium text-text-700 mb-1 flex items-center">
              <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
              {{ t("pages.dash.spacesForm.form.sections.basicInfo") }}
            </h4>

            <TextField
              v-model="formData.name"
              :label="t('pages.dash.spacesForm.form.labels.name')"
              icon="map"
              :error="!formSubmitted ? errors.name : null"
              :valid="(!errors.name || formSubmitted) && !!formData.name && formData.name.length >= 3"
              :placeholder="t('pages.dash.spacesForm.form.placeholders.name')"
              required />

            <TextField
              v-model="formData.location"
              :label="t('pages.dash.spacesForm.form.labels.location')"
              icon="map-pin"
              :error="!formSubmitted ? errors.location : null"
              :valid="(!errors.location || formSubmitted) && !!formData.location && formData.location.length >= 3"
              :placeholder="t('pages.dash.spacesForm.form.placeholders.location')"
              required />

            <label class="block">
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.spacesForm.form.labels.info") }}</span>
              <textarea
                v-model="formData.info"
                rows="5"
                class="block w-full p-3 border-[1.5px] border-background-300 rounded-md bg-background-50 text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
                :placeholder="t('pages.dash.spacesForm.form.placeholders.info')"></textarea>
            </label>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="x" @click="$router.push({ name: 'dashSpaces' })">
              {{ t("pages.dash.spacesForm.common.cancel") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid">
              <template v-if="buttonState === 'processing'">
                {{ isEditMode ? t("pages.dash.spacesForm.form.actions.updating") : t("pages.dash.spacesForm.form.actions.submitting") }}
              </template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.spacesForm.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.spacesForm.common.status.error") }}</template>
              <template v-else>{{ isEditMode ? t("pages.dash.spacesForm.common.update") : t("pages.dash.spacesForm.common.create") }}</template>
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
import { Map, ClipboardList } from "lucide-vue-next";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import PageHeader from "@/components/data/PageHeader.vue";
import DsCard from "@/components/core/DsCard.vue";
import InfoRow from "@/components/data/InfoRow.vue";
import TextField from "@/components/forms/TextField.vue";
import DsButton from "@/components/core/DsButton.vue";

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
    case "name": {
      const isNameValid = value && value.length >= 3 && value.length <= 100;
      errors.name = isNameValid ? "" : t("pages.dash.spacesForm.errors.nameLength");
      return isNameValid;
    }
    case "location": {
      const isLocationValid = value && value.length >= 3;
      errors.location = isLocationValid ? "" : t("pages.dash.spacesForm.errors.locationLength");
      return isLocationValid;
    }
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

const createdByLabel = computed(() => {
  if (isLoadingCreator.value) return t("pages.dash.spacesForm.profile.loading");
  if (creatorError.value) return t("pages.dash.spacesForm.profile.errorLoading");
  if (creatorData.value) return creatorData.value.name;
  return initialSpaceData.value?.createdBy ?? "";
});
</script>
