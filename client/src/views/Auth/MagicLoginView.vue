<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background-200">
    <div class="w-full max-w-md px-6">
      <DsCard>
        <h1 class="font-display font-bold text-3xl text-text-heading mb-6">
          {{ t("pages.auth.magicLogin.title") }}
        </h1>

        <div v-if="pageState === 'checking'" class="flex justify-center py-6">
          <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
        </div>

        <template v-else>
          <p class="text-sm text-accent-600 mb-6">
            {{ pageState === "expired" ? t("pages.auth.magicLogin.expired") : t("pages.auth.magicLogin.invalid") }}
          </p>
          <router-link
            :to="{ name: 'authLogin', query: { method: 'magicLink' } }"
            class="block text-sm text-center text-primary-600 hover:text-primary-700">
            {{ t("pages.auth.magicLogin.requestNewLink") }}
          </router-link>
        </template>
      </DsCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Loader2 } from "@lucide/vue";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import DsCard from "@/components/core/DsCard.vue";

const props = defineProps({
  token: { type: String, required: true },
});

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

/** @type {import('vue').Ref<'checking'|'expired'|'invalid'>} */
const pageState = ref("checking");

onMounted(async () => {
  const result = await authStore.magicLogin(props.token);
  if (result.success) {
    toast.success(t("pages.auth.magicLogin.successMessage"), t("pages.auth.magicLogin.successTitle"));
    await router.replace("/dash/");
  } else {
    pageState.value = result.message === "pages.other.errors.magicLinkExpired" ? "expired" : "invalid";
  }
});
</script>
