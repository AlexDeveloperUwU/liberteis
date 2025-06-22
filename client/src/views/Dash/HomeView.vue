<template>
  <div class="h-full w-full p-6">
    <h1 class="text-3xl font-bold text-text-950 mb-2 k2d">{{ t("pages.dash.home.page.title") }}</h1>
    <p class="text-text-800 mb-6">{{ t("pages.dash.home.page.description") }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarDays class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.totals") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.totales || 0 }}</h2>
      </div>
      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarCheck2 class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.done") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.hechos || 0 }}</h2>
      </div>
      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarCog class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.toBeDone") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.porHacer || 0 }}</h2>
      </div>
      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <Calendar1 class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.upcoming") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ upcomingBookingDate }}</h2>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <div class="calendar-container">
          <div class="custom-calendar">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-background-400">
              <div class="flex items-center mb-4 sm:mb-0">
                <div class="p-2 bg-primary-100 rounded-lg border border-primary-500 mr-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
                  <Calendar class="w-5 h-5 text-primary-600" />
                </div>
                <h2 class="text-xl font-bold text-text-900 k2d">
                  {{ formatMonthYear(currentDate) }}
                </h2>
              </div>
              <div class="flex items-center space-x-2">
                <button @click="previousMonth" class="h-10 w-10 p-0 rounded-lg border transition-colors duration-150 flex items-center justify-center bg-background-200 border-primary-400 hover:border-primary-500 hover:bg-background-300 text-primary-700 shadow-sm cursor-pointer">
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <button @click="goToToday" :class="[
                  'h-10 px-4 rounded-lg text-sm font-medium shadow-sm border transition-colors duration-150 flex items-center justify-center cursor-pointer',
                  isCurrentMonth()
                    ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200'
                    : 'bg-primary-400 hover:bg-primary-500 text-white border-primary-600',
                ]" style="min-width: 2.5rem">
                  {{ t("pages.dash.home.calendar.today") }}
                </button>
                <button @click="nextMonth" class="h-10 w-10 p-0 rounded-lg border transition-colors duration-150 flex items-center justify-center bg-background-200 border-primary-400 hover:border-primary-500 hover:bg-background-300 text-primary-700 shadow-sm cursor-pointer">
                  <ChevronRight class="w-5 h-5" />
                </button>
                <div class="ml-2">
                  <button @click="toggleView" class="h-10 w-10 p-0 rounded-lg border transition-colors duration-150 flex items-center justify-center bg-background-200 border-primary-400 hover:border-primary-500 hover:bg-background-300 text-primary-700 shadow-sm" :class="{ 'bg-background-300': currentView === 'list' }">
                    <component :is="currentView === 'month' ? List : Calendar" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div v-if="currentView === 'month'" class="calendar-month-view border border-background-300 rounded-lg overflow-hidden shadow-sm">
              <div class="grid" :class="[showWeekends ? 'grid-cols-7' : 'grid-cols-5']">
                <template v-for="(day, index) in weekdayLabels" :key="index">
                  <div v-if="showWeekends || (index !== 5 && index !== 6)" class="py-3 text-center font-bold text-sm bg-background-200 text-text-800 border-b border-background-300">
                    {{ day }}
                  </div>
                </template>
              </div>

              <div class="grid" :class="[showWeekends ? 'grid-cols-7' : 'grid-cols-5']">
                <template v-for="(week, weekIndex) in calendarData" :key="`week-${weekIndex}`">
                  <template v-for="(day, dayIndex) in week" :key="`day-${weekIndex}-${dayIndex}`">
                    <div v-if="showWeekends || !day.isWeekend" @click="navigateToBookingForm(day.date)" :class="[
                      'min-h-[100px] p-2 relative border border-background-200 cursor-pointer hover:bg-background-100/80 transition-colors',
                      day.isCurrentMonth ? 'bg-background-50 text-text-800' : 'bg-background-100/60 text-text-500',
                      day.isToday ? 'today-cell' : '',
                      day.isWeekend ? 'weekend' : '',
                    ]">
                      <div v-if="day.day !== 0" class="flex justify-between items-center mb-1 relative z-1">
                        <div :class="[
                          'flex justify-center items-center h-7 w-7 rounded-full font-medium text-sm',
                          day.isToday ? 'bg-primary-500 text-white font-bold shadow' : '',
                        ]">
                          {{ day.day }}
                        </div>
                      </div>

                      <div v-if="day.day !== 0" class="space-y-1 overflow-y-auto max-h-[110px] relative z-1">
                        <div v-for="event in getEventsForDay(day.date)" :key="event.id" @click.stop="showEventDetailsModal(event)" :data-booking-id="event.id || (event.bookingData && (event.bookingData.id || event.bookingData._id))" class="py-1 px-2 rounded-lg cursor-pointer flex items-center font-semibold text-xs border-l-4 shadow-sm transition-all duration-150 hover:shadow-md" :class="getEventClassByStatus(event)">
                          <div class="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0" :class="getEventDotClass(event)"></div>
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
                  <div class="px-4 py-3 flex items-center border-b border-background-300" :class="isToday(new Date(date)) ? 'bg-primary-300' : 'bg-background-200'">
                    <div :class="[
                      'h-8 w-8 rounded-full flex items-center justify-center mr-3 border',
                      isToday(new Date(date))
                        ? 'bg-primary-200 text-primary-700 border-white'
                        : 'bg-background-50 border-background-300 text-primary-700',
                    ]">
                      <span class="font-medium" :class="isToday(new Date(date)) ? 'text-primary-700' : 'text-primary-700'">
                        {{ new Date(date).getDate() }}
                      </span>
                    </div>
                    <span class="font-medium" :class="isToday(new Date(date)) ? 'text-text-900' : 'text-text-900'">
                      {{ formatDate(new Date(date)) }}
                    </span>
                  </div>

                  <div v-if="group.length === 0" class="p-4 text-text-600 italic text-sm flex items-center justify-center">
                    <Calendar1 class="w-4 h-4 mr-2 text-primary-600" />
                    {{ t("pages.dash.home.calendar.noEvents") }}
                  </div>
                  <div v-else class="divide-y divide-background-100">
                    <div v-for="event in group" :key="event.id" @click="showEventDetailsModal(event)" :data-booking-id="event.id || (event.bookingData && (event.bookingData.id || event.bookingData._id))" class="p-4 transition-colors duration-150 cursor-pointer group" :class="getEventStatusClass(event)">
                      <div class="flex items-start">
                        <div class="h-3 w-3 rounded-full mt-1.5 mr-3 flex-shrink-0" :class="getEventDotClass(event)"></div>
                        <div class="flex-grow">
                          <div class="font-medium text-text-900 group-hover:text-primary-900">{{ event.title }}</div>
                          <div class="text-sm text-text-600 mt-1 flex items-center group-hover:text-primary-900">
                            <Clock class="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                            {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
                          </div>
                          <div v-if="event.description" class="text-sm text-text-700 mt-1.5 line-clamp-2 group-hover:text-primary-900">
                            {{ event.description }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="Object.keys(groupedEvents).length === 0" class="p-8 text-center text-text-600 bg-background-50">
                  <div class="flex flex-col items-center">
                    <CalendarX class="w-12 h-12 text-primary-600 mb-3" />
                    <p class="font-medium">{{ t("pages.dash.home.calendar.noEventsMonth") }}</p>
                    <p class="text-sm mt-1 text-text-500">{{ t("pages.dash.home.calendar.tryAnotherMonth") }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  CalendarDays,
  CalendarCog,
  CalendarCheck2,
  Calendar1,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Clock,
  X,
  CalendarX,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRoute } from "vue-router";
import { useModalStore } from "@/stores/modalStore";
import axios from "axios";
import { useRouter } from "vue-router";

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
  errorMessage: ""
};
const metrics = ref(initialData.metrics || {});
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
  loadBookings();
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  loadBookings();
};

