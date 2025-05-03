<template>
  <div class="h-full w-full p-6 bg-gray-900 text-white flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="bg-gray-800 p-8 shadow rounded-lg">
        <h1 class="text-3xl font-bold text-center mb-6">{{ t("pages.register.title") }}</h1>

        <form @submit.prevent="handleregister" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm">{{ t("pages.register.name") }}</label>
            <input type="text" v-model="formData.name" class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <div class="space-y-2">
            <label class="block text-sm">{{ t("pages.register.email") }}</label>
            <input type="email" v-model="formData.email" class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <div class="space-y-2">
            <label class="block text-sm">{{ t("pages.register.password") }}</label>
            <input type="password" v-model="formData.password" class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors">
            {{ t("pages.register.submit") }}
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
const formData = ref({
  name: '',
  email: '',
  password: ''
});

const handleregister = async () => {
  try {
    const dataToSend = {
      ...formData.value,
      type: 'adminUser',
      createdBy: 'System'
    };

    const success = await authStore.register(dataToSend);
    if (success) {
      iziToast.success({
        title: t('pages.register.successTitle'),
        message: t('pages.register.successMessage'),
        position: 'topRight'
      });
      router.push('/auth/login');
    }
  } catch (error) {
    iziToast.error({
      title: t('pages.register.errorTitle'),
      message: t('pages.register.errorMessage'),
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
