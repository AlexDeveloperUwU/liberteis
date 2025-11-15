<template>
  <div class="h-full w-full p-6">
    <div class="flex items-center mb-2">
      <h1 class="text-3xl font-bold text-text-950 k2d">
        {{ pageTitle }}
      </h1>
    </div>

    <div class="relative">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="order-2 lg:order-1">
          <div
            class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] h-full">
            <h3 class="text-lg font-medium text-text-900 mb-4">
              {{ t("pages.dash.bookingForm.profile.preview") }}
            </h3>

            <div class="bg-background-50 p-5 rounded-lg border border-background-200">
              <div class="space-y-4">
                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Calendar class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.eventTitle") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ selectedEventName || t("pages.dash.bookingForm.form.placeholders.noEvent") }}
                    </p>
                  </div>
                </div>

                <div class="flex justify-center">
                  <div
                    class="relative rounded-lg overflow-hidden border border-background-300 shadow-sm cursor-pointer group"
                    style="width: 15%; aspect-ratio: 9/16"
                    @click="openImageModal">
                    <div v-if="selectedEventInfo && selectedEventInfo.coverUrl" class="w-full h-full">
                      <img :src="selectedEventInfo.coverUrl" alt="Event cover" class="w-full h-full object-cover" />
                      <div
                        class="absolute inset-0 bg-background-950/10 group-hover:bg-background-950/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div class="bg-background-50/90 p-2 rounded-full">
                          <Search class="w-5 h-5 text-text-900" />
                        </div>
                      </div>
                    </div>
                    <div v-else class="w-full h-full bg-background-200 flex flex-col items-center justify-center">
                      <ImageIcon class="w-12 h-12 text-primary-600 mb-2" />
                    </div>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <MapPin class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.space") }}</p>
                    <p class="text-text-800 font-medium">
                      {{ selectedSpaceName || t("pages.dash.bookingForm.form.placeholders.noSpace") }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <Clock class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.bookingDate") }}</p>
                    <p class="text-text-800 font-medium">
                      {{
                        formatBookingDate(formData.bookingDate) || t("pages.dash.bookingForm.form.placeholders.noDate")
                      }}
                    </p>
                  </div>
                </div>

                <template v-if="selectedEventInfo">
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <Bookmark class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.eventCategory") }}</p>
                      <p class="text-text-800 font-medium">
                        {{ selectedEventCategoryName || "Sin categoría" }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200"
                    v-if="selectedEventInfo.duration">
                    <Timer class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.eventDuration") }}</p>
                      <p class="text-text-800 font-medium">
                        {{ formatDuration(selectedEventInfo.duration) }}
                      </p>
                    </div>
                  </div>
                </template>

                <template v-if="isEditMode && initialBookingData">
                  <div class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                    <User class="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.profile.bookedBy") }}</p>
                      <p class="text-text-800 font-medium">
                        <span v-if="isLoadingBooker">{{ t("pages.dash.bookingForm.profile.loading") }}</span>
                        <span v-else-if="bookerError">{{ t("pages.dash.bookingForm.profile.errorLoading") }}</span>
                        <span v-else-if="bookerData">{{ bookerData.name }}</span>
                        <span v-else>{{ initialBookingData.bookedBy }}</span>
                      </p>
                    </div>
                  </div>
                </template>

                <div
                  v-if="formData.info"
                  class="flex items-start p-3 bg-background-100 rounded-lg border border-background-200">
                  <FileText class="w-5 h-5 text-primary-600 mr-3 mt-0.5 shrink-0" />
                  <div class="w-full">
                    <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.info") }}</p>
                    <p class="text-text-800 mt-1 whitespace-pre-wrap wrap-break-word">
                      {{ formData.info }}
                    </p>
                  </div>
                </div>
                <div v-else class="flex items-center p-3 bg-background-100 rounded-lg border border-background-200">
                  <FileText class="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p class="text-xs text-text-600">{{ t("pages.dash.bookingForm.form.labels.info") }}</p>
                    <p class="text-text-600 text-sm">
                      {{ t("pages.dash.bookingForm.form.placeholders.noInfo") }}
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
              {{ isEditMode ? t("pages.dash.bookingForm.common.edit") : t("pages.dash.bookingForm.common.create") }}
            </h3>

            <div class="space-y-6">
              <div class="bg-background-50 p-4 rounded-lg border border-background-200">
                <h4 class="text-sm font-medium text-text-700 mb-3 flex items-center">
                  <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.bookingForm.form.sections.basicInfo") }}
                </h4>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="event">
                    {{ t("pages.dash.bookingForm.form.labels.event") }}
                  </label>
                  <div class="relative">
                    <Listbox v-model="selectedEvent" :disabled="isEditMode">
                      <div class="relative">
                        <ListboxButton
                          class="relative w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 bg-background-50 text-left"
                          :class="{
                            'border-accent-500 ring-1 ring-accent-300': errors.event && !formSubmitted,
                            'opacity-60 cursor-not-allowed': isEditMode,
                          }">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar class="w-5 h-5 text-primary-600" />
                          </div>
                          <span
                            class="block truncate"
                            :class="!selectedEvent ? 'text-text-400' : 'text-text-950 font-medium'">
                            {{ selectedEventName || t("pages.dash.bookingForm.form.placeholders.selectEvent") }}
                          </span>
                          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div class="flex items-center">
                              <XCircle
                                v-if="errors.event && !formSubmitted"
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
                              v-for="event in events"
                              :key="event._id || event.id"
                              :value="event._id || event.id"
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
                                  <Calendar class="mr-2 h-5 w-5 text-primary-600" />
                                  <span :class="[selected ? 'font-medium' : 'font-normal']">
                                    {{ event.title }}
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
                    <button
                      type="button"
                      class="mt-2 w-full h-9 px-4 rounded-md text-sm font-medium shadow-sm flex items-center justify-center bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors duration-150"
                      @click="$router.push({ name: 'dashEventsNew' })">
                      <Calendar class="w-4 h-4 mr-2" />
                      {{
                        t("pages.dash.bookingForm.form.actions.createEvent") ||
                        "¿No encuentras tu evento? Crea uno nuevo"
                      }}
                    </button>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="space">
                    {{ t("pages.dash.bookingForm.form.labels.space") }}
                  </label>
                  <div class="relative">
                    <Listbox v-model="selectedSpace" :disabled="!selectedEvent && !isEditMode">
                      <div class="relative">
                        <ListboxButton
                          class="relative w-full pl-10 pr-10 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 bg-background-50 text-left"
                          :class="{
                            'border-accent-500 ring-1 ring-accent-300': errors.space && !formSubmitted,
                            'opacity-60 cursor-not-allowed': !selectedEvent && !isEditMode,
                          }">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin class="w-5 h-5 text-primary-600" />
                          </div>
                          <span
                            class="block truncate"
                            :class="!selectedSpace ? 'text-text-400' : 'text-text-950 font-medium'">
                            {{
                              !selectedEvent && !isEditMode
                                ? t("pages.dash.bookingForm.form.placeholders.selectSpaceFirst")
                                : selectedSpaceName || t("pages.dash.bookingForm.form.placeholders.selectSpace")
                            }}
                          </span>
                          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div class="flex items-center">
                              <XCircle
                                v-if="errors.space && !formSubmitted"
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
                              v-for="space in availableSpaces"
                              :key="space._id || space.id"
                              :value="space._id || space.id"
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
                                  <MapPin class="mr-2 h-5 w-5 text-primary-600" />
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

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="bookingDate">
                    {{ t("pages.dash.bookingForm.form.labels.bookingDate") }}
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock
                        class="w-5 h-5 text-primary-600 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                    <input
                      v-model="formData.bookingDate"
                      id="bookingDate"
                      type="datetime-local"
                      class="block w-full pl-10 pr-3 py-2 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950 font-medium"
                      :class="{
                        'border-accent-500 ring-1 ring-accent-300': errors.bookingDate && !formSubmitted,
                      }"
                      required />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle2
                        v-if="(!errors.bookingDate || formSubmitted) && formData.bookingDate"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="(formData.bookingDate || touchedFields.bookingDate) && !formSubmitted"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-text-700 text-sm font-medium mb-2" for="info">
                    {{ t("pages.dash.bookingForm.form.labels.info") }}
                  </label>
                  <div class="relative group">
                    <textarea
                      v-model="formData.info"
                      id="info"
                      rows="4"
                      maxlength="500"
                      class="block w-full p-3 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-all duration-200 text-text-950"
                      :class="{ 'border-accent-500 ring-1 ring-accent-300': errors.info && !formSubmitted }"
                      :placeholder="t('pages.dash.bookingForm.form.placeholders.info')"></textarea>
                    <div class="absolute bottom-3 right-3 flex items-center">
                      <span class="text-xs text-text-500 mr-2">{{ formData.info?.length || 0 }}/500</span>
                      <CheckCircle2
                        v-if="!errors.info || formSubmitted"
                        class="w-5 h-5 text-primary-500 animate-fadeIn" />
                      <XCircle
                        v-else-if="errors.info && !formSubmitted"
                        class="w-5 h-5 text-accent-500 animate-fadeIn" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end items-center mt-6 gap-2">
              <button
                type="button"
                class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-background-100 text-text-700 border border-background-300 hover:bg-background-200 transition-colors duration-150 cursor-pointer"
                @click="$router.push({ name: returnRoute })">
                <X class="w-4 h-4 mr-2" />
                {{ t("pages.dash.bookingForm.common.cancel") }}
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
                      ? t("pages.dash.bookingForm.form.actions.updating")
                      : t("pages.dash.bookingForm.form.actions.submitting")
                  }}
                </div>
                <div v-else-if="buttonState === 'success'" class="flex items-center">
                  <CheckCircle2 class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.bookingForm.common.status.success") }}
                </div>
                <div v-else-if="buttonState === 'error'" class="flex items-center">
                  <XCircle class="w-4 h-4 mr-2 animate-fadeIn" />
                  {{ t("pages.dash.bookingForm.common.status.error") }}
                </div>
                <div v-else class="flex items-center">
                  <Save class="w-4 h-4 mr-2" />
                  {{
                    isEditMode ? t("pages.dash.bookingForm.common.update") : t("pages.dash.bookingForm.common.create")
                  }}
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
        <div v-if="showImageModal && selectedEventInfo && selectedEventInfo.coverUrl" class="fixed inset-0 z-50">
          <div
            class="fixed inset-0 bg-background-950/85 dark:bg-background-50/85 transition-opacity duration-300"></div>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <div class="relative w-full max-w-3xl mx-auto">
                <div class="relative bg-background-50 dark:bg-background-100 rounded-lg shadow-xl p-2">
                  <div
                    class="flex justify-between items-center p-4 border-b border-background-200 dark:border-background-300">
                    <h3 class="text-lg font-semibold text-text-900 dark:text-text-800">
                      {{ t("pages.dash.bookingForm.form.labels.eventCover") }}
                    </h3>
                    <button
                      @click="showImageModal = false"
                      class="rounded-md p-2 text-text-700 dark:text-text-700 hover:bg-background-100 dark:hover:bg-background-200 hover:text-text-900 dark:hover:text-text-900 transition-colors">
                      <X class="w-5 h-5" />
                    </button>
                  </div>

                  <div class="p-4">
                    <img
                      :src="selectedEventInfo.coverUrl"
                      alt="Event cover fullscreen"
                      class="max-h-[70vh] mx-auto object-contain rounded-lg" />
                  </div>

                  <div class="bg-background-100 dark:bg-background-200 px-6 py-4 flex justify-end gap-2 rounded-b-lg">
                    <button
                      @click="showImageModal = false"
                      class="inline-flex justify-center rounded-md bg-background-50 dark:bg-background-100 px-3 py-2 text-sm font-semibold text-text-800 dark:text-text-700 shadow-sm ring-1 ring-inset ring-background-300 dark:ring-background-400 hover:bg-background-100 dark:hover:bg-background-200 transition-colors">
                      {{ t("pages.dash.bookingForm.common.close") }}
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
  User,
  Loader2,
  ClipboardList,
  CheckCircle2,
  X,
  Save,
  XCircle,
  FileText,
  Clock,
  ChevronDown,
  Check,
  Bookmark,
  Timer,
  ImageIcon,
  Search,
} from "lucide-vue-next";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import { toMySQLDateTime } from "@/utils/dateUtils";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Ajustar la fecha para evitar desfases de zona horaria
    const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return adjustedDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const isEditMode = computed(() => !!route.params.id);
