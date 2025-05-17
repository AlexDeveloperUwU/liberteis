<template>
  <div class="h-full w-full p-6 flex items-center justify-center">
    <div class="w-full max-w-md">
      <div
        class="bg-background-100 dark:bg-background-200 p-8 shadow-2xl rounded-lg border border-background-300 dark:border-background-400">
        <h1 class="text-3xl font-bold text-center mb-6 text-text-950">
          {{ t("pages.login.title") }}
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{
              t("pages.login.email")
            }}</label>
            <input
              type="email"
              v-model="credentials.email"
              class="w-full px-3 py-2 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950 shadow-sm"
              required />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{
              t("pages.login.password")
            }}</label>
            <input
              type="password"
              v-model="credentials.password"
              class="w-full px-3 py-2 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950 shadow-sm"
              required />
          </div>

          <button
            type="submit"
            class="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-2 rounded-lg transition-colors font-medium">
            {{ t("pages.login.submit") }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/authStore";
import iziToast from "izitoast";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
  email: "",
  password: "",
});

const handleLogin = async () => {
  try {
    const success = await authStore.login(credentials.value.email, credentials.value.password);
    if (success) {
      iziToast.success({
        title: t("pages.login.successTitle"),
        message: t("pages.login.successMessage"),
        position: "topRight",
      });
      const redirectPath = router.currentRoute.value.query.redirect || "/";
      await router.push(redirectPath);
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    iziToast.error({
      title: t("pages.login.errorTitle"),
      message: t("pages.login.errorMessage"),
      position: "topRight",
    });
  }
};
</script>

<style>
.shadow-lg {
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
