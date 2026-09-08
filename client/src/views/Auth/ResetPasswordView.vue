<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <DsCard>
        <h1 class="font-display font-bold text-3xl text-text-heading mb-6">
          {{ t("pages.auth.resetPassword.title") }}
        </h1>

        <div v-if="pageState === 'checking'" class="flex justify-center py-6">
          <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
        </div>

        <template v-else-if="pageState === 'expired' || pageState === 'invalid'">
          <p class="text-sm text-accent-600 mb-6">
            {{ pageState === "expired" ? t("pages.auth.resetPassword.expired") : t("pages.auth.resetPassword.invalid") }}
          </p>
          <router-link :to="{ name: 'authForgotPassword' }" class="block text-sm text-center text-primary-600 hover:text-primary-700">
            {{ t("pages.auth.resetPassword.requestNewLink") }}
          </router-link>
        </template>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <TextField
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :label="t('pages.auth.resetPassword.password')"
              icon="shield"
              :error="errors.password"
              :valid="!errors.password && !!password && password.length >= 6"
              required />
            <div class="flex items-center gap-2 mt-1.5">
              <button type="button" @click="showPassword = !showPassword" class="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <component :is="showPassword ? EyeOff : Eye" class="w-3.5 h-3.5" />
              </button>
              <Loader2 v-if="isValidatingPassword" class="w-3.5 h-3.5 text-primary-600 animate-spin" />
            </div>

            <div v-if="password" class="space-y-2 mt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-text-600">{{ t("pages.other.validators.password.strength") }}</span>
                <DsPill :tone="passwordStrength === 'weak' ? 'danger' : passwordStrength === 'medium' ? 'warning' : 'success'">
                  {{
                    passwordStrength === "weak"
                      ? t("pages.other.validators.password.weak")
                      : passwordStrength === "medium"
                        ? t("pages.other.validators.password.medium")
                        : t("pages.other.validators.password.strong")
                  }}
                </DsPill>
              </div>
              <div class="h-2 bg-background-300 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all"
                  :class="[passwordStrength === 'weak' ? 'bg-accent-500 w-1/3' : passwordStrength === 'medium' ? 'bg-warning-500 w-2/3' : 'bg-primary-500 w-full']"></div>
              </div>
            </div>
          </div>

          <TextField
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            :label="t('pages.auth.resetPassword.confirmPassword')"
            icon="shield"
            :error="errors.confirmPassword"
            required />

          <DsButton type="submit" full-width :state="submitting ? 'processing' : 'default'" :disabled="!canSubmit || submitting">
            {{ t("pages.auth.resetPassword.submit") }}
          </DsButton>
        </form>
      </DsCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Loader2, Eye, EyeOff } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import { validatePassword } from "@/utils/validators";
import DsCard from "@/components/core/DsCard.vue";
import TextField from "@/components/forms/TextField.vue";
import DsPill from "@/components/core/DsPill.vue";
import DsButton from "@/components/core/DsButton.vue";

const props = defineProps({
  token: { type: String, required: true },
});

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

/** @type {import('vue').Ref<'checking'|'valid'|'expired'|'invalid'>} */
const pageState = ref("checking");

onMounted(async () => {
  const result = await authStore.validateResetToken(props.token);
  if (result.success) {
    pageState.value = "valid";
  } else if (result.message === "pages.other.errors.resetTokenExpired") {
    pageState.value = "expired";
  } else {
    pageState.value = "invalid";
  }
});

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const submitting = ref(false);
const isValidatingPassword = ref(false);

const errors = reactive({ password: "", confirmPassword: "" });

const passwordValidationResult = reactive({
  isValid: true,
  isPwned: false,
  count: 0,
  error: false,
  minLengthError: false,
});

const passwordErrorMessage = computed(() => {
  if (!passwordValidationResult.isValid) {
    if (passwordValidationResult.isPwned) {
      const countText =
        passwordValidationResult.count === 1
          ? t("pages.other.validators.password.singular")
          : t("pages.other.validators.password.plural", { count: passwordValidationResult.count.toLocaleString() });
      return t("pages.other.validators.password.pwned", { count: countText });
    }
    if (passwordValidationResult.minLengthError) {
      return t("pages.auth.resetPassword.errors.passwordLength");
    }
  } else if (passwordValidationResult.error) {
    return t("pages.other.validators.password.checkError");
  }
  return "";
});

let passwordDebounceTimeout;
const runPasswordValidation = async () => {
  clearTimeout(passwordDebounceTimeout);

  if (!password.value) {
    errors.password = "";
    isValidatingPassword.value = false;
    Object.assign(passwordValidationResult, {
      isValid: true,
      isPwned: false,
      count: 0,
      error: false,
      minLengthError: false,
    });
    return;
  }

  isValidatingPassword.value = true;
  errors.password = "";

  passwordDebounceTimeout = setTimeout(async () => {
    const result = await validatePassword(password.value);
    passwordValidationResult.isValid = result.isValid;
    passwordValidationResult.isPwned = result.isPwned;
    passwordValidationResult.count = result.count;
    passwordValidationResult.error = result.error || false;
    passwordValidationResult.minLengthError = !result.isValid && !result.isPwned;
    errors.password = passwordErrorMessage.value;
    isValidatingPassword.value = false;
  }, 500);
};

const validateConfirmPassword = () => {
  errors.confirmPassword =
    confirmPassword.value && confirmPassword.value !== password.value
      ? t("pages.auth.resetPassword.errors.passwordMismatch")
      : "";
};

watch(password, runPasswordValidation);
watch(confirmPassword, validateConfirmPassword);

const passwordStrength = computed(() => {
  if (!password.value) return "weak";
  if (password.value.length < 10) return "weak";
  if (password.value.length < 16) return "medium";
  const hasUppercase = /[A-Z]/.test(password.value);
  const hasLowercase = /[a-z]/.test(password.value);
  const hasNumbers = /\d/.test(password.value);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password.value);
  const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  if (charTypes >= 3) return "strong";
  return "medium";
});

const canSubmit = computed(
  () =>
    password.value.length >= 6 &&
    passwordValidationResult.isValid &&
    !isValidatingPassword.value &&
    confirmPassword.value === password.value,
);

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    const result = await authStore.resetPassword(props.token, password.value);
    if (result.success) {
      if (authStore.isAuthenticated) {
        authStore.$patch({ user: null, userVerified: false });
        localStorage.removeItem("auth_user");
      }
      toast.success(t("pages.auth.resetPassword.successMessage"), t("pages.auth.resetPassword.successTitle"));
      router.push({ name: "authLogin" });
    } else if (result.message === "pages.other.errors.resetTokenExpired") {
      pageState.value = "expired";
    } else if (result.message === "pages.other.errors.resetTokenInvalid") {
      pageState.value = "invalid";
    } else {
      toast.error(t("pages.auth.resetPassword.errorMessage"), t("pages.auth.resetPassword.errorTitle"));
    }
  } finally {
    submitting.value = false;
  }
};
</script>