const goToToday = () => {
  currentDate.value = new Date();
  loadBookings();
};

const toggleView = () => {
  currentView.value = currentView.value === "month" ? "list" : "month";
};

const getEventClassByStatus = (event) => {
  const now = new Date();
  const eventDate = new Date(event.start);

  if (eventDate < now) {
    return 'bg-primary-100/70 text-primary-700 border-l-primary-300 hover:bg-primary-100';
  }

  return 'bg-primary-200/75 text-primary-900 border-l-primary-600 hover:bg-primary-200';
};

const getEventStatusClass = (event) => {
  const now = new Date();
  const eventDate = new Date(event.start);

  if (eventDate < now) {
    return 'hover:bg-background-100/70';
  }

  return 'hover:bg-primary-50';
};

const getEventDotClass = (event) => {
  const now = new Date();
  const eventDate = new Date(event.start);

  if (eventDate < now) {
    return 'bg-background-400';
  }

  return 'bg-primary-600';
};

const showEventDetailsModal = (event) => {
  if (!event) {
    console.error("Evento no válido", event);
    return;
  }

  // Ajustar para manejar tanto id como _id en el bookingData
  const bookingId = event.id ||
    (event.bookingData && (event.bookingData.id || event.bookingData._id));

  console.log("Evento completo:", event);
  console.log("Booking data:", event.bookingData);
  console.log("Opening modal with bookingId:", bookingId);

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
    bookedBy: event.bookedByName
  });
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

