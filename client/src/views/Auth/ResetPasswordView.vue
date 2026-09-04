<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <div
        class="bg-background-100 p-8 shadow-md hover:shadow-xl rounded-lg border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <h1 class="text-3xl font-bold text-text-950 mb-6 k2d">
          {{ t("pages.auth.resetPassword.title") }}
        </h1>

        <div v-if="pageState === 'checking'" class="flex justify-center py-6">
          <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
        </div>

        <template v-else-if="pageState === 'expired' || pageState === 'invalid'">
          <p class="text-sm text-accent-600 mb-6">
            {{
              pageState === "expired" ? t("pages.auth.resetPassword.expired") : t("pages.auth.resetPassword.invalid")
            }}
          </p>
          <router-link
            :to="{ name: 'authForgotPassword' }"
            class="block text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
            {{ t("pages.auth.resetPassword.requestNewLink") }}
          </router-link>
        </template>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{ t("pages.auth.resetPassword.password") }}</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                autocomplete="new-password"
                class="w-full px-3 py-2 pr-16 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950"
                :class="{ 'border-accent-500': errors.password }"
                required />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                <button type="button" @click="showPassword = !showPassword">
                  <component :is="showPassword ? EyeOff : Eye" class="h-5 w-5 text-text-400 hover:text-text-600" />
                </button>
                <Loader2 v-if="isValidatingPassword" class="w-5 h-5 text-primary-600 animate-spin" />
                <CheckCircle2
                  v-else-if="!errors.password && password && password.length >= 6"
                  class="w-5 h-5 text-primary-500" />
                <XCircle v-else-if="password" class="w-5 h-5 text-accent-500" />
              </div>
            </div>
            <div v-if="password" class="space-y-2 mt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-text-600">{{
                  t("pages.other.validators.password.strength")
                }}</span>
                <span
                  class="text-xs font-medium px-2 py-1 rounded"
                  :class="[
                    passwordStrength === 'weak'
                      ? 'bg-accent-100 text-accent-700'
                      : passwordStrength === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-primary-100 text-primary-700',
                  ]">
                  {{
                    passwordStrength === "weak"
                      ? t("pages.other.validators.password.weak")
                      : passwordStrength === "medium"
                        ? t("pages.other.validators.password.medium")
                        : t("pages.other.validators.password.strong")
                  }}
                </span>
              </div>
              <div class="h-2 bg-background-300 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all"
                  :class="[
                    passwordStrength === 'weak'
                      ? 'bg-accent-500 w-1/3'
                      : passwordStrength === 'medium'
                        ? 'bg-yellow-500 w-2/3'
                        : 'bg-primary-500 w-full',
                  ]"></div>
              </div>
            </div>
            <p v-if="errors.password" class="text-sm text-accent-600">{{ errors.password }}</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-800">{{
              t("pages.auth.resetPassword.confirmPassword")
            }}</label>
            <input
              type="password"
              v-model="confirmPassword"
              autocomplete="new-password"
              class="w-full px-3 py-2 bg-background-50 dark:bg-background-300 border border-background-400 dark:border-background-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-950"
              :class="{ 'border-accent-500': errors.confirmPassword }"
              required />
            <p v-if="errors.confirmPassword" class="text-sm text-accent-600">{{ errors.confirmPassword }}</p>
          </div>

          <button
            type="submit"
            :disabled="!canSubmit || submitting"
            class="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-2 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            {{ t("pages.auth.resetPassword.submit") }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import { validatePassword } from "@/utils/validators";

const props = defineProps({
  token: { type: String, required: true },
});

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const pageState = ref("checking"); // checking | valid | expired | invalid

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
  // Check for uppercase, lowercase, numbers, special chars
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
      // The reset already invalidated every session server-side; drop any stale local one too.
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
