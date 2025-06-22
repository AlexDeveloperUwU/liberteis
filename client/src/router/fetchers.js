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
    const [metricsResult, usersResult] = await Promise.allSettled([
      axios.get("/api/users/count"),
      axios.get("/api/users"),
    ]);

    const metrics =
      metricsResult.status === "fulfilled" && metricsResult.value.data.success ? metricsResult.value.data.data : {};

    const users =
      usersResult.status === "fulfilled" && usersResult.value.data.success ? usersResult.value.data.data : [];

    const hasError =
      metricsResult.status === "rejected" ||
      usersResult.status === "rejected" ||
      (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) ||
      (usersResult.status === "fulfilled" && !usersResult.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (metricsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar métricas de usuarios";
      } else if (usersResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar lista de usuarios";
      } else if (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) {
        errorMessage = metricsResult.value.data.message;
      } else if (usersResult.status === "fulfilled" && !usersResult.value.data.success) {
        errorMessage = usersResult.value.data.message;
      }
    }

    to.meta.initialData = {
      metrics,
      users,
      error: hasError,
      errorMessage,
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
    const userResponse = await axios.get(`/api/users?id=${userId}&includeInactive=true`);

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

/**
 * Carga los datos para la configuración del usuario actual
 */
export const loadUserConfigData = async (to) => {
  try {
    const { useAuthStore } = await import("@/stores/authStore");
    const authStore = useAuthStore();
    const userId = authStore.userId;

    if (!userId) {
      to.meta.initialData = {
        user: null,
        error: true,
        errorMessage: "Usuario no autenticado o ID no disponible",
      };
      return;
    }

    const userResponse = await axios.get(`/api/users?id=${userId}`);

    to.meta.initialData = {
      user: userResponse.data.success ? userResponse.data.data : null,
      error: !userResponse.data.success,
      errorMessage: !userResponse.data.success ? userResponse.data.message : null,
    };
  } catch (error) {
    console.error("Error fetching user config data:", error.message || error);
    to.meta.initialData = {
      user: null,
      error: true,
      errorMessage: "Error de conexión al cargar datos del usuario",
    };
  }
};

/**
 * Carga los datos para la gestión de espacios
 */
export const loadSpacesData = async (to) => {
  try {
    const [metricsResult, spacesResult] = await Promise.allSettled([
      axios.get("/api/spaces/count"),
      axios.get("/api/spaces"),
    ]);

    const metrics =
      metricsResult.status === "fulfilled" && metricsResult.value.data.success ? metricsResult.value.data.data : {};

    const spaces =
      spacesResult.status === "fulfilled" && spacesResult.value.data.success ? spacesResult.value.data.data : [];

    const hasError =
      metricsResult.status === "rejected" ||
      spacesResult.status === "rejected" ||
      (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) ||
      (spacesResult.status === "fulfilled" && !spacesResult.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (metricsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar métricas de espacios";
      } else if (spacesResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar lista de espacios";
      } else if (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) {
        errorMessage = metricsResult.value.data.message;
      } else if (spacesResult.status === "fulfilled" && !spacesResult.value.data.success) {
        errorMessage = spacesResult.value.data.message;
      }
    }

    to.meta.initialData = {
      metrics,
      spaces,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching spaces data:", error.message || error);
    to.meta.initialData = {
      metrics: {},
      spaces: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de espacios",
    };
  }
};

/**
 * Carga los datos para la edición de un espacio específico
 */
export const loadSpaceEditData = async (to) => {
  try {
    const spaceId = to.params.id;
    const spaceResponse = await axios.get(`/api/spaces?id=${spaceId}&includeInactive=true`);

    to.meta.initialData = {
      space: spaceResponse.data.success ? spaceResponse.data.data : null,
      error: !spaceResponse.data.success,
      errorMessage: !spaceResponse.data.success ? spaceResponse.data.message : null,
    };
  } catch (error) {
    console.error("Error fetching space data:", error.message || error);
    to.meta.initialData = {
      space: null,
      error: true,
      errorMessage: "Error de conexión al cargar datos del espacio",
    };
  }
};

/**
 * Carga los datos para la gestión de categorías
 */
export const loadCategoriesData = async (to) => {
  try {
    const [metricsResult, categoriesResult, spacesResult] = await Promise.allSettled([
      axios.get("/api/categories/count"),
      axios.get("/api/categories"),
      axios.get("/api/spaces"),
    ]);

    const metrics =
      metricsResult.status === "fulfilled" && metricsResult.value.data.success ? metricsResult.value.data.data : {};

    const categories =
      categoriesResult.status === "fulfilled" && categoriesResult.value.data.success
        ? categoriesResult.value.data.data
        : [];

    const spaces =
      spacesResult.status === "fulfilled" && spacesResult.value.data.success ? spacesResult.value.data.data : [];

    const hasError =
      metricsResult.status === "rejected" ||
      categoriesResult.status === "rejected" ||
      spacesResult.status === "rejected" ||
      (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) ||
      (categoriesResult.status === "fulfilled" && !categoriesResult.value.data.success) ||
      (spacesResult.status === "fulfilled" && !spacesResult.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (metricsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar métricas de categorías";
      } else if (categoriesResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar lista de categorías";
      } else if (spacesResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar lista de espacios";
      } else if (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) {
        errorMessage = metricsResult.value.data.message;
      } else if (categoriesResult.status === "fulfilled" && !categoriesResult.value.data.success) {
        errorMessage = categoriesResult.value.data.message;
      } else if (spacesResult.status === "fulfilled" && !spacesResult.value.data.success) {
        errorMessage = spacesResult.value.data.message;
      }
    }

    to.meta.initialData = {
      metrics,
      categories,
      spaces,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching categories data:", error.message || error);
    to.meta.initialData = {
      metrics: {},
      categories: [],
      spaces: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de categorías",
    };
  }
};

/**
 * Carga los datos para la edición de una categoría específica
 */
export const loadCategoryEditData = async (to) => {
  try {
    const categoryId = to.params.id;
    const [categoryResponse, spacesResponse] = await Promise.allSettled([
      axios.get(`/api/categories?id=${categoryId}&includeInactive=true`),
      axios.get("/api/spaces"),
    ]);

    const category =
      categoryResponse.status === "fulfilled" && categoryResponse.value.data.success
        ? categoryResponse.value.data.data
        : null;

    const spaces =
      spacesResponse.status === "fulfilled" && spacesResponse.value.data.success ? spacesResponse.value.data.data : [];

    const hasError =
      categoryResponse.status === "rejected" ||
      spacesResponse.status === "rejected" ||
      (categoryResponse.status === "fulfilled" && !categoryResponse.value.data.success) ||
      (spacesResponse.status === "fulfilled" && !spacesResponse.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (categoryResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar datos de la categoría";
      } else if (spacesResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar espacios disponibles";
      } else {
        errorMessage = categoryResponse.value.data.message || spacesResponse.value.data.message;
      }
    }

    to.meta.initialData = {
      category,
      spaces,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching category data:", error.message || error);
    to.meta.initialData = {
      category: null,
      spaces: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de la categoría",
    };
  }
};

/**
 * Carga los datos para la gestión de eventos
 */
export const loadEventsData = async (to) => {
  try {
    const [metricsResult, eventsResult, categoriesResult] = await Promise.allSettled([
      axios.get("/api/events/count"),
      axios.get("/api/events"),
      axios.get("/api/categories"),
    ]);

    const metrics =
      metricsResult.status === "fulfilled" && metricsResult.value.data.success ? metricsResult.value.data.data : {};

    const events =
      eventsResult.status === "fulfilled" && eventsResult.value.data.success ? eventsResult.value.data.data : [];

    let categories =
      categoriesResult.status === "fulfilled" && categoriesResult.value.data.success
        ? categoriesResult.value.data.data
        : [];

    // Normalizar las categorías para asegurar que tengan el campo _id
    categories = categories.map((category) => ({
      ...category,
      _id: category._id || category.id,
    }));

    const hasError =
      metricsResult.status === "rejected" ||
      eventsResult.status === "rejected" ||
      categoriesResult.status === "rejected" ||
      (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) ||
      (eventsResult.status === "fulfilled" && !eventsResult.value.data.success) ||
      (categoriesResult.status === "fulfilled" && !categoriesResult.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (metricsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar métricas de eventos";
      } else if (eventsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar lista de eventos";
      } else if (categoriesResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar categorías";
      } else if (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) {
        errorMessage = metricsResult.value.data.message;
      } else if (eventsResult.status === "fulfilled" && !eventsResult.value.data.success) {
        errorMessage = eventsResult.value.data.message;
      } else if (categoriesResult.status === "fulfilled" && !categoriesResult.value.data.success) {
        errorMessage = categoriesResult.value.data.message;
      }
    }

    to.meta.initialData = {
      metrics,
      events,
      categories,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching events data:", error.message || error);
    to.meta.initialData = {
      metrics: {},
      events: [],
      categories: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de eventos",
    };
  }
};

/**
 * Carga los datos para la creación de un evento nuevo
 */
export const loadEventCreateData = async (to) => {
  try {
    console.log("Fetching categories for events/new...");
    const categoriesResponse = await axios.get("/api/categories");
    console.log("Categories response:", JSON.parse(JSON.stringify(categoriesResponse.data)));

    let categories = categoriesResponse.data.success ? categoriesResponse.data.data : [];
    console.log("Raw categories:", JSON.parse(JSON.stringify(categories)));

    // Normalizar las categorías para asegurar que tengan el campo _id
    categories = categories.map((category) => ({
      ...category,
      _id: category._id || category.id,
    }));

    console.log("Normalized categories:", JSON.parse(JSON.stringify(categories)));

    to.meta.initialData = {
      categories,
      error: !categoriesResponse.data.success,
      errorMessage: !categoriesResponse.data.success ? categoriesResponse.data.message : null,
    };
  } catch (error) {
    console.error("Error loading categories:", error.message || error);
    to.meta.initialData = {
      categories: [],
      error: true,
      errorMessage: "Error de conexión al cargar categorías disponibles",
    };
  }
};

/**
 * Carga los datos para la edición de un evento específico
 */
export const loadEventEditData = async (to) => {
  try {
    const eventId = to.params.id;
    const [eventResponse, categoriesResponse] = await Promise.allSettled([
      axios.get(`/api/events?id=${eventId}&includeInactive=true`),
      axios.get("/api/categories"),
    ]);

    const event =
      eventResponse.status === "fulfilled" && eventResponse.value.data.success ? eventResponse.value.data.data : null;

    let categories =
      categoriesResponse.status === "fulfilled" && categoriesResponse.value.data.success
        ? categoriesResponse.value.data.data
        : [];

    categories = categories.map((category) => ({
      ...category,
      _id: category._id || category.id,
    }));

    const hasError =
      eventResponse.status === "rejected" ||
      categoriesResponse.status === "rejected" ||
      (eventResponse.status === "fulfilled" && !eventResponse.value.data.success) ||
      (categoriesResponse.status === "fulfilled" && !categoriesResponse.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (eventResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar datos del evento";
      } else if (categoriesResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar categorías disponibles";
      } else {
        errorMessage = eventResponse.value.data.message || categoriesResponse.value.data.message;
      }
    }

    to.meta.initialData = {
      event,
      categories,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching event data:", error.message || error);
    to.meta.initialData = {
      event: null,
      categories: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos del evento",
    };
  }
};
