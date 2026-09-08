<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="pageTitle" :description="pageDescription" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.eventsForm.profile.preview')" class="h-full">
          <div class="bg-background-50 p-5 rounded-lg border border-background-200 space-y-4">
            <InfoRow icon="calendar-days" :label="t('pages.dash.eventsForm.form.labels.title')" :value="formData.title || t('pages.dash.eventsForm.form.placeholders.title')" />

            <div class="flex justify-center">
              <div
                class="relative rounded-lg overflow-hidden border border-background-300 shadow-sm cursor-pointer group"
                style="width: 15%; aspect-ratio: 9/16"
                @click="openImageModal">
                <div v-if="imagePreview || formData.coverUrl" class="w-full h-full">
                  <img :src="imagePreview || formData.coverUrl" :alt="t('pages.other.commons.altText.eventCover')" class="w-full h-full object-cover" />
                  <div
                    class="absolute inset-0 bg-background-950/10 group-hover:bg-background-950/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div class="bg-background-50/90 p-2 rounded-full">
                      <Search class="w-5 h-5 text-text-900" />
                    </div>
                  </div>
                </div>
                <div v-else class="w-full h-full bg-background-200 flex flex-col items-center justify-center">
                  <ImageIcon class="w-12 h-12 text-primary-600 mb-2" />
                  <p class="text-text-600 text-sm">{{ t("pages.dash.eventsForm.form.placeholders.noCover") }}</p>
                </div>
              </div>
            </div>

            <InfoRow icon="bookmark" :label="t('pages.dash.eventsForm.form.labels.category')" :value="selectedCategoryName || t('pages.dash.eventsForm.form.placeholders.noCategory')" />
            <InfoRow
              v-if="isEditMode && initialEventData"
              icon="user"
              :label="t('pages.dash.eventsForm.profile.createdBy')"
              :value="createdByLabel" />
            <InfoRow icon="file-text" align="start" :label="t('pages.dash.eventsForm.form.labels.info')" :value="formData.info || t('pages.dash.eventsForm.form.placeholders.noInfo')" />
            <InfoRow icon="clock" :label="t('pages.dash.eventsForm.form.labels.duration')" :value="formatDuration(formData.duration)" />
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="isEditMode ? t('pages.dash.eventsForm.common.edit') : t('pages.dash.eventsForm.common.create')" class="h-full">
          <div class="bg-background-50 p-4 rounded-lg border border-background-200 space-y-4">
            <h4 class="text-sm font-medium text-text-700 mb-1 flex items-center">
              <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
              {{ t("pages.dash.eventsForm.form.sections.basicInfo") }}
            </h4>

            <TextField
              v-model="formData.title"
              :label="t('pages.dash.eventsForm.form.labels.title')"
              icon="calendar-days"
              :error="!formSubmitted ? errors.title : null"
              :valid="(!errors.title || formSubmitted) && !!formData.title && formData.title.length >= 3"
              :placeholder="t('pages.dash.eventsForm.form.placeholders.title')"
              required />

            <SelectMenu
              v-model="selectedCategory"
              :label="t('pages.dash.eventsForm.form.labels.category')"
              icon="bookmark"
              :options="categoryOptions"
              :placeholder="t('pages.dash.eventsForm.form.placeholders.selectCategory')"
              :error="!formSubmitted && errors.category ? errors.category : false" />

            <div>
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.eventsForm.form.labels.duration") }}</span>
              <div class="grid grid-cols-2 gap-4">
                <span class="relative flex items-center">
                  <Clock class="absolute left-3 w-4 h-4 text-text-500 pointer-events-none" />
                  <input
                    v-model.number="formData.hours"
                    type="number"
                    min="0"
                    max="24"
                    step="1"
                    class="w-full h-10 pl-9 pr-16 rounded-md border-[1.5px] border-background-300 bg-background-50 text-text-900 text-sm no-spinner focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
                    :placeholder="t('pages.dash.eventsForm.form.placeholders.hours')"
                    @input="updateDuration" />
                  <span class="absolute right-3 text-sm text-text-600">{{ t("pages.dash.eventsForm.form.labels.hours") }}</span>
                </span>
                <span class="relative flex items-center">
                  <Clock class="absolute left-3 w-4 h-4 text-text-500 pointer-events-none" />
                  <input
                    v-model.number="formData.minutes"
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    class="w-full h-10 pl-9 pr-16 rounded-md border-[1.5px] bg-background-50 text-text-900 text-sm no-spinner focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
                    :class="errors.duration && !formSubmitted ? 'border-accent-500 ring-1 ring-accent-300' : 'border-background-300'"
                    :placeholder="t('pages.dash.eventsForm.form.placeholders.minutes')"
                    @input="updateDuration" />
                  <span class="absolute right-3 text-sm text-text-600">{{ t("pages.dash.eventsForm.form.labels.minutes") }}</span>
                </span>
              </div>
              <p v-if="errors.duration && !formSubmitted" class="mt-1 text-xs text-accent-600">{{ errors.duration }}</p>
            </div>

            <div>
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.eventsForm.form.labels.info") }}</span>
              <span class="relative block">
                <textarea
                  v-model="formData.info"
                  rows="5"
                  maxlength="500"
                  class="block w-full p-3 border-[1.5px] rounded-md bg-background-50 text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
                  :class="errors.info && !formSubmitted ? 'border-accent-500 ring-1 ring-accent-300' : 'border-background-300'"
                  :placeholder="t('pages.dash.eventsForm.form.placeholders.info')"></textarea>
                <span class="absolute bottom-3 right-3 flex items-center gap-2">
                  <span class="text-xs text-text-500">{{ formData.info.length }}/500</span>
                  <CheckCircle2 v-if="(!errors.info || formSubmitted) && formData.info && formData.info.length >= 3" class="w-4 h-4 text-primary-500" />
                  <XCircle v-else-if="(formData.info || touchedFields.info) && !formSubmitted && errors.info" class="w-4 h-4 text-accent-500" />
                </span>
              </span>
            </div>

            <div>
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.eventsForm.form.labels.cover") }}</span>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
              <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="onDrop">
                <div
                  class="border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer w-full"
                  :class="[
                    isDragging ? 'border-primary-500 bg-primary-50' : 'border-background-300 hover:border-primary-300',
                    showErrorMessage ? 'border-accent-500 bg-accent-50' : '',
                  ]"
                  @click="fileInput.click()">
                  <UploadCloud class="w-8 h-8 mx-auto text-primary-600 mb-1.5" />
                  <p :class="['font-medium mb-0.5', showErrorMessage ? 'text-accent-700' : 'text-text-700']">
                    {{
                      showErrorMessage
                        ? displayErrorMessage
                        : isDragging
                          ? t("pages.dash.eventsForm.form.placeholders.dropImageHere")
                          : t("pages.dash.eventsForm.form.placeholders.uploadCover")
                    }}
                  </p>
                  <p v-if="!showErrorMessage" class="text-text-500 text-xs">{{ t("pages.dash.eventsForm.form.placeholders.coverFormat") }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="x" @click="$router.push({ name: 'dashEvents' })">
              {{ t("pages.dash.eventsForm.common.cancel") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid">
              <template v-if="buttonState === 'processing'">
                {{ isEditMode ? t("pages.dash.eventsForm.form.actions.updating") : t("pages.dash.eventsForm.form.actions.submitting") }}
              </template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.eventsForm.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.eventsForm.common.status.error") }}</template>
              <template v-else>{{ isEditMode ? t("pages.dash.eventsForm.common.update") : t("pages.dash.eventsForm.common.create") }}</template>
            </DsButton>
          </div>
        </DsCard>
      </div>
    </form>

    <DsModal
      :open="showImageModal && !!(imagePreview || formData.coverUrl)"
      :title="t('pages.dash.eventsForm.form.labels.cover')"
      width="lg"
      :actions="[
        { label: t('pages.dash.eventsForm.common.close'), type: 'default', onClick: () => (showImageModal = false) },
        {
          label: t('pages.dash.eventsForm.common.delete'),
          type: 'danger',
          onClick: () => {
            removeImage();
            showImageModal = false;
          },
        },
      ]"
      @close="showImageModal = false">
      <img :src="imagePreview || formData.coverUrl" :alt="t('pages.other.commons.altText.eventCoverFullscreen')" class="max-h-[70vh] mx-auto object-contain rounded-lg" />
    </DsModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { Search, ImageIcon, Clock, CheckCircle2, XCircle, UploadCloud, ClipboardList } from "lucide-vue-next";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import PageHeader from "@/components/data/PageHeader.vue";
import DsCard from "@/components/core/DsCard.vue";
import InfoRow from "@/components/data/InfoRow.vue";
import TextField from "@/components/forms/TextField.vue";
import SelectMenu from "@/components/forms/SelectMenu.vue";
import DsButton from "@/components/core/DsButton.vue";
import DsModal from "@/components/feedback/DsModal.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const isEditMode = computed(() => !!route.params.id);
const eventId = computed(() => route.params.id);
const initialEventData = ref(null);
const isLoading = ref(isEditMode.value);
const loadError = ref(null);
const categories = ref([]);
const selectedCategory = ref("");
const selectedCategoryInfo = ref(null);

const categoryOptions = computed(() =>
  categories.value.map((category) => ({ value: category._id || category.id, label: category.name, icon: "bookmark" })),
);

const imagePreview = ref(null);
const imageFile = ref(null);
const fileInput = ref(null);
const isDragging = ref(false);
const showErrorMessage = ref(false);
const displayErrorMessage = ref("");
const showImageModal = ref(false);

const openImageModal = () => {
  if (imagePreview.value || formData.coverUrl) {
    showImageModal.value = true;
  }
};

onMounted(() => {
  if (isEditMode.value && route.meta.initialData) {
    initialEventData.value = route.meta.initialData.event;
    categories.value = route.meta.initialData.categories || [];

    if (initialEventData.value) {
      formData.title = initialEventData.value.title || "";
      formData.category = initialEventData.value.category || "";
      formData.info = initialEventData.value.info || "";
      formData.coverUrl = initialEventData.value.coverUrl || "";
      selectedCategory.value = initialEventData.value.category || "";

      if (initialEventData.value.duration) {
        formData.duration = initialEventData.value.duration;
        formData.hours = Math.floor(initialEventData.value.duration / 60);
        formData.minutes = initialEventData.value.duration % 60;
      }

      isLoading.value = false;
    } else if (route.meta.initialData.error) {
      loadError.value = t("pages.dash.eventsForm.errors.loadingEvent");
      isLoading.value = false;
    }
  } else if (route.meta.initialData) {
    categories.value = route.meta.initialData.categories || [];
    isLoading.value = false;
  } else {
    isLoading.value = false;
  }

  if (formData.category && categories.value.length > 0) {
    selectedCategory.value = formData.category;
    updateSelectedCategoryInfo();
  }
});

const updateSelectedCategoryInfo = () => {
  if (selectedCategory.value && categories.value.length > 0) {
    selectedCategoryInfo.value =
      categories.value.find((cat) => cat._id === selectedCategory.value || cat.id === selectedCategory.value) || null;
  } else {
    selectedCategoryInfo.value = null;
  }
};

watch(selectedCategory, (newValue) => {
  formData.category = newValue;
  updateSelectedCategoryInfo();
  touchedFields.category = true;
  validateFormField("category", newValue);
});

watch(
  () => initialEventData.value,
  (newVal) => {
    if (newVal && newVal.createdBy) {
      loadCreatorData(newVal.createdBy);
    }
  },
  { immediate: true },
);

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value || !categories.value.length) return "";
  const category = categories.value.find(
    (cat) => cat._id === selectedCategory.value || cat.id === selectedCategory.value,
  );
  return category ? category.name : "";
});

