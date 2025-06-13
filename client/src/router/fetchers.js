import axios from "axios";

/**
 * Carga las métricas para el dashboard principal
 */
export const loadDashboardHomeData = async (to) => {
  try {
    const metricsResponse = await axios.get("/api/bookings/count");
    to.meta.initialData = {
      metrics: metricsResponse.data.code === 200 ? metricsResponse.data.data : {},
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error.message || error);
    to.meta.initialData = { metrics: {} };
  }
};

/**
 * Carga los datos para la gestión de usuarios
 */
export const loadUsersData = async (to) => {
  try {
    const [metricsResponse, usersResponse] = await Promise.all([
      axios.get("/api/users/count"),
      axios.get("/api/users"),
    ]);

    to.meta.initialData = {
      metrics: metricsResponse.data.code === 200 ? metricsResponse.data.data : {},
      users: usersResponse.data.code === 200 ? usersResponse.data.data : [],
    };
  } catch (error) {
    console.error("Error fetching users data:", error.message || error);
    to.meta.initialData = { metrics: {}, users: [] };
  }
};

/**
 * Carga los datos para la edición de un usuario específico
 */
export const loadUserEditData = async (to) => {
  try {
    const userId = to.params.id;
    const userResponse = await axios.get(`/api/users?id=${userId}`);

    to.meta.initialData = {
      user: userResponse.data.code === 200 ? userResponse.data.data : null,
    };
  } catch (error) {
    console.error("Error fetching user data:", error.message || error);
    to.meta.initialData = { user: null, error: true };
  }
};