const bookingId = computed(() => route.params.id);
const initialBookingData = ref(null);
const isLoading = ref(isEditMode.value);
const loadError = ref(null);
const events = ref([]);
const availableSpaces = ref([]);
const selectedEvent = ref("");
const selectedSpace = ref("");
const selectedEventInfo = ref(null);
const selectedEventCategoryInfo = ref(null);

const pageTitle = computed(() => {
  return isEditMode.value ? t("pages.dash.bookingForm.page.editTitle") : t("pages.dash.bookingForm.page.createTitle");
});

const pageDescription = computed(() => {
  return isEditMode.value
    ? t("pages.dash.bookingForm.page.editDescription")
    : t("pages.dash.bookingForm.page.createDescription");
});

const formData = reactive({
  eventId: "",
  space: "",
  bookingDate: "",
  info: "",
  bookedBy: authStore.userId,
});

const errors = reactive({
  event: "",
  space: "",
  bookingDate: "",
  info: "",
});

const touchedFields = reactive({
  event: false,
  space: false,
  bookingDate: false,
  info: false,
});

const isSubmitting = ref(false);
const buttonState = ref("default");
const formSubmitted = ref(false);
const returnRoute = ref("dashBookings");

onMounted(async () => {
  if (route.query.returnTo) {
    returnRoute.value = route.query.returnTo; // Configura la ruta de retorno desde la query
  } else {
    returnRoute.value = "dashHome"; // Por defecto, vuelve al HomeView
  }

  if (!isEditMode.value && route.query.date) {
    try {
      const dateParam = new Date(route.query.date);
      if (!isNaN(dateParam.getTime())) {
        dateParam.setHours(0, 0, 0, 0);
        formData.bookingDate = formatDateForInput(dateParam);
        touchedFields.bookingDate = true;
        validateFormField("bookingDate", formData.bookingDate);
      }
    } catch (error) {
      console.error("Error al procesar la fecha:", error);
    }
  }

  try {
    const spacesResponse = await axios.get("/api/spaces");
    if (spacesResponse.data.success) {
      availableSpaces.value = spacesResponse.data.data;
    }
  } catch (error) {
    console.error("Error loading spaces:", error);
  }

  if (isEditMode.value && route.meta.initialData) {
    initialBookingData.value = route.meta.initialData.booking;
    events.value = route.meta.initialData.events || [];

    if (initialBookingData.value) {
      console.log("Datos de la reserva cargados:", initialBookingData.value);

      formData.eventId = initialBookingData.value.eventId || "";
      formData.space = initialBookingData.value.space || "";
      formData.bookingDate = formatDateForInput(initialBookingData.value.bookingDate) || "";
      formData.info = initialBookingData.value.info || "";

      // Asignar IDs correctamente asegurando que selectedEvent y selectedSpace se inicialicen
      selectedEvent.value = initialBookingData.value.eventId || "";
      selectedSpace.value = initialBookingData.value.space || "";

      console.log("Evento seleccionado:", selectedEvent.value);
      console.log("Espacio seleccionado:", selectedSpace.value);

      // Primero cargamos la información del evento para obtener su categoría
      if (selectedEvent.value) {
        await updateSelectedEventInfo();
      }

      isLoading.value = false;
    } else if (route.meta.initialData.error) {
      loadError.value = t("pages.dash.bookingForm.errors.loadingBooking");
      isLoading.value = false;
    }
  } else if (route.meta.initialData) {
    events.value = route.meta.initialData.events || [];
    isLoading.value = false;
  } else {
    isLoading.value = false;
  }
});

