<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="pageTitle" :description="pageDescription" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.categoriesForm.profile.preview')" class="h-full">
          <div class="bg-background-50 p-5 rounded-lg border border-background-200">
            <div class="flex items-center mb-5">
              <div class="relative mr-5">
                <div
                  class="w-20 h-20 rounded-full bg-background-200 flex items-center justify-center overflow-hidden border-2 border-background-300 shadow-md">
                  <Bookmark v-if="!formData.name" class="w-9 h-9 text-primary-600" />
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
                  {{ formData.name || t("pages.dash.categoriesForm.form.placeholders.name") }}
                </h3>
              </div>
            </div>

            <div class="space-y-4">
              <InfoRow
                icon="map-pin"
                align="start"
                :label="t('pages.dash.categoriesForm.form.labels.spaces')"
                :value="formData.spaces?.length > 0 ? selectedSpacesInfo.map((space) => space.name).join(', ') : t('pages.dash.categoriesForm.form.placeholders.noSpaces')" />
              <InfoRow
                v-if="isEditMode && initialCategoryData"
                icon="mail"
                :label="t('pages.dash.categoriesForm.profile.createdBy')"
                :value="createdByLabel" />
            </div>
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="isEditMode ? t('pages.dash.categoriesForm.common.edit') : t('pages.dash.categoriesForm.common.create')" class="h-full">
          <div class="bg-background-50 p-4 rounded-lg border border-background-200 space-y-4">
            <h4 class="text-sm font-medium text-text-700 mb-1 flex items-center">
              <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
              {{ t("pages.dash.categoriesForm.form.sections.basicInfo") }}
            </h4>

            <TextField
              v-model="formData.name"
              :label="t('pages.dash.categoriesForm.form.labels.name')"
              icon="bookmark"
              :error="!formSubmitted ? errors.name : null"
              :valid="(!errors.name || formSubmitted) && !!formData.name && formData.name.length >= 3"
              :placeholder="t('pages.dash.categoriesForm.form.placeholders.name')"
              required />

            <div>
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.categoriesForm.form.labels.spaces") }}</span>
              <Listbox v-model="selectedSpaces" multiple @update:modelValue="updateSelectedSpacesInfo">
                <div class="relative">
                  <ListboxButton
                    class="relative w-full pl-10 pr-10 h-10 border-[1.5px] border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150 bg-background-50 text-left">
                    <MapPin class="absolute inset-y-0 left-3 w-4 h-4 my-auto text-text-500" />
                    <span class="block truncate text-sm" :class="!selectedSpaces.length ? 'text-text-500' : 'text-text-900'">
                      {{
                        selectedSpaces.length > 0
                          ? selectedSpacesInfo.map((space) => space.name).join(", ")
                          : t("pages.dash.categoriesForm.form.placeholders.spaces")
                      }}
                    </span>
                    <ChevronDown class="absolute inset-y-0 right-3 w-4 h-4 my-auto text-text-500" />
                  </ListboxButton>
                  <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95">
                    <ListboxOptions
                      class="absolute z-10 mt-1 w-full bg-background-100 border-[1.5px] border-background-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none py-1">
                      <ListboxOption v-for="space in availableSpaces" :key="space.id" :value="space.id" v-slot="{ active, selected }">
                        <li
                          class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-l-[3px] border-transparent"
                          :class="
                            selected
                              ? 'bg-primary-100 border-l-primary-500 font-medium text-primary-700'
                              : active
                                ? 'border-l-primary-300 text-primary-600 bg-primary-50'
                                : 'text-text-800'
                          ">
                          <MapPin class="w-4 h-4" />
                          <span class="flex-1">{{ space.name }}</span>
                          <Check v-if="selected" class="w-4 h-4" />
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </transition>
                </div>
              </Listbox>
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="x" @click="$router.push({ name: 'dashCategories' })">
              {{ t("pages.dash.categoriesForm.common.cancel") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid">
              <template v-if="buttonState === 'processing'">
                {{ isEditMode ? t("pages.dash.categoriesForm.form.actions.updating") : t("pages.dash.categoriesForm.form.actions.submitting") }}
              </template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.categoriesForm.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.categoriesForm.common.status.error") }}</template>
              <template v-else>{{ isEditMode ? t("pages.dash.categoriesForm.common.update") : t("pages.dash.categoriesForm.common.create") }}</template>
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
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { Bookmark, ClipboardList, MapPin, Check, ChevronDown } from "lucide-vue-next";
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
const categoryId = computed(() => route.params.id);
const initialCategoryData = ref(null);
const isLoading = ref(isEditMode.value);
const loadError = ref(null);

onMounted(() => {
  if (route.meta.initialData) {
    if (isEditMode.value) {
      initialCategoryData.value = route.meta.initialData.category;

      if (initialCategoryData.value) {
        formData.name = initialCategoryData.value.name || "";
        formData.spaces = initialCategoryData.value.spaces || [];
      }
    }

    if (route.meta.initialData.spaces) {
      availableSpaces.value = route.meta.initialData.spaces;
      updateSelectedSpacesInfo();
    }

    if (route.meta.initialData.error) {
      loadError.value = t("pages.dash.categoriesForm.errors.loadingCategory");
    }
  }
  isLoading.value = false;
});

watch(
  () => initialCategoryData.value,
  (newVal) => {
    if (newVal && newVal.createdBy) {
      loadCreatorData(newVal.createdBy);
    }
  },
  { immediate: true },
);

const pageTitle = computed(() => {
  return isEditMode.value
    ? t("pages.dash.categoriesForm.page.editTitle")
    : t("pages.dash.categoriesForm.page.createTitle");
});

const pageDescription = computed(() => {
  return isEditMode.value
    ? t("pages.dash.categoriesForm.page.editDescription")
    : t("pages.dash.categoriesForm.page.createDescription");
});

const formData = reactive({
  name: "",
  spaces: [],
});

const errors = reactive({
  name: "",
});

const touchedFields = reactive({
  name: false,
});

const availableSpaces = ref([]);
const selectedSpaces = ref([]);
const selectedSpacesInfo = ref([]);
const selectedSpace = ref("");

onMounted(() => {
  if (route.meta.initialData?.spaces) {
    availableSpaces.value = route.meta.initialData.spaces;
    if (formData.spaces?.length > 0) {
      selectedSpaces.value = formData.spaces;
      updateSelectedSpacesInfo();
    }
  }
});

const updateSelectedSpacesInfo = () => {
  selectedSpacesInfo.value = availableSpaces.value.filter((space) => selectedSpaces.value.includes(space.id));
};

watch(selectedSpaces, (newValue) => {
  formData.spaces = newValue;
  updateSelectedSpacesInfo();
});

watch(selectedSpace, (newValue) => {
  if (newValue) {
    selectedSpaces.value = [...selectedSpaces.value, newValue];
    selectedSpace.value = "";
  }
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
      errors.name = isNameValid ? "" : t("pages.dash.categoriesForm.errors.nameLength");
      return isNameValid;
    }
    default:
      return true;
  }
};

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;

  const mandatoryFieldsValid = !errors.name;
  const fieldsNotEmpty = formData.name;

  return mandatoryFieldsValid && fieldsNotEmpty;
});

