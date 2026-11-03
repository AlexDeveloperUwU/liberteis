<template>
  <div class="min-h-screen w-full pt-14 px-6 flex items-center justify-center">
    <div class="max-w-md w-full text-center">
      <p class="text-7xl font-bold text-primary-600 k2d mb-2">{{ errorCode }}</p>
      <EmptyState
        :icon="current.icon"
        :title="t(`${base}.${errorCode}.title`)"
        :description="t(`${base}.${errorCode}.description`)">
        <template #action>
          <div class="flex flex-wrap gap-3 justify-center">
            <DsButton v-if="errorCode === '401'" icon="lock" @click="router.push({ name: 'authLogin' })">
              {{ t(`${base}.actions.login`) }}
            </DsButton>
            <DsButton v-if="errorCode === '500' || errorCode === '503'" icon="undo-2" @click="reload">
              {{ t(`${base}.actions.retry`) }}
            </DsButton>
            <DsButton v-if="errorCode !== '401'" variant="neutral" icon="chevron-left" @click="goBack">
              {{ t(`${base}.actions.back`) }}
            </DsButton>
            <DsButton :variant="errorCode === '401' ? 'neutral' : 'primary'" icon="home" @click="goHome">
              {{ t(`${base}.actions.home`) }}
            </DsButton>
          </div>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import EmptyState from "@/components/feedback/EmptyState.vue";
import DsButton from "@/components/core/DsButton.vue";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  code: { type: String, default: "404" },
});

const ERRORS = {
  401: { icon: "lock" },
  403: { icon: "shield-alert" },
  404: { icon: "search-x" },
  500: { icon: "server-crash" },
  503: { icon: "construction" },
};

const base = "pages.other.httpErrors";
const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// Unknown codes (e.g. /error/418) fall back to the 404 screen.
const errorCode = computed(() => (props.code in ERRORS ? props.code : "404"));
const current = computed(() => ERRORS[errorCode.value]);

const goHome = () => router.push(authStore.isAuthenticated ? { name: "dashHome" } : { name: "index" });
const goBack = () => (window.history.length > 1 ? router.back() : goHome());
const reload = () => window.location.reload();
</script>
