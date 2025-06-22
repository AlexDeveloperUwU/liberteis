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
              {{ t("pages.dash.categoriesForm.profile.preview") }}
            </h3>

            <div class="bg-background-50 p-5 rounded-lg border border-background-200">
              <div class="flex items-center mb-5">
                <div class="relative mr-5">
                  <div
                    class="w-20 h-20 rounded-full bg-background-200 flex items-center justify-center overflow-hidden border-2 border-background-300 shadow-md">
                    <Bookmark class="w-9 h-9 text-primary-600" v-if="!formData.name" />
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
                    {{ formData.name || t("pages.dash.categoriesForm.form.placeholders.name") }}
                  </h3>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <LayoutGrid class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.categoriesForm.form.labels.spaces") }}</p>
                    <p v-if="formData.spaces?.length > 0" class="text-text-800 mt-1">
                      {{ selectedSpacesInfo.map((space) => space.name).join(", ") }}
                    </p>
                    <p v-else class="text-text-600">
                      {{ t("pages.dash.categoriesForm.form.placeholders.noSpaces") }}
                    </p>
                  </div>
                </div>
                <template v-if="isEditMode && initialCategoryData">
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <Mail class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.categoriesForm.profile.createdBy") }}</p>
                      <p class="text-text-800 font-medium">
                        <span v-if="isLoadingCreator">{{ t("pages.dash.categoriesForm.profile.loading") }}</span>
                        <span v-else-if="creatorError">{{ t("pages.dash.categoriesForm.profile.errorLoading") }}</span>
                        <span v-else-if="creatorData">{{ creatorData.name }}</span>
                        <span v-else>{{ initialCategoryData.createdBy }}</span>
                      </p>
                    </div>
                  </div>
                </template>


              </div>
            </div>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <div
            class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] h-full">
            <h3 class="text-lg font-medium text-text-900 mb-4">
              {{
                isEditMode ? t("pages.dash.categoriesForm.common.edit") : t("pages.dash.categoriesForm.common.create")
              }}
            </h3>

            <div class="space-y-6">
              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.categoriesForm.form.sections.basicInfo") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="name">
                    {{ t("pages.dash.categoriesForm.form.labels.name") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Bookmark
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
                      :placeholder="t('pages.dash.categoriesForm.form.placeholders.name') || 'Nombre de la categoría'"
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
                  <label class="block text-text-700 text-sm font-medium mb-2" for="spaces">
                    {{ t("pages.dash.categoriesForm.form.labels.spaces") }}
                  </label>
                  <div class="relative">
                    <Listbox v-model="selectedSpaces" multiple @update:modelValue="updateSelectedSpacesInfo">
                      <div class="relative">
                        <ListboxButton
                          class="relative w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 bg-background-50 text-left">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LayoutGrid class="w-5 h-5 text-primary-600" />
                          </div>
                          <span
                            class="block truncate"
                            :class="!selectedSpaces.length ? 'text-text-400' : 'text-text-950 font-medium'">
                            {{
                              selectedSpaces.length > 0
                                ? selectedSpacesInfo.map((space) => space.name).join(", ")
                                : t("pages.dash.categoriesForm.form.placeholders.spaces")
                            }}
                          </span>
                          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown class="w-5 h-5 text-text-400" />
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
                              v-for="space in availableSpaces"
                              :key="space.id"
                              :value="space.id"
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
                                  <LayoutGrid class="mr-2 h-5 w-5 text-primary-600" />
                                  <span :class="[selected ? 'font-medium' : 'font-normal']">
                                    {{ space.name }}
                                  </span>
                                </div>
                                <span
                                  v-if="selected"
                                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                                  <Check class="w-4 h-4" />
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
                @click="$router.push({ name: 'dashCategories' })">
                <X class="w-4 h-4 mr-2" />
                {{ t("pages.dash.categoriesForm.common.cancel") }}
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
                      ? t("pages.dash.categoriesForm.form.actions.updating")
                      : t("pages.dash.categoriesForm.form.actions.submitting")
                  }}
                </div>
                <div v-else-if="buttonState === 'success'" class="flex items-center">
                  <CheckCircle2 class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.categoriesForm.common.status.success") }}
                </div>
                <div v-else-if="buttonState === 'error'" class="flex items-center">
                  <XCircle class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.categoriesForm.common.status.error") }}
                </div>
                <div v-else class="flex items-center">
                  <Save class="w-4 h-4 mr-2" />
                  {{
                    isEditMode
                      ? t("pages.dash.categoriesForm.common.update")
                      : t("pages.dash.categoriesForm.common.create")
                  }}
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
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/vue";
import {
  Bookmark,
  Mail,
  Loader2,
  ClipboardList,
  CheckCircle2,
  X,
  Save,
  XCircle,
  LayoutGrid,
  Check,
  ChevronDown,
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
    case "name":
      const isNameValid = value && value.length >= 3 && value.length <= 100;
      errors.name = isNameValid ? "" : t("pages.dash.categoriesForm.errors.nameLength");
      return isNameValid;
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
