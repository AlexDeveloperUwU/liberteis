<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="pageTitle" />

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="order-2 lg:order-1">
        <DsCard :title="t('pages.dash.bookingForm.profile.preview')" class="h-full">
          <div class="bg-background-50 p-5 rounded-lg border border-background-200 space-y-4">
            <InfoRow icon="calendar-days" :label="t('pages.dash.bookingForm.form.labels.eventTitle')" :value="selectedEventName || t('pages.dash.bookingForm.form.placeholders.noEvent')" />

            <div class="flex justify-center">
              <div
                class="relative rounded-lg overflow-hidden border border-background-300 shadow-sm cursor-pointer group"
                style="width: 15%; aspect-ratio: 9/16"
                @click="openImageModal">
                <div v-if="selectedEventInfo && selectedEventInfo.coverUrl" class="w-full h-full">
                  <img :src="selectedEventInfo.coverUrl" :alt="t('pages.other.commons.altText.eventCover')" class="w-full h-full object-cover" />
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

            <InfoRow icon="map-pin" :label="t('pages.dash.bookingForm.form.labels.space')" :value="selectedSpaceName || t('pages.dash.bookingForm.form.placeholders.noSpace')" />

            <InfoRow
              icon="clock"
              :label="t('pages.dash.bookingForm.form.labels.bookingDate')"
              :value="
                isRecurrent
                  ? `${formatPreviewDate(formData.startDate)} - ${formatPreviewDate(formData.endDate)}`
                  : formatBookingDate(formData.bookingDate) || t('pages.dash.bookingForm.form.placeholders.noDate')
              " />

            <template v-if="selectedEventInfo">
              <InfoRow icon="bookmark" :label="t('pages.dash.bookingForm.form.labels.eventCategory')" :value="selectedEventCategoryName || t('pages.dash.bookingForm.form.labels.noCategory')" />
              <InfoRow v-if="selectedEventInfo.duration" icon="timer" :label="t('pages.dash.bookingForm.form.labels.eventDuration')" :value="formatDuration(selectedEventInfo.duration)" />
            </template>

            <InfoRow
              v-if="isEditMode && initialBookingData"
              icon="user"
              :label="t('pages.dash.bookingForm.profile.bookedBy')"
              :value="bookedByLabel" />

            <InfoRow icon="file-text" align="start" :label="t('pages.dash.bookingForm.form.labels.info')" :value="formData.info || t('pages.dash.bookingForm.form.placeholders.noInfo')" />
          </div>
        </DsCard>
      </div>

      <div class="order-1 lg:order-2">
        <DsCard :title="isEditMode ? t('pages.dash.bookingForm.common.edit') : t('pages.dash.bookingForm.common.create')" class="h-full">
          <div class="bg-background-50 p-4 rounded-lg border border-background-200 space-y-4">
            <h4 class="text-sm font-medium text-text-700 mb-1 flex items-center">
              <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
              {{ t("pages.dash.bookingForm.form.sections.basicInfo") }}
            </h4>

            <div>
              <SelectMenu
                v-model="selectedEvent"
                :label="t('pages.dash.bookingForm.form.labels.event')"
                icon="calendar-days"
                :options="eventOptions"
                :placeholder="t('pages.dash.bookingForm.form.placeholders.selectEvent')"
                :error="!formSubmitted && errors.event ? errors.event : false"
                :disabled="isEditMode" />
              <DsButton type="button" variant="soft" icon="calendar-days" full-width class="mt-2" @click="$router.push({ name: 'dashEventsNew' })">
                {{ t("pages.dash.bookingForm.form.actions.createEvent") || "¿No encuentras tu evento? Crea uno nuevo" }}
              </DsButton>
            </div>

            <SelectMenu
              v-model="selectedSpace"
              :label="t('pages.dash.bookingForm.form.labels.space')"
              icon="map-pin"
              :options="spaceOptions"
              :placeholder="!selectedEvent && !isEditMode ? t('pages.dash.bookingForm.form.placeholders.selectSpaceFirst') : t('pages.dash.bookingForm.form.placeholders.selectSpace')"
              :error="!formSubmitted && errors.space ? errors.space : false"
              :disabled="!selectedEvent && !isEditMode" />

            <label v-if="!isEditMode" class="flex items-center gap-3 bg-background-100 p-3 rounded-lg border border-background-300 hover:border-primary-300 transition-colors cursor-pointer">
              <input id="recurrence" type="checkbox" v-model="isRecurrent" class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer" />
              <span class="text-sm font-medium text-text-700 select-none">{{ t("pages.dash.bookingForm.form.labels.repeat") }}</span>
            </label>

            <div v-if="isRecurrent && !isEditMode" class="bg-background-100 p-4 rounded-lg border border-background-300 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <label class="block">
                  <span class="block text-text-700 text-xs font-semibold uppercase tracking-wider mb-1.5">{{ t("pages.dash.bookingForm.form.labels.startDate") }}</span>
                  <span class="relative flex items-center">
                    <Calendar class="absolute left-3 w-4 h-4 text-primary-600 pointer-events-none" />
                    <input v-model="formData.startDate" type="date" class="w-full h-10 pl-9 pr-3 rounded-md border-[1.5px] border-background-300 bg-background-50 text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </span>
                </label>
                <label class="block">
                  <span class="block text-text-700 text-xs font-semibold uppercase tracking-wider mb-1.5">{{ t("pages.dash.bookingForm.form.labels.endDate") }}</span>
                  <span class="relative flex items-center">
                    <Calendar class="absolute left-3 w-4 h-4 text-primary-600 pointer-events-none" />
                    <input v-model="formData.endDate" type="date" class="w-full h-10 pl-9 pr-3 rounded-md border-[1.5px] border-background-300 bg-background-50 text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </span>
                </label>
              </div>

              <div>
                <span class="block text-text-700 text-xs font-semibold uppercase tracking-wider mb-3">{{ t("pages.dash.bookingForm.form.labels.days") }}</span>
                <div class="grid grid-cols-7 gap-2">
                  <button
                    v-for="dayIndex in [1, 2, 3, 4, 5, 6, 0]"
                    :key="dayIndex"
                    type="button"
                    @click="toggleDay(dayIndex)"
                    class="h-10 rounded-md border-[1.5px] flex items-center justify-center transition-all duration-150 shadow-sm"
                    :class="recurrenceState[dayIndex].selected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-background-50 border-background-300 text-text-600 hover:border-primary-300'">
                    <span class="text-xs font-bold">{{ getDayLabel(dayIndex) }}</span>
                  </button>
                </div>
              </div>

              <div v-if="hasSelectedDays" class="pt-2 border-t border-background-300">
                <template v-for="dayIndex in [1, 2, 3, 4, 5, 6, 0]" :key="dayIndex">
                  <div v-if="recurrenceState[dayIndex].selected" class="flex items-center justify-between py-2 border-b border-background-200 last:border-0">
                    <span class="text-sm font-medium text-text-800">{{ getFullDayLabel(dayIndex) }}</span>
                    <span class="relative w-32 flex items-center">
                      <Clock class="absolute left-2.5 w-3.5 h-3.5 text-primary-600 pointer-events-none" />
                      <input type="time" v-model="recurrenceState[dayIndex].time" class="w-full h-8 pl-8 pr-2 text-sm rounded-md border border-background-300 bg-background-50 text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </span>
                  </div>
                </template>
              </div>
            </div>

            <label v-if="!isRecurrent" class="block">
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.bookingForm.form.labels.bookingDate") }}</span>
              <span class="relative flex items-center">
                <Clock class="absolute left-3 w-4 h-4 text-text-500 pointer-events-none" />
                <input
                  v-model="formData.bookingDate"
                  type="datetime-local"
                  class="w-full h-10 pl-9 pr-9 rounded-md border-[1.5px] bg-background-50 text-text-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
                  :class="errors.bookingDate && !formSubmitted ? 'border-accent-500 ring-1 ring-accent-300' : 'border-background-300'"
                  required />
                <CheckCircle2 v-if="(!errors.bookingDate || formSubmitted) && formData.bookingDate" class="absolute right-3 w-4 h-4 text-primary-500" />
                <XCircle v-else-if="(formData.bookingDate || touchedFields.bookingDate) && !formSubmitted" class="absolute right-3 w-4 h-4 text-accent-500" />
              </span>
            </label>

            <div v-if="isEditMode && initialBookingData?.groupId" class="bg-background-100 p-4 rounded-lg border border-background-300">
              <span class="block text-text-800 text-sm font-bold mb-3 flex items-center">
                <ClipboardList class="w-4 h-4 mr-2 text-primary-600" />
                {{ t("pages.dash.bookingForm.form.labels.updateScope") }}
              </span>
              <div class="flex flex-col gap-2">
                <label class="flex items-center p-3 rounded-md border-[1.5px] bg-background-50 cursor-pointer transition-colors" :class="updateScope === 'single' ? 'border-primary-500 ring-2 ring-primary-500' : 'border-background-300 hover:border-primary-300'">
                  <input type="radio" value="single" v-model="updateScope" class="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                  <span class="ml-3 text-sm font-medium text-text-800">{{ t("pages.dash.bookingForm.form.options.updateSingle") }}</span>
                </label>
                <label class="flex items-center p-3 rounded-md border-[1.5px] bg-background-50 cursor-pointer transition-colors" :class="updateScope === 'group' ? 'border-primary-500 ring-2 ring-primary-500' : 'border-background-300 hover:border-primary-300'">
                  <input type="radio" value="group" v-model="updateScope" class="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                  <span class="ml-3 text-sm font-medium text-text-800">{{ t("pages.dash.bookingForm.form.options.updateGroup") }}</span>
                </label>
              </div>
            </div>

            <div>
              <span class="block text-sm font-medium text-text-label mb-1.5">{{ t("pages.dash.bookingForm.form.labels.info") }}</span>
              <span class="relative block">
                <textarea
                  v-model="formData.info"
                  rows="4"
                  maxlength="500"
                  class="block w-full p-3 border-[1.5px] rounded-md bg-background-50 text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
                  :class="errors.info && !formSubmitted ? 'border-accent-500 ring-1 ring-accent-300' : 'border-background-300'"
                  :placeholder="t('pages.dash.bookingForm.form.placeholders.info')"></textarea>
                <span class="absolute bottom-3 right-3 flex items-center gap-2">
                  <span class="text-xs text-text-500">{{ formData.info?.length || 0 }}/500</span>
                  <CheckCircle2 v-if="!errors.info || formSubmitted" class="w-4 h-4 text-primary-500" />
                  <XCircle v-else-if="errors.info && !formSubmitted" class="w-4 h-4 text-accent-500" />
                </span>
              </span>
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 gap-2">
            <DsButton type="button" variant="neutral" icon="x" @click="$router.push({ name: returnRoute })">
              {{ t("pages.dash.bookingForm.common.cancel") }}
            </DsButton>
            <DsButton type="submit" :state="buttonState" icon="save" :disabled="isSubmitting || !isFormValid">
              <template v-if="buttonState === 'processing'">
                {{ isEditMode ? t("pages.dash.bookingForm.form.actions.updating") : t("pages.dash.bookingForm.form.actions.submitting") }}
              </template>
              <template v-else-if="buttonState === 'success'">{{ t("pages.dash.bookingForm.common.status.success") }}</template>
              <template v-else-if="buttonState === 'error'">{{ t("pages.dash.bookingForm.common.status.error") }}</template>
              <template v-else>{{ isEditMode ? t("pages.dash.bookingForm.common.update") : t("pages.dash.bookingForm.common.create") }}</template>
            </DsButton>
          </div>
        </DsCard>
      </div>
    </form>

    <DsModal
      :open="showImageModal && !!(selectedEventInfo && selectedEventInfo.coverUrl)"
      :title="t('pages.dash.bookingForm.form.labels.eventCover')"
      width="lg"
      :actions="[{ label: t('pages.dash.bookingForm.common.close'), type: 'default', onClick: () => (showImageModal = false) }]"
      @close="showImageModal = false">
      <img v-if="selectedEventInfo" :src="selectedEventInfo.coverUrl" :alt="t('pages.other.commons.altText.eventCoverFullscreen')" class="max-h-[70vh] mx-auto object-contain rounded-lg" />
    </DsModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { Calendar, Search, ImageIcon, Clock, CheckCircle2, XCircle, ClipboardList } from "lucide-vue-next";