const loadBookings = async () => {
  isLoadingEvents.value = true;
  loadingError.value = null;

  try {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth() + 1;

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const startMonthStr = `${prevMonth.toString().padStart(2, '0')}/${(prevYear % 100).toString().padStart(2, '0')}`;
    const endMonthStr = `${nextMonth.toString().padStart(2, '0')}/${(nextYear % 100).toString().padStart(2, '0')}`;

    const today = new Date();
    const isCurrentMonth = currentDate.value.getMonth() === today.getMonth() &&
      currentDate.value.getFullYear() === today.getFullYear();

    let bookings = [];
    if (isCurrentMonth && preloadedBookings.length > 0 &&
      initialData.startMonth === startMonthStr &&
      initialData.endMonth === endMonthStr) {
      bookings = preloadedBookings;
    } else {
      const response = await axios.get(
        `/api/bookings?startMonth=${startMonthStr}&endMonth=${endMonthStr}`
      );
      if (response.data.success) {
        bookings = response.data.data;
        console.log("Bookings cargados:", bookings);
      }
    }

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

          const bookingDate = new Date(booking.bookingDate);
          const endDate = new Date(bookingDate);
          endDate.setMinutes(endDate.getMinutes() + (event.duration || 60));

          calendarEvents.push({
            id: booking.id || booking._id,
            title: event.title,
            start: bookingDate,
            end: endDate,
            description: event.info,
            info: event.info,
            coverUrl: event.coverUrl,
            bookingData: booking,
            spaceName: space.name,
            categoryName: categoryName,
            bookedByName: user.name,
            duration: durationStr,
          });
        }
      } catch (error) {
        console.error(`Error al obtener detalles para booking ${booking._id}:`, error);
      }
    }

    events.value = calendarEvents;
    console.log("Eventos cargados:", events.value);

    await updateMetrics();
    updateNextBooking();
  } catch (error) {
    console.error("Error al cargar los bookings:", error);
    loadingError.value = error.message || "Error al cargar los datos";
  } finally {
    isLoadingEvents.value = false;
  }
};

const updateMetrics = async () => {
  try {
    const response = await axios.get('/api/bookings/count');

    if (response.data.success) {
      metrics.value = {
        totales: response.data.data.total || 0,
        hechos: response.data.data.past || 0,
        porHacer: response.data.data.upcoming || 0
      };
    }
  } catch (error) {
    console.error("Error al cargar métricas:", error);
  }
};

const updateNextBooking = () => {
  const now = new Date();

  const upcomingEvents = events.value.filter(event => new Date(event.start) > now);

  if (upcomingEvents.length > 0) {
    upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    const nextEvent = upcomingEvents[0];
    const nextDate = new Date(nextEvent.start);

    upcomingBookingDate.value = nextDate.toLocaleDateString(locale.value, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
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

  const formattedDate = date.toISOString().split('T')[0];
  router.push({
    name: 'dashBookingsNew',
    query: { date: formattedDate }
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

watch(() => currentDate.value, (newValue) => {
  loadBookings();
});

onUnmounted(() => {
  window.removeEventListener("resize", detectMobile);
});
</script>

<style>
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

  .calendar-month-view .grid-cols-7>div,
  .calendar-month-view .grid-cols-5>div {
    min-height: 80px;
  }
}
</style>