import axios from "axios";

/**
 * Carga las métricas para el dashboard principal
 */
export const loadDashboardHomeData = async (to) => {
  try {
    const metricsResponse = await axios.get("/api/bookings/count");

    if (metricsResponse.data && metricsResponse.data.success) {
      to.meta.initialData = {
        metrics: metricsResponse.data.data || {},
        error: false,
      };
    } else {
      console.error("Error fetching dashboard metrics:", metricsResponse.data?.message || "Unknown error");
      to.meta.initialData = {
        metrics: {},
        error: true,
        errorMessage: metricsResponse.data?.message || "Error desconocido al cargar métricas",
      };
    }
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error.message || error);
    to.meta.initialData = {
      metrics: {},
      error: true,
      errorMessage: "Error de conexión al cargar métricas",
    };
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
      metrics: metricsResponse.data.success ? metricsResponse.data.data : {},
      users: usersResponse.data.success ? usersResponse.data.data : [],
      error: !metricsResponse.data.success || !usersResponse.data.success,
      errorMessage: !metricsResponse.data.success ? metricsResponse.data.message : 
                   !usersResponse.data.success ? usersResponse.data.message : null,
    };
  } catch (error) {
    console.error("Error fetching users data:", error.message || error);
    to.meta.initialData = { 
      metrics: {}, 
      users: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de usuarios",
    };
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
      user: userResponse.data.success ? userResponse.data.data : null,
      error: !userResponse.data.success,
      errorMessage: !userResponse.data.success ? userResponse.data.message : null,
    };
  } catch (error) {
    console.error("Error fetching user data:", error.message || error);
    to.meta.initialData = { 
      user: null, 
      error: true,
      errorMessage: "Error de conexión al cargar datos del usuario",
    };
  }
};