import axios from "axios";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import { toMySQLDateTime } from "@/utils/dateUtils";
import PageHeader from "@/components/data/PageHeader.vue";
import DsCard from "@/components/core/DsCard.vue";
import InfoRow from "@/components/data/InfoRow.vue";
import SelectMenu from "@/components/forms/SelectMenu.vue";
import DsButton from "@/components/core/DsButton.vue";
import DsModal from "@/components/feedback/DsModal.vue";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return adjustedDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const formatPreviewDate = (dateString) => {
  if (!dateString) return "?";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "?";
    return date.toLocaleDateString(locale.value);
  } catch {
    return "?";
  }
};

const isEditMode = computed(() => !!route.params.id);
const bookingId = computed(() => route.params.id);
const initialBookingData = ref(null);
const isLoading = ref(isEditMode.value);
const loadError = ref(null);
const events = ref([]);
const allSpaces = ref([]);
const availableSpaces = ref([]);
const selectedEvent = ref("");
const selectedSpace = ref("");
const selectedEventInfo = ref(null);
const selectedEventCategoryInfo = ref(null);

const eventOptions = computed(() =>
  events.value.map((event) => ({ value: event._id || event.id, label: event.title, icon: "calendar-days" })),
);
const spaceOptions = computed(() =>
  availableSpaces.value.map((space) => ({ value: space._id || space.id, label: space.name, icon: "map-pin" })),
);

