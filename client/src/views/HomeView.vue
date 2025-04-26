<template>
  <div class="h-full w-full p-6 bg-gray-900 text-white">
    <h1 class="text-3xl font-bold">{{ t("pages.home.title") }}</h1>
    <p class="text-gray-400">{{ t("pages.home.description") }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-purple-400">
          <CalendarDays class="w-5 h-5" />
          <p>{{ t("pages.home.totals") }}</p>
        </div>
        <h2 class="text-2xl font-bold">{{ metrics.totales }}</h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-green-400">
          <CalendarCheck2 class="w-5 h-5" />
          <p>{{ t("pages.home.done") }}</p>
        </div>
        <h2 class="text-2xl font-bold">{{ metrics.hechos }}</h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-yellow-400">
          <Calendar1 class="w-5 h-5" />
          <p>{{ t("pages.home.upcoming") }}</p>
        </div>
        <h2 class="text-2xl font-bold">1 de Enero de 1999</h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-red-400">
          <CalendarCog class="w-5 h-5" />
          <p>{{ t("pages.home.toBeDone") }}</p>
        </div>
        <h2 class="text-2xl font-bold">{{ metrics.porHacer }}</h2>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div class="bg-gray-800 p-6 rounded-lg shadow">
        <div class="calendar-container">
          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CalendarDays, CalendarCog, CalendarCheck2, Calendar1 } from "lucide-vue-next";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import iziToast from "izitoast";
import { useI18n } from "vue-i18n";
import { ref, onMounted, watch, onUnmounted } from "vue";
import axios from "axios";

const { t } = useI18n();
const metrics = ref({ totales: 0, hechos: 0, porHacer: 0, porRealizar: 0 });

const calendarRef = ref(null);
const isMobile = ref(window.innerWidth <= 768);

const calendarOptions = ref({
  plugins: [dayGridPlugin, listPlugin],
  initialView: isMobile.value ? "listMonth" : "dayGridMonth",
  height: "100%",
  contentHeight: "auto",
  headerToolbar: {
    start: "title",
    center: "",
    end: "prev,today,next",
  },
  handleWindowResize: true,
  events: [
    { title: "Evento 1", start: "2025-04-07" },
    { title: "Evento 2", start: "2025-04-10", end: "2025-04-12" },
    { title: "Evento 3", start: "2025-04-15T14:00:00" },
    { title: "Evento 4", start: "2025-04-21", allDay: true },
  ],
  weekends: true,
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
:root {
  --fc-neutral-bg-color: hsl(216deg 31% 17% / 90%);
  --fc-list-event-hover-bg-color: #00000000;
  --fc-today-bg-color: rgb(112 184 255 / 15%);
}

.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 1);
}

.calendar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
