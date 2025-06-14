import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user")) || null,
  }),
  getters: {
    userType: (state) => state.user?.type || null,
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.id || null,
  },
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post("/api/auth/login", { email, password });
        if (response.data.success) {
          this.user = response.data.data.user;
          localStorage.setItem("auth_user", JSON.stringify(this.user));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    async logout() {
      await axios.post("/api/auth/logout");
      this.user = null;
      localStorage.removeItem("auth_user");
      window.location.href = "/";
    },
    async verifyUserExists() {
      if (!this.isAuthenticated || !this.userId) return true;

      try {
        const response = await axios.get(`/api/users?id=${this.userId}`);
        if (!response.data.success || !response.data.data) {
          await this.logout();
          return false;
        }
        return true;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          await this.logout();
          return false;
        }
        console.error("Error verificando existencia del usuario:", error);
        return true; 
      }
    },
  },
});
