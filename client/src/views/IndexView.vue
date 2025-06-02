<template>
  <div class="min-h-screen w-full p-8 flex items-center justify-center">
    <div class="max-w-7xl w-full">
      <div class="text-center mb-16">
        <h2 class="text-5xl font-bold text-text-950 mb-6 k2d">
          {{ t("pages.other.index.welcome") }} {{ configStore.getConfigValue("appName", "EvenTeis") }}
        </h2>
        <p class="text-2xl text-text-700 mb-10">{{ t("pages.other.index.description") }}</p>
      </div>

      <div
        class="bg-background-100 p-12 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <h3 class="text-3xl font-semibold text-text-950 mb-10 text-center">
          {{ t("pages.other.index.selectUserType") }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div
            @click="selectUserType('teacher')"
            class="bg-background-100 p-8 rounded-lg border-[1.5px] border-background-300 hover:border-primary-300 hover:shadow-xl transition-all duration-200 cursor-pointer group"
            :class="{ 'border-primary-500 bg-primary-50': selectedUserType === 'teacher' }">
            <div class="flex flex-col items-center text-center">
              <GraduationCap
                class="w-16 h-16 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-200" />
              <h4 class="text-2xl font-semibold text-text-950 mb-3">{{ t("pages.other.index.teacher") }}</h4>
              <p class="text-lg text-text-700">{{ t("pages.other.index.teacherDescription") }}</p>
            </div>
          </div>

          <div
            @click="selectUserType('student')"
            class="bg-background-100 p-8 rounded-lg border-[1.5px] border-background-300 hover:border-primary-300 hover:shadow-xl transition-all duration-200 cursor-pointer group"
            :class="{ 'border-primary-500 bg-primary-50': selectedUserType === 'student' }">
            <div class="flex flex-col items-center text-center">
              <BookOpen
                class="w-16 h-16 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-200" />
              <h4 class="text-2xl font-semibold text-text-950 mb-3">{{ t("pages.other.index.student") }}</h4>
              <p class="text-lg text-text-700">{{ t("pages.other.index.studentDescription") }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { GraduationCap, BookOpen } from "lucide-vue-next";
import { useConfigStore } from "@/stores/configStore";

const { t } = useI18n();
const router = useRouter();
const configStore = useConfigStore();

const selectedUserType = ref(null);

const selectUserType = (type) => {
  selectedUserType.value = type;

  setTimeout(() => {
    if (type === "student") {
      router.push("/info/planning");
    } else if (type === "teacher") {
      router.push("/dash/");
    }
  }, 400);
};
</script>

<style>
.k2d {
  font-family: "K2D", sans-serif;
}

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
