<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.home.page.title')" :description="t('pages.dash.home.page.description')" />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard icon="calendar-days" :label="t('pages.dash.home.metrics.totals')" :value="metrics.totales || 0" />
      <MetricCard icon="calendar-check-2" :label="t('pages.dash.home.metrics.done')" :value="metrics.hechos || 0" />
      <MetricCard icon="calendar-cog" :label="t('pages.dash.home.metrics.toBeDone')" :value="metrics.porHacer || 0" />
      <MetricCard icon="calendar-1" :label="t('pages.dash.home.metrics.upcoming')" :value="upcomingBookingDate" />
    </div>

    <DsCard>
      <div class="calendar-container">
        <div class="custom-calendar">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-background-400">
            <div class="flex items-center mb-4 sm:mb-0">
              <span
                class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-100 border border-primary-500 mr-3 shadow-nav-active">
                <Calendar class="w-5 h-5 text-primary-600" />
              </span>
              <h2 class="text-xl font-bold text-text-900 font-display">
                {{ formatMonthYear(currentDate) }}
              </h2>
            </div>
            <div class="flex items-center gap-2">
              <IconButton
                icon="chevron-left"
                variant="outlined"
                :label="t('pages.dash.home.calendar.previousMonth')"
                @click="previousMonth" />
              <DsButton :variant="isCurrentMonth() ? 'soft' : 'primary'" @click="goToToday">
                {{ t("pages.dash.home.calendar.today") }}
              </DsButton>
              <IconButton
                icon="chevron-right"
                variant="outlined"
                :label="t('pages.dash.home.calendar.nextMonth')"
                @click="nextMonth" />
              <IconButton
                :icon="currentView === 'month' ? 'list' : 'calendar-days'"
                variant="outlined"
                :active="currentView === 'list'"
                :label="t('pages.dash.home.calendar.toggleView')"
                @click="toggleView" />
            </div>
          </div>
          <div
            v-if="currentView === 'month'"
            class="calendar-month-view border border-background-300 rounded-lg overflow-hidden shadow-sm">
            <div class="grid" :class="[showWeekends ? 'grid-cols-7' : 'grid-cols-5']">
              <template v-for="(day, index) in weekdayLabels" :key="index">
                <div
                  v-if="showWeekends || (index !== 5 && index !== 6)"
                  class="py-3 text-center font-bold text-sm bg-background-200 text-text-800 border-b border-background-300">
                  {{ day }}
                </div>
              </template>
            </div>

            <div class="grid" :class="[showWeekends ? 'grid-cols-7' : 'grid-cols-5']">
              <template v-for="(week, weekIndex) in calendarData" :key="`week-${weekIndex}`">
                <template v-for="(day, dayIndex) in week" :key="`day-${weekIndex}-${dayIndex}`">
                  <div
                    v-if="showWeekends || !day.isWeekend"
                    @click="navigateToBookingForm(day.date)"
                    :class="[
                      'min-h-[100px] p-2 relative border border-background-200 cursor-pointer hover:bg-background-100/80 transition-colors',
                      day.isCurrentMonth ? 'bg-background-50 text-text-800' : 'bg-background-100/60 text-text-500',
                      day.isToday ? 'today-cell' : '',
                      day.isWeekend ? 'weekend' : '',
                    ]">
                    <div v-if="day.day !== 0" class="flex justify-between items-center mb-1 relative z-1">
                      <div
                        :class="[
                          'flex justify-center items-center h-7 w-7 rounded-full font-medium text-sm',
                          day.isToday ? 'bg-primary-500 text-white font-bold shadow' : '',
                        ]">
                        {{ day.day }}
                      </div>
                    </div>

                    <div v-if="day.day !== 0" class="space-y-1 overflow-y-auto max-h-[110px] relative z-1">
                      <div
                        v-for="event in getEventsForDay(day.date)"
                        :key="event.id"
                        @click.stop="showEventDetailsModal(event)"
                        :data-booking-id="
                          event.id || (event.bookingData && (event.bookingData.id || event.bookingData._id))
                        "
                        class="py-1 px-2 rounded-lg cursor-pointer flex items-center font-semibold text-xs border-l-4 shadow-sm transition-all duration-150 hover:shadow-md"
                        :class="getEventClassByStatus(event)">
                        <div class="w-2.5 h-2.5 rounded-full mr-2 shrink-0" :class="getEventDotClass(event)"></div>
                        <span class="truncate">{{ event.title }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
          <div v-else class="calendar-list-view border border-background-300 rounded-lg overflow-hidden shadow-sm">
            <div class="divide-y divide-background-200">
              <div v-for="(group, date) in groupedEvents" :key="date" class="bg-background-50">
                <div
                  class="px-4 py-3 flex items-center border-b border-background-300"
                  :class="isToday(new Date(date)) ? 'bg-primary-300' : 'bg-background-200'">
                  <div
                    :class="[
                      'h-8 w-8 rounded-full flex items-center justify-center mr-3 border',
                      isToday(new Date(date))
                        ? 'bg-primary-200 text-primary-700 border-white'
                        : 'bg-background-50 border-background-300 text-primary-700',
                    ]">
                    <span
                      class="font-medium"
                      :class="isToday(new Date(date)) ? 'text-primary-700' : 'text-primary-700'">
                      {{ new Date(date).getDate() }}
                    </span>
                  </div>
                  <span class="font-medium" :class="isToday(new Date(date)) ? 'text-text-900' : 'text-text-900'">
                    {{ formatDate(new Date(date)) }}
                  </span>
                </div>

                <div
                  v-if="group.length === 0"
                  class="p-4 text-text-600 italic text-sm flex items-center justify-center">
                  <Calendar1 class="w-4 h-4 mr-2 text-primary-600" />
                  {{ t("pages.dash.home.calendar.noEvents") }}
                </div>
                <div v-else class="divide-y divide-background-100">
                  <div
                    v-for="event in group"
                    :key="event.id"
                    @click="showEventDetailsModal(event)"
                    :data-booking-id="
                      event.id || (event.bookingData && (event.bookingData.id || event.bookingData._id))
                    "
                    class="p-4 transition-colors duration-150 cursor-pointer group"
                    :class="getEventStatusClass(event)">
                    <div class="flex items-start">
                      <div class="h-3 w-3 rounded-full mt-1.5 mr-3 shrink-0" :class="getEventDotClass(event)"></div>
                      <div class="grow">
                        <div class="font-medium text-text-900 group-hover:text-primary-900">
                          {{ event.title }}
                        </div>
                        <div class="text-sm text-text-600 mt-1 flex items-center group-hover:text-primary-900">
                          <Clock class="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                          {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
                        </div>
                        <div
                          v-if="event.description"
                          class="text-sm text-text-700 mt-1.5 line-clamp-2 group-hover:text-primary-900">
                          {{ event.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="Object.keys(groupedEvents).length === 0"
                class="p-8 text-center text-text-600 bg-background-50">
                <div class="flex flex-col items-center">
                  <CalendarX class="w-12 h-12 text-primary-600 mb-3" />
                  <p class="font-medium">
                    {{ t("pages.dash.home.calendar.noEventsMonth") }}
                  </p>
                  <p class="text-sm mt-1 text-text-500">
                    {{ t("pages.dash.home.calendar.tryAnotherMonth") }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DsCard>
  </div>
</template>

<script setup>
import { Calendar, Clock, CalendarX } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRoute } from "vue-router";
import { useModalStore } from "@/stores/modalStore";
import axios from "axios";
import { useRouter } from "vue-router";
import { useModal } from "@/composables/useModal";
import { useToast } from "@/composables/useToast";
import { mapBookingToEvent } from "@/router/fetchers";
import PageHeader from "@/components/data/PageHeader.vue";
import MetricCard from "@/components/core/MetricCard.vue";
import DsCard from "@/components/core/DsCard.vue";
import IconButton from "@/components/core/IconButton.vue";
import DsButton from "@/components/core/DsButton.vue";

const route = useRoute();
const { t, locale } = useI18n();
const configStore = useConfigStore();
const modalStore = useModalStore();
const router = useRouter();

const initialData = route.meta.initialData || {
  metrics: {},
  bookings: [],
  startMonth: null,
  endMonth: null,
  error: false,
  errorMessage: "",
};
const metrics = ref({
  totales: initialData.metrics.total || 0,
  hechos: initialData.metrics.done || 0,
  porHacer: initialData.metrics.todo || 0,
});
const preloadedBookings = initialData.bookings || [];

const events = ref([]);
const isLoadingEvents = ref(false);
const loadingError = ref(null);

const isMobile = ref(window.innerWidth <= 768);
const currentDate = ref(new Date());
const currentView = ref(isMobile.value ? "list" : "month");
const showWeekends = ref(false);
const upcomingBookingDate = ref("--/--/----");

const weekdayLabels = computed(() => [
  t("pages.other.commons.weekdays.monday"),
  t("pages.other.commons.weekdays.tuesday"),
  t("pages.other.commons.weekdays.wednesday"),
  t("pages.other.commons.weekdays.thursday"),
  t("pages.other.commons.weekdays.friday"),
  t("pages.other.commons.weekdays.saturday"),
  t("pages.other.commons.weekdays.sunday"),
]);

const calendarData = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDayofMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let firstDayOfWeek = firstDayofMonth.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

  const daysFromPrevMonth = firstDayOfWeek - 1;

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < daysFromPrevMonth; i++) {
    const day = lastDayOfPrevMonth - daysFromPrevMonth + i + 1;
    const date = new Date(prevYear, prevMonth, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    currentWeek.push({
      day,
      date,
      isCurrentMonth: false,
      isWeekend,
      isToday: isToday(date),
      weekday: dayOfWeek === 0 ? 7 : dayOfWeek,
    });
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    currentWeek.push({
      day,
      date,
      isCurrentMonth: true,
      isWeekend,
      isToday: isToday(date),
      weekday: dayOfWeek === 0 ? 7 : dayOfWeek,
    });

    if (currentWeek.length === 7 || day === lastDayOfMonth.getDate()) {
      let nextDayCounter = 1;

      while (currentWeek.length < 7) {
        const date = new Date(nextYear, nextMonth, nextDayCounter);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        currentWeek.push({
          day: nextDayCounter,
          date,
          isCurrentMonth: false,
          isWeekend,
          isToday: isToday(date),
          weekday: dayOfWeek === 0 ? 7 : dayOfWeek,
        });

        nextDayCounter++;
      }

      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  return weeks;
});

const groupedEvents = computed(() => {
  if (events.value.length === 0) return {};

  const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

  const monthEvents = events.value.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate >= startOfMonth && eventDate <= endOfMonth;
  });

  const grouped = {};

  monthEvents.forEach((event) => {
    const eventDate = new Date(event.start);
    const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;

    if (!showWeekends.value && isWeekend) return;

    const dateString = eventDate.toDateString();

    if (!grouped[dateString]) {
      grouped[dateString] = [];
    }

    grouped[dateString].push(event);
  });

  return Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});
});

