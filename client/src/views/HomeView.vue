<template>
  <div class="h-full w-full p-6 bg-gray-900 text-white">
    <!-- Título -->
    <h1 class="text-3xl font-bold">{{ t("pages.home.title") }}</h1>
    <p class="text-gray-400">{{ t("pages.home.description") }}</p>

    <!-- Tarjetas de métricas -->
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
        <h2 class="text-2xl font-bold"></h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-red-400">
          <CalendarCog class="w-5 h-5" />
          <p>{{ t("pages.home.toBeDone") }}</p>
        </div>
        <h2 class="text-2xl font-bold">{{ metrics.porHacer }}</h2>
      </div>
    </div>

    <!-- Gráficos Placeholder -->
    <div class="gap-6 mt-6">
      <div class="bg-gray-800 p-6 rounded-lg shadow">
        <div class="calendar-container">
          <FullCalendar :options="calendarOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CalendarDays, CalendarCog, CalendarCheck2, Calendar1 } from "lucide-vue-next";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";
import axios from "axios";

const { t } = useI18n();
const metrics = ref({ totales: 0, hechos: 0, porHacer: 0, porRealizar: 0 });

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  height: "100%",
  contentHeight: "auto",
});

onMounted(async () => {
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
});
</script>

<style scoped>
.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

.calendar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
