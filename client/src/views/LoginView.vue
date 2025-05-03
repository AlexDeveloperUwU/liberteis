<template>
  <div class="h-full w-full p-6 bg-gray-900 text-white flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="bg-gray-800 p-8 shadow rounded-lg">
        <h1 class="text-3xl font-bold text-center mb-6">{{ t("pages.login.title") }}</h1>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm">{{ t("pages.login.email") }}</label>
            <input type="email" v-model="credentials.email" class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <div class="space-y-2">
            <label class="block text-sm">{{ t("pages.login.password") }}</label>
            <input type="password" v-model="credentials.password" class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors">
            {{ t("pages.login.submit") }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import iziToast from 'izitoast';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
  email: '',
  password: ''
});

const handleLogin = async () => {
  try {
    const success = await authStore.login(credentials.value.email, credentials.value.password);
    if (success) {
      iziToast.success({
        title: t('pages.login.successTitle'),
        message: t('pages.login.successMessage'),
        position: 'topRight'
      });
      const redirectPath = router.currentRoute.value.query.redirect || '/';
      await router.push(redirectPath);
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    iziToast.error({
      title: t('pages.login.errorTitle'),
      message: t('pages.login.errorMessage'),
      position: 'topRight'
    });
  }
};
</script>

<style>
.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 1);
}
</style>
