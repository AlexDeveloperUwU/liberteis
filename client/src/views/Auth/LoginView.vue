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
            :error="emailError"
            :valid="isEmailValid"
            @update:model-value="touchedEmail = true"
            required />

          <TextField
            v-model="credentials.password"
            type="password"
            :label="t('pages.auth.login.password')"
            icon="shield"
            :error="passwordError"
            @update:model-value="touchedPassword = true"
            required />

          <router-link
            :to="{ name: 'authForgotPassword' }"
            class="block text-sm text-primary-600 hover:text-primary-700 transition-colors">
            {{ t("pages.auth.login.forgotPassword") }}
          </router-link>

          <DsButton
            type="submit"
            full-width
            :state="loading ? 'processing' : 'default'"
            :disabled="loading || !isEmailValid || !credentials.password">
            {{ t("pages.auth.login.submit") }}
          </DsButton>
        </form>

        <div v-if="mockMode" class="mt-6 pt-6 border-t border-background-300 space-y-3">
          <p class="text-sm text-text-600">{{ t("pages.auth.login.mockLoginLabel") }}</p>
          <div class="flex gap-2">
            <DsButton variant="neutral" size="sm" full-width :disabled="loading" @click="quickLogin('admin')">
              {{ t("pages.auth.login.mockLoginAdmin") }}
            </DsButton>
            <DsButton variant="neutral" size="sm" full-width :disabled="loading" @click="quickLogin('manager')">
              {{ t("pages.auth.login.mockLoginManager") }}
            </DsButton>
            <DsButton variant="neutral" size="sm" full-width :disabled="loading" @click="quickLogin('user')">
              {{ t("pages.auth.login.mockLoginUser") }}
            </DsButton>
          </div>
        </div>
      </DsCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useToast } from "@/composables/useToast";
import { useRouter } from "vue-router";
import DsCard from "@/components/core/DsCard.vue";
import TextField from "@/components/forms/TextField.vue";
import DsButton from "@/components/core/DsButton.vue";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();
const toast = useToast();
const credentials = ref({
  email: "",
  password: "",
});
const loading = ref(false);
const submitted = ref(false);
const touchedEmail = ref(false);
const touchedPassword = ref(false);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = computed(() => emailRegex.test(credentials.value.email));

const mockMode = computed(() => configStore.getConfigValue("mockMode", "false") === "true");
const MOCK_CREDENTIALS = {
  admin: { email: "admin@mock.local", password: "MockPass123!" },
  manager: { email: "manager@mock.local", password: "MockPass123!" },
  user: { email: "user@mock.local", password: "MockPass123!" },
};

const emailError = computed(() => {
  if (!touchedEmail.value && !submitted.value) return "";
  if (!credentials.value.email) return t("pages.auth.login.errors.emailRequired");
  if (!isEmailValid.value) return t("pages.auth.login.errors.emailInvalid");
  return "";
});

const passwordError = computed(() => {
  if (!touchedPassword.value && !submitted.value) return "";
  if (!credentials.value.password) return t("pages.auth.login.errors.passwordRequired");
  return "";
});

const handleLogin = async () => {
  submitted.value = true;
  if (!isEmailValid.value || !credentials.value.password) {
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

const quickLogin = async (role) => {
  const mockCredentials = MOCK_CREDENTIALS[role];
  if (!mockCredentials) return;
  credentials.value = { ...mockCredentials };
  await handleLogin();
};
</script>
