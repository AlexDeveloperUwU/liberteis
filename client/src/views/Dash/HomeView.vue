<template>
  <div class="h-full w-full p-6">
    <h1 class="text-3xl font-bold text-text-950 mb-2 k2d">{{ t("pages.dash.home.page.title") }}</h1>
    <p class="text-text-800 mb-6">{{ t("pages.dash.home.page.description") }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <!-- Métricas: Unificación de colores -->
      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarDays class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.totals") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.totales }}</h2>
      </div>
      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarCheck2 class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.done") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.hechos }}</h2>
      </div>
      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarCog class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.toBeDone") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.porHacer }}</h2>
      </div>
      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <Calendar1 class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.home.metrics.upcoming") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">01/01/1999</h2>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div
        class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <div class="calendar-container">
          <!-- Calendario -->
          <div class="custom-calendar">
            <!-- Cabecera del Calendario -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-background-400">
              <div class="flex items-center mb-4 sm:mb-0">
                <div class="p-2 bg-primary-100 rounded-lg border border-primary-500 mr-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
                  <Calendar class="w-5 h-5 text-primary-600" />
                </div>
                <h2 class="text-xl font-bold text-text-900 k2d">
                  {{ formatMonthYear(currentDate) }}
                </h2>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="previousMonth"
                  class="h-10 w-10 p-0 rounded-lg border transition-colors duration-150 flex items-center justify-center bg-background-200 border-primary-400 hover:border-primary-500 hover:bg-background-300 text-primary-700 shadow-sm">
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <button
                  @click="goToToday"
                  :class="[
                    'h-10 px-4 rounded-lg text-sm font-medium shadow-sm border transition-colors duration-150 flex items-center justify-center',
                    isCurrentMonth()
                      ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200'
                      : 'bg-primary-400 hover:bg-primary-500 text-white border-primary-600',
                  ]"
                  style="min-width: 2.5rem">
                  {{ t("pages.dash.home.calendar.today") }}
                </button>
                <button
                  @click="nextMonth"
                  class="h-10 w-10 p-0 rounded-lg border transition-colors duration-150 flex items-center justify-center bg-background-200 border-primary-400 hover:border-primary-500 hover:bg-background-300 text-primary-700 shadow-sm">
                  <ChevronRight class="w-5 h-5" />
                </button>
                <div class="ml-2">
                  <button
                    @click="toggleView"
                    class="h-10 w-10 p-0 rounded-lg border transition-colors duration-150 flex items-center justify-center bg-background-200 border-primary-400 hover:border-primary-500 hover:bg-background-300 text-primary-700 shadow-sm"
                    :class="{ 'bg-background-300': currentView === 'list' }">
                    <component :is="currentView === 'month' ? List : Calendar" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Vista del Calendario (Mensual o Lista) -->
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
                      :class="[
                        'min-h-[100px] p-2 relative border border-background-200',
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
                          @click="showEventDetails(event)"
                          class="py-1 px-2 rounded-lg cursor-pointer flex items-center font-semibold text-xs bg-primary-200/75 text-primary-900 border-l-4 border-l-primary-600 shadow-sm transition-all duration-150 hover:bg-primary-200 hover:shadow-md"
                          style="box-shadow: 0 2px 8px 0 rgba(80, 120, 200, 0.07)">
                          <div class="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0 bg-primary-600"></div>
                          <span class="truncate">{{ event.title }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </template>
              </div>
            </div>

            <!-- Vista de Lista -->
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
                      @click="showEventDetails(event)"
                      class="p-4 transition-colors duration-150 cursor-pointer group"
                      :class="'hover:bg-primary-50'">
                      <div class="flex items-start">
                        <div class="h-3 w-3 rounded-full mt-1.5 mr-3 flex-shrink-0 bg-primary-600"></div>
                        <div class="flex-grow">
                          <div class="font-medium text-text-900 group-hover:text-primary-900">{{ event.title }}</div>
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
                    <p class="font-medium">{{ t("pages.dash.home.calendar.noEventsMonth") }}</p>
                    <p class="text-sm mt-1 text-text-500">{{ t("pages.dash.home.calendar.tryAnotherMonth") }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedEvent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div class="bg-background-50 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-background-300">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-lg font-bold text-text-900">{{ selectedEvent.title }}</h3>
                  <button @click="selectedEvent = null" class="text-text-500 hover:text-text-800">
                    <X class="w-5 h-5" />
                  </button>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center text-text-700">
                    <CalendarDays class="w-5 h-5 mr-2 text-primary-500" />
                    <span>{{ formatDate(new Date(selectedEvent.start)) }}</span>
                  </div>
                  <div class="flex items-center text-text-700">
                    <Clock class="w-5 h-5 mr-2 text-primary-500" />
                    <span>{{ formatTime(selectedEvent.start) }} - {{ formatTime(selectedEvent.end) }}</span>
                  </div>
                  <div v-if="selectedEvent.description" class="border-t border-background-200 pt-4">
                    <p class="text-text-700">{{ selectedEvent.description }}</p>
                  </div>
                  <div class="flex justify-end pt-2">
                    <button
                      @click="selectedEvent = null"
                      class="px-4 py-2 bg-background-200 text-text-800 rounded hover:bg-background-300 transition-colors">
                      {{ t("pages.dash.home.calendar.close") }}
                    </button>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRoute } from "vue-router";
import calendarize from "calendarize";

const route = useRoute();
const { t, locale } = useI18n();
const configStore = useConfigStore();

const initialData = route.meta.initialData || { metrics: {}, events: [] };
const metrics = ref(initialData.metrics);
const events = ref([
  {
    id: 1,
    title: "Reunión importante",
    start: new Date(),
    end: new Date(),
    color: "var(--primary-500)",
    description: "Reunión sobre proyectos actuales",
  },
  {
    id: 2,
    title: "Entrega de documento",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: "var(--secondary-500)",
    description: "Entregar documentación final",
  },
  {
    id: 3,
    title: "Entrega de documento",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: "var(--secondary-500)",
    description: "Entregar documentación final",
  },
  {
    id: 4,
    title: "Entrega de documento",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: "var(--secondary-500)",
    description: "Entregar documentación final",
  },
  ...[5, 8, 12, 15, 18, 22, 25].map((day) => {
    const date = new Date();
    date.setDate(day);
    return {
      id: `event-${day}`,
      title: `Evento del día ${day}`,
      start: new Date(date),
      end: new Date(date),
      color: ["var(--primary-500)", "var(--secondary-500)", "var(--accent-500)"][Math.floor(Math.random() * 3)],
    };
  }),
]);

const isMobile = ref(window.innerWidth <= 768);
const currentDate = ref(new Date());
const currentView = ref(isMobile.value ? "list" : "month");
const showWeekends = ref(false);
const selectedEvent = ref(null);

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

  const calendar = calendarize(new Date(year, month), 1);

  const processedCalendar = calendar.map((week, weekIndex) =>
    week.map((day, dayIndex) => {
      if (day === 0) {
        let actualDate;
        if (weekIndex === 0) {
          const prevMonth = month === 0 ? 11 : month - 1;
          const prevYear = month === 0 ? year - 1 : year;
          const lastDayPrevMonth = new Date(prevYear, month, 0).getDate();
          const firstDayCurrentMonth = new Date(year, month, 1).getDay() || 7;
          const dayOfPrevMonth = lastDayPrevMonth - (firstDayCurrentMonth - dayIndex - 1);
          actualDate = new Date(prevYear, prevMonth, dayOfPrevMonth);
        } else {
          const nextMonth = month === 11 ? 0 : month + 1;
          const nextYear = month === 11 ? year + 1 : year;
          const dayOfNextMonth = dayIndex + 1 - ((7 - new Date(year, month + 1, 0).getDay() || 7) % 7);
          actualDate = new Date(nextYear, nextMonth, dayOfNextMonth);
        }

        const actualDayOfWeek = actualDate.getDay();
        const isWeekend = actualDayOfWeek === 0 || actualDayOfWeek === 6;

        return {
          day: actualDate.getDate(),
          date: actualDate,
          isCurrentMonth: false,
          isWeekend: isWeekend,
          isToday: isToday(actualDate),
          weekday: actualDayOfWeek,
        };
      }

      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      return {
        day,
        date,
        isCurrentMonth: true,
        isWeekend,
        isToday: isToday(date),
        weekday: dayOfWeek,
      };
    }),
  );

  return processedCalendar;
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

const showEventDetails = (event) => {
  selectedEvent.value = event;
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

onMounted(async () => {
  window.addEventListener("resize", detectMobile);

  await configStore.loadAllConfigs();
  updateWeekendsVisibility();

  configStore.$subscribe(() => {
    updateWeekendsVisibility();
  });
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
  .calendar-month-view .grid-cols-7 > div,
  .calendar-month-view .grid-cols-5 > div {
    font-size: 0.75rem;
  }

  .calendar-month-view .grid-cols-7 > div,
  .calendar-month-view .grid-cols-5 > div {
    min-height: 80px;
  }
}
</style>
