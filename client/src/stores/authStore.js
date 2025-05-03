import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user")) || null,
  }),
  getters: {
    userType: (state) => state.user?.type || null,
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post("/api/auth/login", { email, password });
        if (!response.data.error) {
          this.user = response.data.user;
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
      window.location.href = "/auth/login";
    },
    async register(userData) {
      const response = await axios.post("/api/auth/register", userData);
      return response.data.code === 200;
    },
  },
});
