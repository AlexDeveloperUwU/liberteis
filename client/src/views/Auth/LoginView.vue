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
            <div class="relative">
              <input
                type="email"
                v-model="credentials.email"
                @blur="validateEmail(credentials.email)"
                @input="clearEmailError"
                class="w-full px-3 py-2 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950 transition-colors"
                :class="{ 'border-accent-500 ring-accent-500': errors.email }"
                required />
              <CheckCircle2
                v-if="credentials.email && !errors.email"
                class="absolute inset-y-0 right-3 w-5 h-5 text-primary-500 my-auto" />
            </div>
            <p v-if="errors.email" class="text-sm text-accent-600">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{ t("pages.auth.login.password") }}</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="credentials.password"
                @blur="validatePassword(credentials.password)"
                @input="clearPasswordError"
                class="w-full px-3 py-2 pr-10 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950 transition-colors"
                :class="{ 'border-accent-500 ring-accent-500': errors.password }"
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

          <router-link
            :to="{ name: 'authForgotPassword' }"
            class="block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors">
            {{ t("pages.auth.login.forgotPassword") }}
          </router-link>

          <button
            type="submit"
            :disabled="loading || !credentials.email || !credentials.password || Object.values(errors).some((e) => e)"
            class="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-2 rounded-lg transition-colors font-medium cursor-pointer flex items-center justify-center gap-2">
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
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
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const credentials = ref({
  email: "",
  password: "",
});
const showPassword = ref(false);
const loading = ref(false);
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

const clearEmailError = () => {
  if (errors.value.email) errors.value.email = "";
};

const clearPasswordError = () => {
  if (errors.value.password) errors.value.password = "";
};

const handleLogin = async () => {
  if (!validateEmail(credentials.value.email) || !validatePassword(credentials.value.password)) {
    return;
  }
  loading.value = true;
  try {
    const success = await authStore.login(credentials.value.email, credentials.value.password);
    if (success) {
      toast.success(t("pages.auth.login.successMessage"), t("pages.auth.login.successTitle"));
      await router.push("/dash/");
    } else {
      throw new Error("Login failed");
    }
  } catch {
    toast.error(t("pages.auth.login.errorMessage"), t("pages.auth.login.errorTitle"));
  } finally {
    loading.value = false;
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
