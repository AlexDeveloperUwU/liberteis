<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <DsCard>
        <h1 class="font-display font-bold text-3xl text-text-heading mb-6">
          {{ t("pages.auth.login.title") }}
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <TextField
            v-model="credentials.email"
            type="email"
            :label="t('pages.auth.login.email')"
            icon="mail"
            :error="errors.email"
            :valid="!!credentials.email && !errors.email"
            @update:model-value="clearEmailError"
            required />

          <div>
            <TextField
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              :label="t('pages.auth.login.password')"
              icon="shield"
              :error="errors.password"
              @update:model-value="clearPasswordError"
              required />
            <button type="button" @click="showPassword = !showPassword" class="mt-1.5 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <component :is="showPassword ? EyeOff : Eye" class="w-3.5 h-3.5" />
            </button>
          </div>

          <router-link :to="{ name: 'authForgotPassword' }" class="block text-sm text-primary-600 hover:text-primary-700 transition-colors">
            {{ t("pages.auth.login.forgotPassword") }}
          </router-link>

          <DsButton
            type="submit"
            full-width
            :state="loading ? 'processing' : 'default'"
            :disabled="loading || !credentials.email || !credentials.password || Object.values(errors).some((e) => e)">
            {{ t("pages.auth.login.submit") }}
          </DsButton>
        </form>
      </DsCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { useRouter } from "vue-router";
import DsCard from "@/components/core/DsCard.vue";
import TextField from "@/components/forms/TextField.vue";
import DsButton from "@/components/core/DsButton.vue";

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
