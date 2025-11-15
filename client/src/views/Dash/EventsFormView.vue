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
              {{ t("pages.dash.eventsForm.profile.preview") }}
            </h3>

            <div class="bg-background-50 p-5 rounded-lg border border-background-200">
              <div class="space-y-4">
                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Calendar class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.eventsForm.form.labels.title") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ formData.title || t("pages.dash.eventsForm.form.placeholders.title") }}
                    </p>
                  </div>
                </div>

                <div class="flex justify-center">
                  <div
                    class="relative rounded-lg overflow-hidden border border-background-300 shadow-sm cursor-pointer group"
                    style="width: 15%; aspect-ratio: 9/16"
                    @click="openImageModal">
                    <div v-if="imagePreview || formData.coverUrl" class="w-full h-full">
                      <img
                        :src="imagePreview || formData.coverUrl"
                        alt="Event cover"
                        class="w-full h-full object-cover" />
                      <div
                        class="absolute inset-0 bg-background-950/10 group-hover:bg-background-950/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div class="bg-background-50/90 p-2 rounded-full">
                          <Search class="w-5 h-5 text-text-900" />
                        </div>
                      </div>
                    </div>
                    <div v-else class="w-full h-full bg-background-200 flex flex-col items-center justify-center">
                      <ImageIcon class="w-12 h-12 text-primary-600 mb-2" />
                      <p class="text-text-600 text-sm">
                        {{ t("pages.dash.eventsForm.form.placeholders.noCover") }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <MapPin class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.eventsForm.form.labels.category") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ selectedCategoryName || t("pages.dash.eventsForm.form.placeholders.noCategory") }}
                    </p>
                  </div>
                </div>

                <template v-if="isEditMode && initialEventData">
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <User class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.eventsForm.profile.createdBy") }}</p>
                      <p class="text-text-800 font-medium">
                        <span v-if="isLoadingCreator">{{ t("pages.dash.eventsForm.profile.loading") }}</span>
                        <span v-else-if="creatorError">{{ t("pages.dash.eventsForm.profile.errorLoading") }}</span>
                        <span v-else-if="creatorData">{{ creatorData.name }}</span>
                        <span v-else>{{ initialEventData.createdBy }}</span>
                      </p>
                    </div>
                  </div>
                </template>

                <div
                  v-if="formData.info"
                  class="flex items-start p-3 bg-background-100 rounded-lg border border-background-200">
                  <FileText class="w-5 h-5 text-primary-600 mr-3 mt-0.5 shrink-0" />
                  <div class="w-full">
                    <p class="text-xs text-text-600">{{ t("pages.dash.eventsForm.form.labels.info") }}</p>
                    <p class="text-text-800 mt-1 whitespace-pre-wrap wrap-break-word">
                      {{ formData.info }}
                    </p>
                  </div>
                </div>
                <div v-else class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <FileText class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.eventsForm.form.labels.info") }}</p>
                    <p class="text-text-600 text-sm">
                      {{ t("pages.dash.eventsForm.form.placeholders.noInfo") }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Clock class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.eventsForm.form.labels.duration") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ formatDuration(formData.duration) }}
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
              {{ isEditMode ? t("pages.dash.eventsForm.common.edit") : t("pages.dash.eventsForm.common.create") }}
            </h3>

            <div class="space-y-6">
              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.eventsForm.form.sections.basicInfo") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="title">
                    {{ t("pages.dash.eventsForm.form.labels.title") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.title"
                      id="title"
                      type="text"
                      class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{
                        'border-accent-500 ring-1 ring-accent-300': errors.title && !formSubmitted,
                      }"
                      :placeholder="t('pages.dash.eventsForm.form.placeholders.title') || 'Nombre del evento'"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2
                        v-if="(!errors.title || formSubmitted) && formData.title && formData.title.length >= 3"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="(formData.title || touchedFields.title) && !formSubmitted"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="category">
                    {{ t("pages.dash.eventsForm.form.labels.category") }}
                  </label>
                  <div class="relative">
                    <Listbox v-model="selectedCategory">
                      <div class="relative">
                        <ListboxButton
                          class="relative w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 bg-background-50 text-left"
                          :class="{
                            'border-accent-500 ring-1 ring-accent-300': errors.category && !formSubmitted,
                          }">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Bookmark class="w-5 h-5 text-primary-600" />
                          </div>
                          <span
                            class="block truncate"
                            :class="!selectedCategory ? 'text-text-400' : 'text-text-950 font-medium'">
                            {{ selectedCategoryName || t("pages.dash.eventsForm.form.placeholders.selectCategory") }}
                          </span>
                          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div class="flex items-center">
                              <XCircle
                                v-if="errors.category && !formSubmitted"
                                class="w-5 h-5 text-accent-500 mr-2 animate-fadeIn" />
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
                              v-for="category in categories"
                              :key="category._id || category.id"
                              :value="category._id || category.id"
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
                                  <Bookmark class="mr-2 h-5 w-5 text-primary-600" />
                                  <span :class="[selected ? 'font-medium' : 'font-normal']">
                                    {{ category.name }}
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

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="duration">
                    {{ t("pages.dash.eventsForm.form.labels.duration") }}
                  </label>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock
                          class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                      </div>
                      <input
                        v-model.number="formData.hours"
                        id="hours"
                        type="number"
                        min="0"
                        max="24"
                        step="1"
                        class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium no-spinner"
                        :placeholder="t('pages.dash.eventsForm.form.placeholders.hours')"
                        @input="updateDuration" />
                      <div class="absolute inset-y-0 right-3 flex items-center">
                        <span class="text-sm text-text-600">{{ t("pages.dash.eventsForm.form.labels.hours") }}</span>
                      </div>
                    </div>

                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock
                          class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                      </div>
                      <input
                        v-model.number="formData.minutes"
                        id="minutes"
                        type="number"
                        min="0"
                        max="59"
                        step="5"
                        class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium no-spinner"
                        :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.duration && !formSubmitted }"
                        :placeholder="t('pages.dash.eventsForm.form.placeholders.minutes')"
                        @input="updateDuration" />
                      <div class="absolute inset-y-0 right-3 flex items-center">
                        <span class="text-sm text-text-600">{{ t("pages.dash.eventsForm.form.labels.minutes") }}</span>
                      </div>
                    </div>
                  </div>
                  <p v-if="errors.duration && !formSubmitted" class="mt-1 text-sm text-accent-500">
                    {{ errors.duration }}
                  </p>
                </div>
                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="info">
                    {{ t("pages.dash.eventsForm.form.labels.info") }}
                  </label>
                  <div class="relative group">
                    <textarea
                      v-model="formData.info"
                      id="info"
                      rows="5"
                      maxlength="500"
                      class="block w-full p-3 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950"
                      :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.info && !formSubmitted }"
                      :placeholder="
                        t('pages.dash.eventsForm.form.placeholders.info') || 'Información del evento'
                      "></textarea>
                    <div class="absolute bottom-3 right-3 flex items-center">
                      <span class="text-xs text-text-500 mr-2">{{ formData.info.length }}/500</span>
                      <CheckCircle2
                        v-if="(!errors.info || formSubmitted) && formData.info && formData.info.length >= 3"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="(formData.info || touchedFields.info) && !formSubmitted && errors.info"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="cover">
                    {{ t("pages.dash.eventsForm.form.labels.cover") }}
                  </label>
                  <div class="relative group">
                    <input
                      ref="fileInput"
                      type="file"
                      id="cover"
                      accept="image/*"
                      class="hidden"
                      @change="handleFileUpload" />

                    <div
                      class="w-full"
                      @dragover.prevent="isDragging = true"
                      @dragleave.prevent="isDragging = false"
                      @drop.prevent="onDrop">
                      <div
                        :class="[
                          'border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer w-full',
                          isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-background-300 hover:border-primary-300',
                          showErrorMessage ? 'border-accent-500 bg-accent-50' : '',
                        ]"
                        @click="$refs.fileInput.click()">
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
                        <p class="text-text-500 text-xs" v-if="!showErrorMessage">
                          {{ t("pages.dash.eventsForm.form.placeholders.coverFormat") }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end items-center mt-6 gap-2">
              <button
                type="button"
                class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-background-100 text-text-700 border border-background-300 hover:bg-background-200 transition-colors duration-150 cursor-pointer"
                @click="$router.push({ name: 'dashEvents' })">
                <X class="w-4 h-4 mr-2" />
                {{ t("pages.dash.eventsForm.common.cancel") }}
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
                      ? t("pages.dash.eventsForm.form.actions.updating")
                      : t("pages.dash.eventsForm.form.actions.submitting")
                  }}
                </div>
                <div v-else-if="buttonState === 'success'" class="flex items-center">
                  <CheckCircle2 class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.eventsForm.common.status.success") }}
                </div>
                <div v-else-if="buttonState === 'error'" class="flex items-center">
                  <XCircle class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.eventsForm.common.status.error") }}
                </div>
                <div v-else class="flex items-center">
                  <Save class="w-4 h-4 mr-2" />
                  {{ isEditMode ? t("pages.dash.eventsForm.common.update") : t("pages.dash.eventsForm.common.create") }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="showImageModal && (imagePreview || formData.coverUrl)" class="fixed inset-0 z-50">
          <div
            class="fixed inset-0 bg-background-950/85 dark:bg-background-50/85 transition-opacity duration-300"></div>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <div class="relative w-full max-w-3xl mx-auto">
                <div class="relative bg-background-50 dark:bg-background-100 rounded-lg shadow-xl p-2">
                  <div
                    class="flex justify-between items-center p-4 border-b border-background-200 dark:border-background-300">
                    <h3 class="text-lg font-semibold text-text-900 dark:text-text-800">
                      {{ t("pages.dash.eventsForm.form.labels.cover") }}
                    </h3>
                    <button
                      @click="showImageModal = false"
                      class="rounded-md p-2 text-text-700 dark:text-text-700 hover:bg-background-100 dark:hover:bg-background-200 hover:text-text-900 dark:hover:text-text-900 transition-colors">
                      <X class="w-5 h-5" />
                    </button>
                  </div>

                  <div class="p-4">
                    <img
                      :src="imagePreview || formData.coverUrl"
                      alt="Event cover fullscreen"
                      class="max-h-[70vh] mx-auto object-contain rounded-lg" />
                  </div>

                  <div class="bg-background-100 dark:bg-background-200 px-6 py-4 flex justify-end gap-2 rounded-b-lg">
                    <button
                      @click="showImageModal = false"
                      class="inline-flex justify-center rounded-md bg-background-50 dark:bg-background-100 px-3 py-2 text-sm font-semibold text-text-800 dark:text-text-700 shadow-sm ring-1 ring-inset ring-background-300 dark:ring-background-400 hover:bg-background-100 dark:hover:bg-background-200 transition-colors">
                      {{ t("pages.dash.eventsForm.common.close") }}
                    </button>
                    <button
                      @click="
                        removeImage();
                        showImageModal = false;
                      "
                      class="inline-flex justify-center rounded-md bg-accent-600 dark:bg-accent-500 text-text-50 hover:bg-accent-700 dark:hover:bg-accent-600 px-3 py-2 text-sm font-semibold shadow-sm transition-colors">
                      {{ t("pages.dash.eventsForm.common.delete") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import {
  Calendar,
  MapPin,
  Mail,
  Loader2,
  ClipboardList,
  CheckCircle2,
  X,
  Save,
  XCircle,
  FileText,
  Clock,
  UploadCloud,
  ImageIcon,
  ChevronDown,
  Check,
  Search,
  Bookmark,
  User,
} from "lucide-vue-next";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";

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
    case "title":
      const isTitleValid = value && value.length >= 3 && value.length <= 200;
      errors.title = isTitleValid ? "" : t("pages.dash.eventsForm.errors.titleLength");
      return isTitleValid;
    case "category":
      const isCategoryValid = !!value;
      errors.category = isCategoryValid ? "" : t("pages.dash.eventsForm.errors.categoryRequired");
      return isCategoryValid;
    case "info":
      const isInfoValid = value && value.length >= 100 && value.length <= 500;
      errors.info = isInfoValid ? "" : t("pages.dash.eventsForm.errors.infoLength", { min: 100, max: 500 });
      return isInfoValid;
    case "duration":
      const isDurationValid = value && value > 0;
      errors.duration = isDurationValid ? "" : t("pages.dash.eventsForm.errors.durationRequired");
      return isDurationValid;
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
</script>
<style scoped>
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