const isRecurrent = ref(false);
const updateScope = ref("single");

/**
 * Keyed by JS `Date#getDay()` values (0 = Sunday, ..., 6 = Saturday).
 */
const recurrenceState = reactive({
  1: { selected: false, time: "10:00" },
  2: { selected: false, time: "10:00" },
  3: { selected: false, time: "10:00" },
  4: { selected: false, time: "10:00" },
  5: { selected: false, time: "10:00" },
  6: { selected: false, time: "10:00" },
  0: { selected: false, time: "10:00" },
});

const getDayLabel = (dayIndex) => {
  const keys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return t(`pages.other.commons.weekdays.${keys[dayIndex]}`).substring(0, 3);
};

const getFullDayLabel = (dayIndex) => {
  const keys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return t(`pages.other.commons.weekdays.${keys[dayIndex]}`);
};

const toggleDay = (dayIndex) => {
  recurrenceState[dayIndex].selected = !recurrenceState[dayIndex].selected;
};

const hasSelectedDays = computed(() => {
  return Object.values(recurrenceState).some((d) => d.selected);
});

const pageTitle = computed(() => {
  return isEditMode.value ? t("pages.dash.bookingForm.page.editTitle") : t("pages.dash.bookingForm.page.createTitle");
});

const formData = reactive({
  eventId: "",
  space: "",
  bookingDate: "",
  info: "",
  bookedBy: authStore.userId,
  startDate: "",
  endDate: "",
});