const getEventsForDay = (date) => {
  if (!date || !events.value) return [];

  return events.value.filter((event) => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });
};

const isToday = (date) => {
  if (!date) return false;

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const goToToday = () => {
  currentDate.value = new Date();
};

const toggleView = () => {
  currentView.value = currentView.value === "month" ? "list" : "month";
};

const getEventClassByStatus = (event) => {
  const now = new Date();
  const eventDate = new Date(event.start);

  if (eventDate < now) {
    return "bg-primary-100/70 text-primary-700 border-l-primary-300 hover:bg-primary-100";
  }

  return "bg-primary-200/75 text-primary-900 border-l-primary-600 hover:bg-primary-200";
};

const getEventStatusClass = (event) => {
  const now = new Date();
  const eventDate = new Date(event.start);

  if (eventDate < now) {
    return "hover:bg-background-100/70";
  }

  return "hover:bg-primary-50";
};

const getEventDotClass = (event) => {
  const now = new Date();
  const eventDate = new Date(event.start);

  if (eventDate < now) {
    return "bg-background-400";
  }

  return "bg-primary-600";
};

const modal = useModal();
const toast = useToast();

const reloadDashboardData = async () => {
  await loadBookings(true);
};

const showEventDetailsModal = (event) => {
  if (!event) {
    console.error("Evento no válido", event);
    return;
  }

  const bookingId = event.id || (event.bookingData && (event.bookingData.id || event.bookingData._id));
  const groupId = event.bookingData?.groupId;

  if (!bookingId) {
    console.error("No booking ID found in event data:", event);
    return;
  }

  modalStore.showBookingDetails({
    bookingId: bookingId,
    coverUrl: event.coverUrl,
    eventName: event.title,
    eventDescription: event.info || event.description,
    bookingInfo: event.bookingData ? event.bookingData.info : null,
    dateTime: formatTime(event.start),
    duration: event.duration,
    space: event.spaceName,
    category: event.categoryName,
    bookedBy: event.bookedByName,
    isActive: event.bookingData?.isActive !== false,
    onDeactivate: async (modalId) => {
      let actions = [
        {
          label: t("pages.other.commons.cancel"),
          type: "default",
          onClick: () => {},
        },
      ];

      if (groupId) {
        actions.push(
          {
            label: t("components.modals.bookingDetails.deactivateSingle"),
            type: "danger",
            onClick: async () => {
              await performDeactivate(bookingId, "single", modalId, event.title);
            },
          },
          {
            label: t("components.modals.bookingDetails.deactivateGroup"),
            type: "danger",
            onClick: async () => {
              await performDeactivate(bookingId, "group", modalId, event.title);
            },
          },
        );
      } else {
        actions.push({
          label: t("components.modals.bookingDetails.deactivate"),
          type: "danger",
          onClick: async () => {
            await performDeactivate(bookingId, "single", modalId, event.title);
          },
        });
      }

      modal.confirm(
        groupId
          ? t("components.modals.bookingDetails.deactivateGroupMessage")
          : t("components.modals.bookingDetails.deactivateMessage"),
        t("components.modals.bookingDetails.deactivateTitle"),
        {
          actions: actions,
        },
      );
    },
  });
};

const performDeactivate = async (id, scope, modalId, title) => {
  try {
    const response = await axios.patch(`/api/bookings/toggle`, null, {
      params: { id: id, scope: scope },
    });
    if (response.data.success) {
      toast.success(t("pages.dash.events.toasts.deactivated", { name: title }));
      modalStore.removeModal(modalId);
      await reloadDashboardData();
    }
  } catch {
    toast.error(t("pages.other.commons.errors.generic"));
  }
};

const formatMonthYear = (date) => {
  const monthIndex = date.getMonth();
  const monthKeys = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  return `${t(`pages.other.commons.months.${monthKeys[monthIndex]}`)} ${date.getFullYear()}`;
};

const formatDate = (date) => {
  return date.toLocaleDateString(locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value && currentView.value === "month") {
    currentView.value = "list";
  } else if (!isMobile.value && currentView.value === "list") {
    currentView.value = "month";
  }
};

const updateWeekendsVisibility = () => {
  const enableWeekendsValue = configStore.getConfigValue("enableWeekends");
  showWeekends.value = enableWeekendsValue === "true";
};

const isCurrentMonth = () => {
  const today = new Date();
  return currentDate.value.getMonth() === today.getMonth() && currentDate.value.getFullYear() === today.getFullYear();
};

const loadBookings = async (forceRefresh = false) => {
  isLoadingEvents.value = true;
  loadingError.value = null;

  try {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth() + 1;

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const nextMonthVar = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const startMonthStr = `${prevMonth.toString().padStart(2, "0")}/${(prevYear % 100).toString().padStart(2, "0")}`;
    const endMonthStr = `${nextMonthVar.toString().padStart(2, "0")}/${(nextYear % 100).toString().padStart(2, "0")}`;

    const today = new Date();
    const isCurrentMonth =
      currentDate.value.getMonth() === today.getMonth() && currentDate.value.getFullYear() === today.getFullYear();

    let bookings = [];
    if (
      !forceRefresh &&
      isCurrentMonth &&
      preloadedBookings.length > 0 &&
      initialData.startMonth === startMonthStr &&
      initialData.endMonth === endMonthStr
    ) {
      bookings = preloadedBookings;
    } else {
      const response = await axios.get(`/api/bookings/dashboard?startMonth=${startMonthStr}&endMonth=${endMonthStr}`);
      if (response.data.success) {
        const data = response.data.data;
        bookings = data.bookings || [];

        metrics.value = {
          totales: data.metrics.total || 0,
          hechos: data.metrics.done || 0,
          porHacer: data.metrics.todo || 0,
        };

        if (isCurrentMonth) {
          preloadedBookings.splice(0, preloadedBookings.length, ...bookings);
          initialData.startMonth = startMonthStr;
          initialData.endMonth = endMonthStr;
        }
      }
    }

    events.value = bookings.map((booking) => ({
      ...mapBookingToEvent(booking),
      duration: formatDuration(booking.eventDuration),
    }));

    updateNextBooking();
  } catch (error) {
    console.error("Error al cargar los bookings:", error);
    loadingError.value = error.message || t("pages.dash.home.errors.loadingData");
  } finally {
    isLoadingEvents.value = false;
  }
};

const updateNextBooking = () => {
  const now = new Date();

  const upcomingEvents = events.value.filter((event) => new Date(event.start) > now);

  if (upcomingEvents.length > 0) {
    upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    const nextEvent = upcomingEvents[0];
    const nextDate = new Date(nextEvent.start);

    upcomingBookingDate.value = nextDate.toLocaleDateString("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } else {
    upcomingBookingDate.value = "--/--/----";
  }
};

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

const navigateToBookingForm = (date) => {
  if (!date) return;

  const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  router.push({
    name: "dashBookingsNew",
    query: { date: adjustedDate },
  });
};

onMounted(async () => {
  window.addEventListener("resize", detectMobile);

  await configStore.loadAllConfigs();
  updateWeekendsVisibility();

  configStore.$subscribe(() => {
    updateWeekendsVisibility();
  });

  await loadBookings();
});

watch(
  () => currentDate.value,
  () => {
    loadBookings();
  },
);

onUnmounted(() => {
  window.removeEventListener("resize", detectMobile);
});
</script>

<style>
/* Same styles as before */
.shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.08),
    0 2px 4px -1px rgba(0, 0, 0, 0.04);
}

.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.calendar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.custom-calendar {
  height: 100%;
}

.today-cell {
  position: relative;
  z-index: 0;
  box-shadow: inset 0 0 0 1px var(--primary-500) !important;
  border-color: var(--primary-600) !important;
}

.dark .today-cell {
  background-color: var(--primary-500/30) !important;
  box-shadow: inset 0 0 0 1px var(--primary-400) !important;
}

.weekend {
  background-color: var(--background-100/80);
}

.min-h-\[\100px\] {
  min-height: 130px;
}

.max-h-\[110px\] {
  scrollbar-width: thin;
  scrollbar-color: var(--background-400) transparent;
}

.max-h-\[110px\]::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.max-h-\[110px\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[110px\]::-webkit-scrollbar-thumb {
  background-color: var(--background-400);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .calendar-month-view .grid-cols-7 > div,
  .calendar-month-view .grid-cols-5 > div {
    min-height: 80px;
  }
}
</style>