const pageTitle = computed(() => {
  return isEditMode.value ? t("pages.dash.eventsForm.page.editTitle") : t("pages.dash.eventsForm.page.createTitle");
});

const pageDescription = computed(() => {
  return isEditMode.value
    ? t("pages.dash.eventsForm.page.editDescription")
    : t("pages.dash.eventsForm.page.createDescription");
});

const formData = reactive({
  title: "",
  category: "",
  type: "",
  info: "",
  duration: 30,
  hours: 0,
  minutes: 30,
  coverUrl: "",
});

const errors = reactive({
  title: "",
  category: "",
  type: "",
  info: "",
  duration: "",
  cover: "",
});

const touchedFields = reactive({
  title: false,
  category: false,
  type: false,
  info: false,
  duration: false,
  cover: false,
});

const isSubmitting = ref(false);
const buttonState = ref("default");
const formSubmitted = ref(false);

const checkImageAspectRatio = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;

      const targetRatio = 9 / 16;
      const tolerance = 0.05;

      const isValid = Math.abs(aspectRatio - targetRatio) <= tolerance;

      resolve({
        isValid,
        width,
        height,
        aspectRatio,
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

const onDrop = async (event) => {
  isDragging.value = false;

  const files = event.dataTransfer.files;
  if (files && files.length) {
    const file = files[0];
    await processFile(file);
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  await processFile(file);
};

const showTemporaryError = (message) => {
  showErrorMessage.value = true;
  displayErrorMessage.value = message;

  setTimeout(() => {
    showErrorMessage.value = false;
  }, 6000);
};

const processFile = async (file) => {
  showErrorMessage.value = false;

  if (!file.type.match("image.*")) {
    showTemporaryError(t("pages.dash.eventsForm.errors.invalidFileType"));
    return;
  }
  const aspectRatioCheck = await checkImageAspectRatio(file);
  if (!aspectRatioCheck.isValid) {
    showTemporaryError(t("pages.dash.eventsForm.errors.wrongAspectRatio"));
    return;
  }
  imageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  imagePreview.value = null;
  imageFile.value = null;
  formData.coverUrl = "";
  showErrorMessage.value = false;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return t("pages.dash.eventsForm.form.placeholders.noDuration");
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} ${t("pages.dash.eventsForm.form.labels.hoursShort")} ${mins} ${t("pages.dash.eventsForm.form.labels.minutesShort")}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? t("pages.dash.eventsForm.form.labels.hourSingular") : t("pages.dash.eventsForm.form.labels.hourPlural")}`;
  } else {
    return `${mins} ${mins === 1 ? t("pages.dash.eventsForm.form.labels.minuteSingular") : t("pages.dash.eventsForm.form.labels.minutePlural")}`;
  }
};

const updateDuration = () => {
  let hours = formData.hours || 0;
  let minutes = formData.minutes || 0;
  hours = Math.max(0, Math.min(24, hours));
  minutes = Math.max(0, Math.min(59, minutes));
  formData.hours = hours;
  formData.minutes = minutes;
  formData.duration = hours * 60 + minutes;
  validateFormField("duration", formData.duration);
};

const validateFormField = (field, value) => {
  if (formSubmitted.value) return true;
  switch (field) {
    case "title": {
      const isTitleValid = value && value.length >= 3 && value.length <= 200;
      errors.title = isTitleValid ? "" : t("pages.dash.eventsForm.errors.titleLength");
      return isTitleValid;
    }
    case "category": {
      const isCategoryValid = !!value;
      errors.category = isCategoryValid ? "" : t("pages.dash.eventsForm.errors.categoryRequired");
      return isCategoryValid;
    }
    case "info": {
      const isInfoValid = value && value.length >= 100 && value.length <= 500;
      errors.info = isInfoValid ? "" : t("pages.dash.eventsForm.errors.infoLength", { min: 100, max: 500 });
      return isInfoValid;
    }
    case "duration": {
      const isDurationValid = value && value > 0;
      errors.duration = isDurationValid ? "" : t("pages.dash.eventsForm.errors.durationRequired");
      return isDurationValid;
    }
    default:
      return true;
  }
};

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;
  const mandatoryFieldsValid = !errors.title && !errors.category && !errors.info && !errors.duration;
  const fieldsNotEmpty = formData.title && formData.category && formData.duration > 0;
  const hasImage = imagePreview.value || formData.coverUrl;
  return mandatoryFieldsValid && fieldsNotEmpty && hasImage;
});

watch(
  () => formData.title,
  (newVal) => {
    touchedFields.title = true;
    validateFormField("title", newVal);
  },
);
watch(
  () => formData.category,
  (newVal) => {
    touchedFields.category = true;
    validateFormField("category", newVal);
  },
);
watch(
  () => formData.info,
  (newVal) => {
    touchedFields.info = true;
    validateFormField("info", newVal);
  },
);

const validateForm = () => {
  if (formSubmitted.value) return true;
  let isValid = true;
  errors.title = "";
  errors.category = "";
  errors.info = "";
  errors.duration = "";
  isValid = validateFormField("title", formData.title) && isValid;
  isValid = validateFormField("category", formData.category) && isValid;
  isValid = validateFormField("info", formData.info) && isValid;
  isValid = validateFormField("duration", formData.duration) && isValid;
  if (!imagePreview.value && !formData.coverUrl) {
    showTemporaryError(t("pages.dash.eventsForm.errors.coverRequired"));
    isValid = false;
  }
  return isValid;
};

const handleSubmit = async () => {
  const formValid = validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    const formDataUpload = new FormData();

    formDataUpload.append("title", formData.title);
    formDataUpload.append("info", formData.info);
    formDataUpload.append("category", formData.category);
    formDataUpload.append("duration", formData.duration.toString());
    formDataUpload.append("createdBy", authStore.userId);

    if (imageFile.value) {
      formDataUpload.append("image", imageFile.value);
    }

    let response;
    if (isEditMode.value) {
      response = await axios.put(`/api/events?id=${eventId.value}`, formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      response = await axios.post("/api/events", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    if ((isEditMode.value && response.status === 200) || (!isEditMode.value && response.status === 201)) {
      formSubmitted.value = true;
      buttonState.value = "success";
      toast.success(
        isEditMode.value
          ? t("pages.dash.eventsForm.notifications.updateSuccess")
          : t("pages.dash.eventsForm.notifications.createSuccess"),
      );
      setTimeout(() => router.push({ name: "dashEvents" }), 2000);
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    buttonState.value = "error";
    if (error.response) {
      toast.error(error.response.data?.message || t("pages.dash.eventsForm.errors.unknown"));
    } else if (error.request) {
      toast.error(t("pages.dash.eventsForm.errors.noResponse"));
    } else {
      toast.error(t("pages.dash.eventsForm.errors.requestSetup"));
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
  if (isLoadingCreator.value) return t("pages.dash.eventsForm.profile.loading");
  if (creatorError.value) return t("pages.dash.eventsForm.profile.errorLoading");
  if (creatorData.value) return creatorData.value.name;
  return initialEventData.value?.createdBy ?? "";
});
</script>
<style scoped>
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
