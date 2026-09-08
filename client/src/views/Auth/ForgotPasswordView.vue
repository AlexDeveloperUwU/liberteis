<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <DsCard>
        <h1 class="font-display font-bold text-3xl text-text-heading mb-6">
          {{ t("pages.auth.forgotPassword.title") }}
        </h1>

        <template v-if="!submitted">
          <p class="text-sm text-text-body mb-6">{{ t("pages.auth.forgotPassword.description") }}</p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <TextField v-model="email" type="email" :label="t('pages.auth.forgotPassword.email')" icon="mail" :error="error" required />

            <DsButton type="submit" full-width :state="submitting ? 'processing' : 'default'" :disabled="submitting">
              {{ t("pages.auth.forgotPassword.submit") }}
            </DsButton>

            <router-link :to="{ name: 'authLogin' }" class="block text-sm text-center text-primary-600 hover:text-primary-700">
              {{ t("pages.auth.forgotPassword.backToLogin") }}
            </router-link>
          </form>
        </template>

        <template v-else>
          <p class="text-sm text-text-body mb-6">{{ t("pages.auth.forgotPassword.sentMessage") }}</p>
          <router-link :to="{ name: 'authLogin' }" class="block text-sm text-center text-primary-600 hover:text-primary-700">
            {{ t("pages.auth.forgotPassword.backToLogin") }}
          </router-link>
        </template>
      </DsCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/authStore";
import DsCard from "@/components/core/DsCard.vue";
import TextField from "@/components/forms/TextField.vue";
import DsButton from "@/components/core/DsButton.vue";

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
    await authStore.requestPasswordReset(email.value);
    submitted.value = true;
  } finally {
    submitting.value = false;
  }
};
</script>
