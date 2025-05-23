<template>
  <div class="h-full w-full p-6">
    <h1 class="text-3xl font-bold text-text-950 mb-2 k2d">{{ t("pages.home.title") }}</h1>
    <p class="text-text-800 mb-6">{{ t("pages.home.description") }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-300 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarDays class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.home.totals") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.totales }}</h2>
      </div>

      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-300 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarCheck2 class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.home.done") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.hechos }}</h2>
      </div>

      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-300 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <Calendar1 class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.home.upcoming") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">01/01/1999</h2>
      </div>

      <div class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-300 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <CalendarCog class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.home.toBeDone") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.porHacer }}</h2>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <div class="calendar-container">
          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CalendarDays, CalendarCog, CalendarCheck2, Calendar1, Expand } from "lucide-vue-next";

import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import esLang from "../locales/es/fullcalendar/es";
import glLang from "../locales/gl/fullcalendar/gl";
import enLang from "../locales/en/fullcalendar/en";
import luxonPlugin from "@fullcalendar/luxon3";
import { useI18n } from "vue-i18n";
import { ref, onMounted, watch, onUnmounted } from "vue";
import axios from "axios";

const { t, locale } = useI18n();
const metrics = ref({ totales: 0, hechos: 0, porHacer: 0, porRealizar: 0 });

const calendarRef = ref(null);
const isMobile = ref(window.innerWidth <= 768);

const langMap = {
  es: esLang,
  gl: glLang,
  en: enLang,
};

const calendarOptions = ref({
  plugins: [dayGridPlugin, listPlugin, luxonPlugin],
  initialView: isMobile.value ? "listMonth" : "dayGridMonth",
  expandRows: true,
  height: "100%",
  contentHeight: "auto",
  headerToolbar: {
    start: "title",
    center: "",
    end: "prev,today,next",
  },
  handleWindowResize: true,
  locale: langMap[locale.value] || glLang,
  events: [
    { title: "Evento 1", start: "2025-05-07T10:00:00" },
    { title: "Evento 2", start: "2025-05-10T14:30:00" },
    { title: "Evento 3", start: "2025-05-15T09:15:00" },
    { title: "Evento 4", start: "2025-05-21T16:45:00" },
    { title: "Evento 5", start: "2025-05-25T11:00:00" },
    { title: "Evento 6", start: "2025-05-02T08:00:00" },
    { title: "Evento 7", start: "2025-05-03T13:00:00" },
    { title: "Evento 8", start: "2025-05-05T15:30:00" },
    { title: "Evento 9", start: "2025-05-08T12:00:00" },
    { title: "Evento 10", start: "2025-05-12T17:00:00" },
    { title: "Evento 11", start: "2025-05-14T10:30:00" },
    { title: "Evento 12", start: "2025-05-18T09:00:00" },
    { title: "Evento 13", start: "2025-05-20T18:00:00" },
    { title: "Evento 14", start: "2025-05-22T14:00:00" },
    { title: "Evento 15", start: "2025-05-24T11:30:00" },
    { title: "Evento 16", start: "2025-05-26T16:00:00" },
    { title: "Evento 17", start: "2025-05-28T08:30:00" },
    { title: "Evento 18", start: "2025-05-30T13:45:00" },
  ],
  weekends: true,
  expandRows: true,
});

watch(locale, (newLocale) => {
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.setOption("locale", langMap[newLocale] || glLang);
  }
});

const updateCalendarView = () => {
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    const newView = isMobile.value ? "listMonth" : "dayGridMonth";
    calendarApi.changeView(newView);
  }
};

watch(isMobile, updateCalendarView);

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const forceCalendarRerender = () => {
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.render();
  }
};

onMounted(async () => {
  window.addEventListener("resize", detectMobile);
  window.addEventListener("sidebar-toggled", forceCalendarRerender);

  try {
    const response = await axios.get("/api/bookings/count");
    if (response.data.code === 200) {
      metrics.value = response.data.data;
    } else {
      console.error("Unexpected response code:", response.data.code);
    }
  } catch (error) {
    console.error("Error fetching metrics:", error.message || error);
  }

  try {
    const configResponse = await axios.get("/api/config/", { params: { key: "enableWeekends" } });
    const parsedData = {
      ...configResponse.data.data,
      value: Number(configResponse.data.data.value) === 1,
    };
    calendarOptions.value.weekends = parsedData.value;
  } catch (error) {
    console.error("Error fetching config:", error.message || error);
  }
});

onUnmounted(() => {
  window.removeEventListener("sidebar-toggled", forceCalendarRerender);
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

.fc {
  color: var(--text-800);
  background-color: var(--background-50);
}

.fc .fc-toolbar-title {
  color: var(--text-900);
  font-weight: bold;
}

.fc .fc-button-primary {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
  color: var(--text-950);
}

.fc .fc-button-primary:hover {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

.fc .fc-button-primary:disabled {
  color: var(--text-950);
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

.fc .fc-scrollgrid {
  border: none !important;
}

.fc .fc-scrollgrid-section-header table,
.fc .fc-scrollgrid-section-body table,
.fc .fc-scrollgrid-section-footer table {
  border: 0;
}

.fc td,
.fc th {
  border-color: var(--background-300);
}

.fc .fc-divider {
  background-color: var(--background-300);
  border-color: var(--background-300);
}

.fc .fc-daygrid-day.fc-day-today {
  background-color: rgba(var(--accent-200), 0.15);
}

.fc .fc-event {
  border-color: var(--primary-500);
  color: var(--text-950);
}

.fc .fc-event:hover {
  background-color: var(--background-300);
}

.fc .fc-event-selected {
  box-shadow: 0 0 0 2px var(--primary-300);
}

.fc .fc-more-link {
  background-color: var(--background-300);
  color: var(--text-700);
}

.fc .fc-non-business {
  background-color: var(--background-200);
  opacity: 0.3;
}

.fc .fc-timegrid-now-indicator-line {
  background-color: var(--accent-500);
  border-color: var(--accent-500);
}

.fc .fc-timegrid-now-indicator-arrow {
  border-color: var(--accent-500);
  color: var(--accent-500);
}

.fc .fc-bg-event {
  background-color: var(--secondary-400);
  opacity: 0.3;
}

.fc .fc-list-day-cushion {
  background-color: var(--background-200);
}

.fc .fc-list-event:hover td {
  background-color: var(--primary-100);
}

.fc .fc-list-table th {
  background-color: var(--background-200);
  color: var(--text-800);
}

.fc .fc-daygrid-day-number {
  color: var(--text-800);
}

.dark .fc {
  color: var(--text-700);
  background-color: var(--background-100);
}

.dark .fc td,
.dark .fc th {
  border-color: var(--background-400);
}
</style>