const updateSelectedEventInfo = async () => {
  if (!selectedEvent.value || events.value.length === 0) {
    selectedEventInfo.value = null;
    selectedEventCategoryInfo.value = null;
    return;
  }

  const event = events.value.find((e) => e.id === selectedEvent.value || e._id === selectedEvent.value);
  if (!event) {
    console.error("Evento no encontrado:", selectedEvent.value);
    selectedEventInfo.value = null;
    selectedEventCategoryInfo.value = null;
    return;
  }

  selectedEventInfo.value = event;

  if (event.category) {
    try {
      const categoryResponse = await axios.get(`/api/categories?id=${event.category}`);
      if (categoryResponse.data.success) {
        selectedEventCategoryInfo.value = categoryResponse.data.data;

        // Una vez que tenemos la categoría, podemos cargar los espacios disponibles
        await loadSpacesForCategory(selectedEventCategoryInfo.value);
      } else {
        console.error("Error al cargar datos de categoría:", categoryResponse.data);
      }
    } catch (error) {
      console.error("Error al cargar categoría:", error);
    }
  } else {
    // Si el evento no tiene categoría, usamos todos los espacios
    console.log("Evento sin categoría, usando todos los espacios disponibles");
  }
};

const loadSpacesForCategory = async (category) => {
  if (!category) return;

  let categorySpaces;
  if (category.spaces) {
    try {
      categorySpaces = typeof category.spaces === "string" ? JSON.parse(category.spaces) : category.spaces;
    } catch (e) {
      console.error("Error al parsear espacios de categoría:", e);
      categorySpaces = [];
    }
  } else {
    categorySpaces = [];
  }

  if (!Array.isArray(categorySpaces)) {
    console.error("Los espacios de categoría no son un array:", categorySpaces);
    categorySpaces = [];
  }

  try {
    const spacesResponse = await axios.get("/api/spaces");
    if (spacesResponse.data.success) {
      const allSpaces = spacesResponse.data.data;

      // Si tenemos espacios de categoría definidos, filtramos por ellos
      if (categorySpaces.length > 0) {
        availableSpaces.value = allSpaces.filter((space) => categorySpaces.includes(space.id || space._id));
      } else {
        // Si no hay espacios definidos en la categoría, usamos todos
        availableSpaces.value = allSpaces;
      }

      // Si estamos en modo edición y ya tenemos un espacio seleccionado,
      // nos aseguramos de que esté disponible en la lista
      if (isEditMode.value && selectedSpace.value) {
        const spaceExists = availableSpaces.value.some(
          (space) => space.id === selectedSpace.value || space._id === selectedSpace.value,
        );

        if (!spaceExists) {
          const selectedSpaceData = allSpaces.find(
            (space) => space.id === selectedSpace.value || space._id === selectedSpace.value,
          );

          if (selectedSpaceData) {
            availableSpaces.value.push(selectedSpaceData);
            console.log("Añadido espacio seleccionado a la lista:", selectedSpaceData);
          } else {
            console.warn("No se encontró el espacio seleccionado en los espacios disponibles:", selectedSpace.value);
          }
        }
      }

      console.log("Espacios cargados:", availableSpaces.value.length);
    }
  } catch (error) {
    console.error("Error al cargar espacios:", error);
  }
};

