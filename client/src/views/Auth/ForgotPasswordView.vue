<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <div
        class="bg-background-100 p-8 shadow-md hover:shadow-xl rounded-lg border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <h1 class="text-3xl font-bold text-text-950 mb-6 k2d">
          {{ t("pages.auth.forgotPassword.title") }}
        </h1>

        <template v-if="!submitted">
          <p class="text-sm text-text-700 mb-6">{{ t("pages.auth.forgotPassword.description") }}</p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-text-800">{{ t("pages.auth.forgotPassword.email") }}</label>
              <input
                type="email"
                v-model="email"
                class="w-full px-3 py-2 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950"
                :class="{ 'border-accent-500': error }"
                required />
              <p v-if="error" class="text-sm text-accent-600">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-2 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              {{ t("pages.auth.forgotPassword.submit") }}
            </button>

            <router-link
              :to="{ name: 'authLogin' }"
              class="block text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
              {{ t("pages.auth.forgotPassword.backToLogin") }}
            </router-link>
          </form>
        </template>

        <template v-else>
          <p class="text-sm text-text-700 mb-6">{{ t("pages.auth.forgotPassword.sentMessage") }}</p>
          <router-link
            :to="{ name: 'authLogin' }"
            class="block text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
            {{ t("pages.auth.forgotPassword.backToLogin") }}
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/authStore";

const { t } = useI18n();
const authStore = useAuthStore();

const email = ref("");
const error = ref("");
const submitting = ref(false);
const submitted = ref(false);

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value) {
    error.value = t("pages.auth.forgotPassword.errors.emailRequired");
    return false;
  }
  if (!emailRegex.test(email.value)) {
    error.value = t("pages.auth.forgotPassword.errors.emailInvalid");
    return false;
  }
  error.value = "";
  return true;
};

const handleSubmit = async () => {
  if (!validateEmail()) return;

  submitting.value = true;
  try {
    // Always show the "sent" state on a successful request, regardless of whether the
    // address is registered, so this can never be used to check which emails have an account.
    await authStore.requestPasswordReset(email.value);
    submitted.value = true;
  } finally {
    submitting.value = false;
  }
};
</script>