const errors = reactive({
  event: "",
  space: "",
  bookingDate: "",
  info: "",
  recurrence: "",
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
    returnRoute.value = route.query.returnTo;
  } else {
    returnRoute.value = "dashHome";
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
      console.error("Error processing date:", error);
    }
  }

  try {
    const spacesResponse = await axios.get("/api/spaces");
    if (spacesResponse.data.success) {
      allSpaces.value = spacesResponse.data.data;
      availableSpaces.value = spacesResponse.data.data;
    }
  } catch (error) {
    console.error("Error loading spaces:", error);
  }

  if (isEditMode.value && route.meta.initialData) {
    initialBookingData.value = route.meta.initialData.booking;
    events.value = route.meta.initialData.events || [];

    if (initialBookingData.value) {
      formData.eventId = initialBookingData.value.eventId || "";
      formData.space = initialBookingData.value.space || "";
      formData.bookingDate = formatDateForInput(initialBookingData.value.bookingDate) || "";
      formData.info = initialBookingData.value.info || "";

      selectedEvent.value = initialBookingData.value.eventId || "";
      selectedSpace.value = initialBookingData.value.space || "";

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
        await loadSpacesForCategory(selectedEventCategoryInfo.value);
      }
    } catch (error) {
      console.error("Error loading category:", error);
    }
  }
};

const loadSpacesForCategory = (category) => {
  if (!category) return;

  let categorySpaces;
  if (category.spaces) {
    try {
      categorySpaces = typeof category.spaces === "string" ? JSON.parse(category.spaces) : category.spaces;
    } catch {
      categorySpaces = [];
    }
  } else {
    categorySpaces = [];
  }

  if (categorySpaces.length > 0) {
    availableSpaces.value = allSpaces.value.filter((space) => categorySpaces.includes(space.id || space._id));
  } else {
    availableSpaces.value = allSpaces.value;
  }

  if (isEditMode.value && selectedSpace.value) {
    const spaceExists = availableSpaces.value.some(
      (space) => space.id === selectedSpace.value || space._id === selectedSpace.value,
    );
    if (!spaceExists) {
      const selectedSpaceData = allSpaces.value.find(
        (space) => space.id === selectedSpace.value || space._id === selectedSpace.value,
      );
      if (selectedSpaceData) {
        availableSpaces.value.push(selectedSpaceData);
      }
    }
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
    case "event": {
      const isEventValid = !!value;
      errors.event = isEventValid ? "" : t("pages.dash.bookingForm.errors.eventRequired");
      return isEventValid;
    }
    case "space": {
      const isSpaceValid = !!value;
      errors.space = isSpaceValid ? "" : t("pages.dash.bookingForm.errors.spaceRequired");
      return isSpaceValid;
    }
    case "bookingDate": {
      if (isRecurrent.value) return true;
      const isDateValid = !!value;
      errors.bookingDate = isDateValid ? "" : t("pages.dash.bookingForm.errors.dateRequired");
      return isDateValid;
    }
    case "info": {
      const isInfoValid = !value || value.length <= 500;
      errors.info = isInfoValid ? "" : t("pages.dash.bookingForm.errors.infoLength");
      return isInfoValid;
    }
    default:
      return true;
  }
};

