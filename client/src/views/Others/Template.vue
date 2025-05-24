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
import { CalendarDays, CalendarCog, CalendarCheck2, Calendar1 } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
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
</style>
