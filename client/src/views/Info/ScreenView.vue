<template>
  <div class="screen-view h-screen w-full flex flex-col bg-[var(--background-200)] overflow-hidden">
    <div class="flex justify-between items-center p-2 bg-[var(--background-100)] text-[var(--text-800)] shadow-sm">
      <h1 class="text-xl font-semibold truncate">{{ currentDateTime }}</h1>
      <div class="text-right font-bold text-xl">
        <span class="bg-[var(--background-200)] text-[var(--text-800)] py-1 px-3 rounded-full">{{ timeOnly }}</span>
      </div>
    </div>
    <div class="flex-1 flex justify-center items-center p-8 overflow-auto">
      <div v-if="loading" class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-600)]"></div>
      </div>
      <div
        v-else-if="events.length === 0"
        class="flex flex-col justify-center items-center bg-[var(--background-50)] p-8 rounded-xl shadow-lg max-w-full">
        <h2 class="text-2xl font-bold mb-2 text-[var(--text-700)] text-center">
          {{ t("pages.info.screen.noEvents") }}
        </h2>
        <p class="text-[var(--text-500)] text-center">{{ t("pages.info.screen.checkLater") }}</p>
      </div>
      <div
        v-else
        class="flex flex-col w-full h-full max-w-6xl bg-[var(--background-50)] rounded-xl shadow-lg overflow-hidden relative">
        <transition name="fade" mode="out-in" @before-leave="startTransition" @after-leave="finishTransition">
          <div :key="currentEventIndex" class="flex h-full flex-col md:flex-row overflow-auto">
            <div
              class="w-full md:w-1/2 h-64 md:h-full flex items-center justify-center p-4 md:p-8 bg-[var(--background-100)]">
              <div v-if="currentEvent.coverUrl" class="w-full h-full flex items-center justify-center relative">
                <img
                  :src="currentEvent.coverUrl"
                  class="max-h-full max-w-full object-contain rounded-lg shadow-md"
                  alt="Event cover" />
              </div>
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-[var(--background-200)] rounded-lg text-[var(--text-500)]">
                <span class="text-lg text-center">{{ t("pages.info.screen.noImage") }}</span>
              </div>
            </div>
            <div class="w-full md:w-1/2 bg-[var(--background-50)] p-6 md:p-8 overflow-y-auto">
              <div class="mb-6 pb-4 border-b border-[var(--background-200)]">
                <h2 class="text-3xl font-bold text-[var(--text-900)]">{{ currentEvent.title }}</h2>
              </div>
              <div class="space-y-6">
                <div
                  v-if="currentEvent.description"
                  class="bg-[var(--background-100)] rounded-lg p-5 border border-[var(--background-200)] shadow-sm">
                  <h3 class="text-lg font-semibold text-[var(--text-800)] mb-2">
                    {{ t("pages.info.screen.description") }}
                  </h3>
                  <p class="text-[var(--text-700)] whitespace-pre-wrap break-words">{{ currentEvent.description }}</p>
                </div>
                <div
                  v-if="currentEvent.bookingInfo"
                  class="bg-[var(--background-100)] rounded-lg p-5 border border-[var(--background-200)] shadow-sm">
                  <h3 class="text-lg font-semibold text-[var(--text-800)] mb-2">
                    {{ t("pages.info.screen.additionalInfo") }}
                  </h3>
                  <p class="text-[var(--text-700)] whitespace-pre-wrap break-words">{{ currentEvent.bookingInfo }}</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    class="bg-[var(--background-100)] rounded-lg p-4 border border-[var(--background-200)] shadow-sm">
                    <div class="flex items-center">
                      <div class="bg-[var(--primary-100)] p-2 rounded-full mr-3">
                        <Clock class="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div>
                        <p class="text-xs text-[var(--text-500)]">{{ t("pages.info.screen.dateTime") }}</p>
                        <p class="text-[var(--text-800)] font-medium">{{ formatTime(currentEvent.start) }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-[var(--background-100)] rounded-lg p-4 border border-[var(--background-200)] shadow-sm">
                    <div class="flex items-center">
                      <div class="bg-[var(--primary-100)] p-2 rounded-full mr-3">
                        <Clock class="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div>
                        <p class="text-xs text-[var(--text-500)]">{{ t("pages.info.screen.duration") }}</p>
                        <p class="text-[var(--text-800)] font-medium">{{ currentEvent.duration }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-[var(--background-100)] rounded-lg p-4 border border-[var(--background-200)] shadow-sm">
                    <div class="flex items-center">
                      <div class="bg-[var(--primary-100)] p-2 rounded-full mr-3">
                        <MapPin class="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div>
                        <p class="text-xs text-[var(--text-500)]">{{ t("pages.info.screen.space") }}</p>
                        <p class="text-[var(--text-800)] font-medium">{{ currentEvent.spaceName }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-[var(--background-100)] rounded-lg p-4 border border-[var(--background-200)] shadow-sm">
                    <div class="flex items-center">
                      <div class="bg-[var(--primary-100)] p-2 rounded-full mr-3">
                        <Tag class="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div>
                        <p class="text-xs text-[var(--text-500)]">{{ t("pages.info.screen.category") }}</p>
                        <p class="text-[var(--text-800)] font-medium">{{ currentEvent.categoryName || "-" }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-[var(--background-100)] rounded-lg p-4 border border-[var(--background-200)] shadow-sm">
                    <div class="flex items-center">
                      <div class="bg-[var(--primary-100)] p-2 rounded-full mr-3">
                        <CalendarDays class="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div>
                        <p class="text-xs text-[var(--text-500)]">{{ t("pages.info.screen.date") }}</p>
                        <p class="text-[var(--text-800)] font-medium">{{ formatFullDate(currentEvent.start) }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-[var(--background-100)] rounded-lg p-4 border border-[var(--background-200)] shadow-sm">
                    <div class="flex items-center">
                      <div class="bg-[var(--primary-100)] p-2 rounded-full mr-3">
                        <User class="w-5 h-5 text-[var(--primary-600)]" />
                      </div>
                      <div>
                        <p class="text-xs text-[var(--text-500)]">{{ t("pages.info.screen.addedBy") }}</p>
                        <p class="text-[var(--text-800)] font-medium">{{ currentEvent.addedBy || "-" }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import axios from "axios";
import { Clock, MapPin, Tag, CalendarDays, User } from "lucide-vue-next";

const route = useRoute();
const { t, locale } = useI18n();
const events = ref([]);
const loading = ref(true);
const currentEventIndex = ref(0);
const currentDateTime = ref("");
const timeOnly = ref("");
const isTransitioning = ref(false);

const initialData = route.meta.initialData || { events: [], error: false };

let dataRefreshInterval = null;
let pageRefreshInterval = null;
let clockInterval = null;
let rotateEventInterval = null;

const currentEvent = computed(() => {
  if (events.value.length === 0) return {};
  return events.value[currentEventIndex.value] || events.value[0];
});

const updateClock = () => {
  const now = new Date();
  currentDateTime.value = now.toLocaleDateString(locale.value, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  timeOnly.value = now.toLocaleTimeString(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.value, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return t("pages.info.screen.noDuration");
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

const loadEvents = async () => {
  loading.value = true;
  try {
    if (initialData.events.length > 0 && events.value.length === 0) {
      events.value = initialData.events;
      loading.value = false;
      return;
    }
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const startDate = now.toISOString();
    const endDate = nextWeek.toISOString();
    const response = await axios.get(`/api/bookings?startDate=${startDate}&endDate=${endDate}`);
    if (response.data.success) {
      const bookings = response.data.data;
      const calendarEvents = [];
      for (const booking of bookings) {
        try {
          const eventResponse = await axios.get(`/api/events?id=${booking.eventId}`);
          const spaceResponse = await axios.get(`/api/spaces?id=${booking.space}`);
          const userResponse = await axios.get(`/api/users?id=${booking.bookedBy}`);
          let categoryName = "";
          if (eventResponse.data.success && eventResponse.data.data.category) {
            const categoryResponse = await axios.get(`/api/categories?id=${eventResponse.data.data.category}`);
            if (categoryResponse.data.success) {
              categoryName = categoryResponse.data.data.name;
            }
          }
          if (eventResponse.data.success && spaceResponse.data.success && userResponse.data.success) {
            const event = eventResponse.data.data;
            const space = spaceResponse.data.data;
            const user = userResponse.data.data;
            const durationStr = formatDuration(event.duration);
            calendarEvents.push({
              id: booking.id || booking._id,
              title: event.title,
              start: new Date(booking.bookingDate),
              end: new Date(new Date(booking.bookingDate).getTime() + (event.duration || 60) * 60000),
              description: event.info,
              info: event.info,
              coverUrl: event.coverUrl,
              bookingInfo: booking.info,
              spaceName: space.name,
              categoryName: categoryName,
              addedBy: user.name,
              duration: durationStr,
            });
          }
        } catch (error) {
          console.error(`Error al obtener detalles para booking ${booking._id}:`, error);
        }
      }
      calendarEvents.sort((a, b) => a.start - b.start);
      events.value = calendarEvents;
    }
  } catch (error) {
    console.error("Error al cargar eventos:", error);
  } finally {
    loading.value = false;
  }
};

const nextEvent = () => {
  if (events.value.length <= 1 || isTransitioning.value) return;
  currentEventIndex.value = (currentEventIndex.value + 1) % events.value.length;
};

const rotateEvent = () => {
  if (events.value.length <= 1 || isTransitioning.value) return;
  nextEvent();
};

const startTransition = () => {
  isTransitioning.value = true;
};

const finishTransition = () => {
  isTransitioning.value = false;
};

const setupIntervals = () => {
  clockInterval = setInterval(updateClock, 1000);
  rotateEventInterval = setInterval(rotateEvent, 10000);
  dataRefreshInterval = setInterval(loadEvents, 300000);
  pageRefreshInterval = setInterval(() => {
    window.location.reload();
  }, 3600000);
};

onMounted(() => {
  updateClock();
  if (initialData.events.length > 0) {
    events.value = initialData.events;
    loading.value = false;
  } else {
    loadEvents();
  }
  setupIntervals();
});

onUnmounted(() => {
  clearInterval(clockInterval);
  clearInterval(rotateEventInterval);
  clearInterval(dataRefreshInterval);
  clearInterval(pageRefreshInterval);
});
</script>

<style scoped>
.screen-view {
  max-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.01);
}
</style>