watch(
  () => formData.name,
  (newVal) => {
    touchedFields.name = true;
    validateFormField("name", newVal);
  },
);

const validateForm = () => {
  if (formSubmitted.value) return true;
  errors.name = "";
  return validateFormField("name", formData.name);
};

const handleSubmit = async () => {
  const formValid = validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    if (isEditMode.value) {
      const categoryUpdate = { ...formData };

      const response = await axios.put(`/api/categories?id=${categoryId.value}`, categoryUpdate);

      if (response.status === 200) {
        formSubmitted.value = true;
        errors.name = "";
        buttonState.value = "success";
        toast.success(t("pages.dash.categoriesForm.notifications.updateSuccess"));
        setTimeout(() => router.push({ name: "dashCategories" }), 2000);
      }
    } else {
      const categoryData = {
        ...formData,
        createdBy: authStore.userId,
      };

      const response = await axios.post("/api/categories", categoryData);

      if (response.status === 201) {
        formSubmitted.value = true;
        errors.name = "";
        buttonState.value = "success";
        toast.success(t("pages.dash.categoriesForm.notifications.createSuccess"));
        setTimeout(() => router.push({ name: "dashCategories" }), 2000);
      }
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    buttonState.value = "error";

    if (error.response) {
      toast.error(error.response.data?.message || t("pages.dash.categoriesForm.errors.unknown"));
    } else if (error.request) {
      toast.error(t("pages.dash.categoriesForm.errors.noResponse"));
    } else {
      toast.error(t("pages.dash.categoriesForm.errors.requestSetup"));
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
  if (isLoadingCreator.value) return t("pages.dash.categoriesForm.profile.loading");
  if (creatorError.value) return t("pages.dash.categoriesForm.profile.errorLoading");
  if (creatorData.value) return creatorData.value.name;
  return initialCategoryData.value?.createdBy ?? "";
});
</script>
