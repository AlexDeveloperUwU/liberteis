<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <div
        class="bg-background-100 p-8 shadow-md hover:shadow-xl rounded-lg border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <h1 class="text-3xl font-bold text-text-950 mb-6 k2d">
          {{ t("pages.auth.login.title") }}
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{ t("pages.auth.login.email") }}</label>
            <input
              type="email"
              v-model="credentials.email"
              class="w-full px-3 py-2 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950"
              required />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{ t("pages.auth.login.password") }}</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="credentials.password"
                class="w-full px-3 py-2 pr-10 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950"
                :class="{ 'border-accent-500': errors.password }"
                required />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <component :is="showPassword ? EyeOff : Eye" class="h-5 w-5 text-text-400 hover:text-text-600" />
              </button>
            </div>
            <p v-if="errors.password" class="text-sm text-accent-600">{{ errors.password }}</p>
          </div>

          <button
            type="submit"
            class="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-2 rounded-lg transition-colors font-medium cursor-pointer">
            {{ t("pages.auth.login.submit") }}
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
import { Eye, EyeOff } from "lucide-vue-next";
import iziToast from "izitoast";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
  email: "",
  password: "",
});
const showPassword = ref(false);
const errors = ref({
  email: "",
  password: "",
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.value.email = t("pages.auth.login.errors.emailRequired");
    return false;
  }
  if (!emailRegex.test(email)) {
    errors.value.email = t("pages.auth.login.errors.emailInvalid");
    return false;
  }
  errors.value.email = "";
  return true;
};

const validatePassword = (password) => {
  if (!password) {
    errors.value.password = t("pages.auth.login.errors.passwordRequired");
    return false;
  }
  errors.value.password = "";
  return true;
};

const handleLogin = async () => {
  if (!validateEmail(credentials.value.email) || !validatePassword(credentials.value.password)) {
    return;
  }
  try {
    const success = await authStore.login(credentials.value.email, credentials.value.password);
    if (success) {
      iziToast.success({
        title: t("pages.auth.login.successTitle"),
        message: t("pages.auth.login.successMessage"),
        position: "topRight",
      });
      await router.push("/dash/");
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    iziToast.error({
      title: t("pages.auth.login.errorTitle"),
      message: t("pages.auth.login.errorMessage"),
      position: "topRight",
    });
  }
};
</script>

<style>
.shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.08),
    0 2px 4px -1px rgba(0, 0, 0, 0.04);
}

.shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