watch(selectedEvent, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    formData.eventId = newValue;
    if (!isEditMode.value) {
      selectedSpace.value = "";
      formData.space = "";
    }
    await updateSelectedEventInfo();
    touchedFields.event = true;
    validateFormField("event", newValue);
  }
});

watch(selectedSpace, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    formData.space = newValue;
    touchedFields.space = true;
    validateFormField("space", newValue);
  }
});

watch(
  () => initialBookingData.value,
  (newVal) => {
    if (newVal && newVal.bookedBy) {
      loadBookerData(newVal.bookedBy);
    }
  },
  { immediate: true },
);

const selectedEventName = computed(() => {
  if (!selectedEvent.value || !events.value.length) return "";
  const event = events.value.find((evt) => evt.id === selectedEvent.value || evt._id === selectedEvent.value);
  return event ? event.title : "";
});

const selectedSpaceName = computed(() => {
  if (!selectedSpace.value) return "";
  if (!availableSpaces.value.length) return "";

  const space = availableSpaces.value.find((spc) => spc.id === selectedSpace.value || spc._id === selectedSpace.value);

  return space ? space.name : "";
});

const selectedEventCategoryName = computed(() => {
  return selectedEventCategoryInfo.value ? selectedEventCategoryInfo.value.name : "";
});

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return t("pages.dash.eventsForm.form.placeholders.noDuration");
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
};

const formatBookingDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString();
};

const validateFormField = (field, value) => {
  if (formSubmitted.value) return true;
  switch (field) {
    case "event":
      const isEventValid = !!value;
      errors.event = isEventValid ? "" : t("pages.dash.bookingForm.errors.eventRequired");
      return isEventValid;
    case "space":
      const isSpaceValid = !!value;
      errors.space = isSpaceValid ? "" : t("pages.dash.bookingForm.errors.spaceRequired");
      return isSpaceValid;
    case "bookingDate":
      const isDateValid = !!value;
      errors.bookingDate = isDateValid ? "" : t("pages.dash.bookingForm.errors.dateRequired");
      return isDateValid;
    case "info":
      const isInfoValid = !value || value.length <= 500;
      errors.info = isInfoValid ? "" : t("pages.dash.bookingForm.errors.infoLength");
      return isInfoValid;
    default:
      return true;
  }
};

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;
  const mandatoryFieldsValid = !errors.event && !errors.space && !errors.bookingDate && !errors.info;
  const fieldsNotEmpty = formData.eventId && formData.space && formData.bookingDate;
  return mandatoryFieldsValid && fieldsNotEmpty;
});

watch(
  () => formData.eventId,
  (newVal) => {
    touchedFields.event = true;
    validateFormField("event", newVal);
  },
);
watch(
  () => formData.space,
  (newVal) => {
    touchedFields.space = true;
    validateFormField("space", newVal);
  },
);
watch(
  () => formData.bookingDate,
  (newVal) => {
    touchedFields.bookingDate = true;
    validateFormField("bookingDate", newVal);
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
  errors.event = "";
  errors.space = "";
  errors.bookingDate = "";
  errors.info = "";
  isValid = validateFormField("event", formData.eventId) && isValid;
  isValid = validateFormField("space", formData.space) && isValid;
  isValid = validateFormField("bookingDate", formData.bookingDate) && isValid;
  isValid = validateFormField("info", formData.info) && isValid;
  return isValid;
};

const handleSubmit = async () => {
  const formValid = validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    const bookingDate = formData.bookingDate ? toMySQLDateTime(new Date(formData.bookingDate).toISOString()) : "";

    const bookingData = {
      eventId: formData.eventId,
      space: formData.space,
      bookingDate: bookingDate,
      info: formData.info,
      bookedBy: authStore.userId,
    };

    let response;
    if (isEditMode.value) {
      response = await axios.put(`/api/bookings?id=${bookingId.value}`, bookingData);
    } else {
      response = await axios.post("/api/bookings", bookingData);
    }

    if ((isEditMode.value && response.status === 200) || (!isEditMode.value && response.status === 201)) {
      formSubmitted.value = true;
      buttonState.value = "success";
      toast.success(
        isEditMode.value
          ? t("pages.dash.bookingForm.notifications.updateSuccess")
          : t("pages.dash.bookingForm.notifications.createSuccess"),
      );
      setTimeout(() => router.push({ name: returnRoute.value }), 2000);
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    buttonState.value = "error";
    if (error.response) {
      const errorMessage = error.response.data?.message;
      if (errorMessage === "Space is not available at that date and time") {
        toast.error(t("pages.dash.bookingForm.errors.spaceNotAvailable"));
      } else {
        toast.error(errorMessage || t("pages.dash.bookingForm.errors.unknown"));
      }
    } else if (error.request) {
      toast.error(t("pages.dash.bookingForm.errors.noResponse"));
    } else {
      toast.error(t("pages.dash.bookingForm.errors.requestSetup"));
    }
    setTimeout(() => {
      buttonState.value = "default";
    }, 2000);
  } finally {
    isSubmitting.value = false;
  }
};

const bookerData = ref(null);
const isLoadingBooker = ref(false);
const bookerError = ref(false);

const loadBookerData = async (bookerId) => {
  if (!bookerId) return;
  isLoadingBooker.value = true;
  bookerError.value = false;
  try {
    const response = await axios.get(`/api/users?id=${bookerId}`);
    if (response.status === 200 && response.data.data) {
      bookerData.value = response.data.data;
    } else {
      bookerError.value = true;
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario que reservó:", error);
    bookerError.value = true;
  } finally {
    isLoadingBooker.value = false;
  }
};

const showImageModal = ref(false);

const openImageModal = () => {
  if (selectedEventInfo.value && selectedEventInfo.value.coverUrl) {
    showImageModal.value = true;
  }
};
</script>
