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
    async updateUserProfile(userData) {
      if (!this.isAuthenticated || !this.userId) return false;

      try {
        const response = await axios.put(`/api/users?id=${this.userId}`, userData);

        if (response.data.success) {
          // Recargar todos los datos del usuario para obtener información actualizada
          const userResponse = await axios.get(`/api/users?id=${this.userId}`);
          
          if (userResponse.data.success) {
            // Actualizar el estado con todos los datos del usuario
            this.user = userResponse.data.data;
            localStorage.setItem("auth_user", JSON.stringify(this.user));
            console.log(`Perfil de usuario actualizado correctamente`);
          } else {
            // Actualización parcial si la recarga falla
            this.user = { ...this.user, ...userData };
            localStorage.setItem("auth_user", JSON.stringify(this.user));
            console.log(`Actualización parcial: ${Object.keys(userData).join(', ')}`);
          }
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