const isFormValid = computed(() => {
  if (formSubmitted.value) return true;
  const mandatoryFieldsValid = !errors.event && !errors.space && !errors.info;
  const basicFields = formData.eventId && formData.space;

  if (isRecurrent.value && !isEditMode.value) {
    const datesValid = formData.startDate && formData.endDate;
    const daysSelected = Object.values(recurrenceState).some((d) => d.selected);
    const timesValid = Object.values(recurrenceState).every((d) => !d.selected || d.time);
    return mandatoryFieldsValid && basicFields && datesValid && daysSelected && timesValid;
  } else {
    return mandatoryFieldsValid && basicFields && formData.bookingDate && !errors.bookingDate;
  }
});

const validateForm = () => {
  if (formSubmitted.value) return true;
  let isValid = true;
  errors.event = "";
  errors.space = "";
  errors.bookingDate = "";
  errors.info = "";

  isValid = validateFormField("event", formData.eventId) && isValid;
  isValid = validateFormField("space", formData.space) && isValid;
  if (!isRecurrent.value) {
    isValid = validateFormField("bookingDate", formData.bookingDate) && isValid;
  } else if (!isEditMode.value) {
    if (!formData.startDate || !formData.endDate) {
      toast.error(t("pages.dash.bookingForm.errors.datesRequired"));
      isValid = false;
    }
    const daysSelected = Object.values(recurrenceState).some((d) => d.selected);
    if (!daysSelected) {
      toast.error(t("pages.dash.bookingForm.errors.daysRequired"));
      isValid = false;
    } else {
      const timesInvalid = Object.values(recurrenceState).some((d) => d.selected && !d.time);
      if (timesInvalid) {
        toast.error(t("pages.dash.bookingForm.errors.timeRequired"));
        isValid = false;
      }
    }
  }
  isValid = validateFormField("info", formData.info) && isValid;
  return isValid;
};

const handleSubmit = async () => {
  const formValid = validateForm();
  if (!formValid) return;

  isSubmitting.value = true;
  buttonState.value = "processing";

  try {
    let bookingData = {
      eventId: formData.eventId,
      space: formData.space,
      info: formData.info,
      bookedBy: authStore.userId,
    };

    if (isRecurrent.value && !isEditMode.value) {
      bookingData.recurrence = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: Object.entries(recurrenceState)
          .filter(([, data]) => data.selected)
          .map(([dayIndex, data]) => ({
            day: parseInt(dayIndex),
            time: data.time,
          })),
      };
    } else {
      bookingData.bookingDate = formData.bookingDate
        ? toMySQLDateTime(new Date(formData.bookingDate).toISOString())
        : "";
    }

    let response;
    if (isEditMode.value) {
      response = await axios.put(`/api/bookings?id=${bookingId.value}&scope=${updateScope.value}`, bookingData);
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
    console.error("Error processing request:", error);
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
    console.error("Error fetching booker data:", error);
    bookerError.value = true;
  } finally {
    isLoadingBooker.value = false;
  }
};

const bookedByLabel = computed(() => {
  if (isLoadingBooker.value) return t("pages.dash.bookingForm.profile.loading");
  if (bookerError.value) return t("pages.dash.bookingForm.profile.errorLoading");
  if (bookerData.value) return bookerData.value.name;
  return initialBookingData.value?.bookedBy ?? "";
});

const showImageModal = ref(false);

const openImageModal = () => {
  if (selectedEventInfo.value && selectedEventInfo.value.coverUrl) {
    showImageModal.value = true;
  }
};
</script>
