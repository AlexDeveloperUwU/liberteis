import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user")) || null,
    userVerified: false,
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
          this.userVerified = true;
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
      this.userVerified = false;
      localStorage.removeItem("auth_user");
      window.location.href = "/";
    },
    async verifyUserExists() {
      if (!this.isAuthenticated || !this.userId) return true;
      // The user was already verified during this session; avoid one API
      // request per navigation. Logout handles the expired/deleted cases.
      if (this.userVerified) return true;

      try {
        const response = await axios.get(`/api/users?id=${this.userId}`);
        if (!response.data.success || !response.data.data) {
          await this.logout();
          return false;
        }
        this.userVerified = true;
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
    async updateUserProfile(userData) {
      if (!this.isAuthenticated || !this.userId) return false;

      try {
        const response = await axios.put(`/api/users?id=${this.userId}`, userData);

        if (response.data.success) {
          // Merge the sent fields locally; the PUT response carries no user data.
          const { password, ...safeFields } = userData;
          this.user = { ...this.user, ...safeFields };
          localStorage.setItem("auth_user", JSON.stringify(this.user));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error actualizando perfil de usuario:", error);
        return false;
      }
    },
  },
});
