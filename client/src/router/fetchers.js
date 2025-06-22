import axios from "axios";

/**
 * Carga las métricas para el dashboard principal
 */
export const loadDashboardHomeData = async (to) => {
  console.log("⏳ Iniciando carga de datos del dashboard home...");
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    
    // Mes anterior
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Mes siguiente
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    // Formatear meses para la API en formato mm/yy
    const startMonthStr = `${prevMonth.toString().padStart(2, '0')}/${(prevYear % 100).toString().padStart(2, '0')}`;
    const endMonthStr = `${nextMonth.toString().padStart(2, '0')}/${(nextYear % 100).toString().padStart(2, '0')}`;

    console.log(`📅 Rango de fechas para cargar bookings: ${startMonthStr} - ${endMonthStr}`);

    const [metricsResponse, bookingsResponse] = await Promise.allSettled([
      axios.get("/api/bookings/count"),
      axios.get(`/api/bookings?startMonth=${startMonthStr}&endMonth=${endMonthStr}`)
    ]);
    
    console.log("📊 Estado respuesta métricas:", metricsResponse.status);
    console.log("📚 Estado respuesta bookings:", bookingsResponse.status);

    const metrics = metricsResponse.status === "fulfilled" && metricsResponse.value.data.success 
      ? metricsResponse.value.data.data || {}
      : {};
      
    const bookings = bookingsResponse.status === "fulfilled" && bookingsResponse.value.data.success
      ? bookingsResponse.value.data.data || []
      : [];
      
    console.log(`📋 Bookings cargados: ${bookings.length}`);

    const hasError = 
      metricsResponse.status === "rejected" ||
      bookingsResponse.status === "rejected" ||
      (metricsResponse.status === "fulfilled" && !metricsResponse.value.data.success) ||
      (bookingsResponse.status === "fulfilled" && !bookingsResponse.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (metricsResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar métricas";
      } else if (bookingsResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar reservas";
      } else if (metricsResponse.status === "fulfilled" && !metricsResponse.value.data.success) {
        errorMessage = metricsResponse.value.data.message;
      } else if (bookingsResponse.status === "fulfilled" && !bookingsResponse.value.data.success) {
        errorMessage = bookingsResponse.value.data.message;
      }
    }

    to.meta.initialData = {
      metrics: metrics || {},
      bookings: bookings || [],
      startMonth: startMonthStr,
      endMonth: endMonthStr,
      error: hasError,
      errorMessage: errorMessage || ""
    };
    
    console.log("✅ Datos del dashboard cargados correctamente");
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error.message || error);
    to.meta.initialData = {
      metrics: {},
      bookings: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos del dashboard",
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

/**
 * Carga los datos para la gestión de reservas
 */
export const loadBookingsData = async (to) => {
  try {
    const [metricsResult, bookingsResult, eventsResult] = await Promise.allSettled([
      axios.get("/api/bookings/count"),
      axios.get("/api/bookings"),
      axios.get("/api/events"),
    ]);

    const metrics =
      metricsResult.status === "fulfilled" && metricsResult.value.data.success ? metricsResult.value.data.data : {};

    const bookings =
      bookingsResult.status === "fulfilled" && bookingsResult.value.data.success ? bookingsResult.value.data.data : [];

    const events =
      eventsResult.status === "fulfilled" && eventsResult.value.data.success ? eventsResult.value.data.data : [];

    const hasError =
      metricsResult.status === "rejected" ||
      bookingsResult.status === "rejected" ||
      eventsResult.status === "rejected" ||
      (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) ||
      (bookingsResult.status === "fulfilled" && !bookingsResult.value.data.success) ||
      (eventsResult.status === "fulfilled" && !eventsResult.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (metricsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar métricas de reservas";
      } else if (bookingsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar lista de reservas";
      } else if (eventsResult.status === "rejected") {
        errorMessage = "Error de conexión al cargar eventos";
      } else if (metricsResult.status === "fulfilled" && !metricsResult.value.data.success) {
        errorMessage = metricsResult.value.data.message;
      } else if (bookingsResult.status === "fulfilled" && !bookingsResult.value.data.success) {
        errorMessage = bookingsResult.value.data.message;
      } else if (eventsResult.status === "fulfilled" && !eventsResult.value.data.success) {
        errorMessage = eventsResult.value.data.message;
      }
    }

    to.meta.initialData = {
      metrics,
      bookings,
      events,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching bookings data:", error.message || error);
    to.meta.initialData = {
      metrics: {},
      bookings: [],
      events: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de reservas",
    };
  }
};

/**
 * Carga los datos para la creación de una nueva reserva
 */
export const loadBookingCreateData = async (to) => {
  try {
    const eventsResponse = await axios.get("/api/events");

    const events = eventsResponse.data.success ? eventsResponse.data.data : [];

    to.meta.initialData = {
      events,
      error: !eventsResponse.data.success,
      errorMessage: !eventsResponse.data.success ? eventsResponse.data.message : null,
    };
  } catch (error) {
    console.error("Error loading events for booking creation:", error.message || error);
    to.meta.initialData = {
      events: [],
      error: true,
      errorMessage: "Error de conexión al cargar eventos disponibles",
    };
  }
};

/**
 * Carga los datos para la edición de una reserva específica
 */
export const loadBookingEditData = async (to) => {
  try {
    const bookingId = to.params.id;
    const [bookingResponse, eventsResponse] = await Promise.allSettled([
      axios.get(`/api/bookings?id=${bookingId}&includeInactive=true`),
      axios.get("/api/events"),
    ]);

    const booking =
      bookingResponse.status === "fulfilled" && bookingResponse.value.data.success
        ? bookingResponse.value.data.data
        : null;

    const events =
      eventsResponse.status === "fulfilled" && eventsResponse.value.data.success ? eventsResponse.value.data.data : [];

    const hasError =
      bookingResponse.status === "rejected" ||
      eventsResponse.status === "rejected" ||
      (bookingResponse.status === "fulfilled" && !bookingResponse.value.data.success) ||
      (eventsResponse.status === "fulfilled" && !eventsResponse.value.data.success);

    let errorMessage = null;
    if (hasError) {
      if (bookingResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar datos de la reserva";
      } else if (eventsResponse.status === "rejected") {
        errorMessage = "Error de conexión al cargar eventos disponibles";
      } else {
        errorMessage = bookingResponse.value.data.message || eventsResponse.value.data.message;
      }
    }

    to.meta.initialData = {
      booking,
      events,
      error: hasError,
      errorMessage,
    };
  } catch (error) {
    console.error("Error fetching booking data:", error.message || error);
    to.meta.initialData = {
      booking: null,
      events: [],
      error: true,
      errorMessage: "Error de conexión al cargar datos de la reserva",
    };
  }
};

// Sistema de caché para reducir peticiones repetitivas
const cacheSystem = {
  data: {},
  timestamps: {},
  maxAge: {
    default: 5 * 60 * 1000, // 5 minutos por defecto
    screenEvents: 3 * 60 * 1000, // 3 minutos para eventos de pantalla
  },

  // Guardar datos en caché
  save(key, data) {
    this.data[key] = JSON.parse(JSON.stringify(data)); // Copia profunda para evitar referencias
    this.timestamps[key] = Date.now();
    return data;
  },

  // Obtener datos de la caché si son válidos
  get(key, maxAgeOverride) {
    const cachedData = this.data[key];
    const timestamp = this.timestamps[key];
    
    if (!cachedData || !timestamp) return null;
    
    const maxAge = maxAgeOverride || this.maxAge[key] || this.maxAge.default;
    const now = Date.now();
    
    // Si los datos han expirado, devolver null
    if (now - timestamp > maxAge) return null;
    
    return JSON.parse(JSON.stringify(cachedData)); // Devolver copia para evitar mutaciones
  },

  // Comprobar si hay datos válidos en caché
  isValid(key, maxAgeOverride) {
    const timestamp = this.timestamps[key];
    if (!timestamp) return false;
    
    const maxAge = maxAgeOverride || this.maxAge[key] || this.maxAge.default;
    return (Date.now() - timestamp) < maxAge;
  },

  // Limpiar entradas específicas o toda la caché
  clear(key = null) {
    if (key) {
      delete this.data[key];
      delete this.timestamps[key];
    } else {
      this.data = {};
      this.timestamps = {};
    }
  }
};

/**
 * Carga los datos para la pantalla de información con eventos próximos
 */
export const loadScreenData = async (to) => {
  console.log("⏳ Iniciando carga de datos para pantalla de información...");
  try {
    // Comprobar si los datos están en caché
    const cacheKey = 'screenEvents';
    let events = cacheSystem.get(cacheKey);
    
    if (events) {
      console.log("📋 Usando datos en caché para pantalla de información");
      to.meta.initialData = {
        events,
        cachedAt: cacheSystem.timestamps[cacheKey],
        error: false
      };
      return;
    }
    
    // Obtener fecha actual y fecha en 7 días
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    // Formatear fechas para la API
    const startDate = now.toISOString();
    const endDate = nextWeek.toISOString();
    
    console.log(`📅 Rango de fechas para cargar eventos: ${startDate} - ${endDate}`);
    
    // Solicitar bookings para los próximos 7 días
    const bookingsResponse = await axios.get(`/api/bookings?startDate=${startDate}&endDate=${endDate}`);
    
    if (!bookingsResponse.data.success) {
      throw new Error(bookingsResponse.data.message || "Error al obtener reservas");
    }
    
    const bookings = bookingsResponse.data.data;
    console.log(`📋 Reservas cargadas: ${bookings.length}`);
    
    // Procesar las reservas para obtener información completa
    events = [];
    for (const booking of bookings) {
      try {
        // Consultar detalles del evento
        const eventResponse = await axios.get(`/api/events?id=${booking.eventId}`);
        if (!eventResponse.data.success) continue;

        // Consultar detalles del espacio
        const spaceResponse = await axios.get(`/api/spaces?id=${booking.space}`);
        if (!spaceResponse.data.success) continue;

        // Consultar detalles del usuario que añadió el evento
        const userResponse = await axios.get(`/api/users?id=${booking.bookedBy}`);
        if (!userResponse.data.success) continue;

        // Consultar categoría si existe
        let categoryName = "";
        if (eventResponse.data.data.category) {
          const categoryResponse = await axios.get(`/api/categories?id=${eventResponse.data.data.category}`);
          if (categoryResponse.data.success) {
            categoryName = categoryResponse.data.data.name;
          }
        }

        const event = eventResponse.data.data;
        const space = spaceResponse.data.data;
        const user = userResponse.data.data;

        // Calcular duración formateada
        let durationStr = "";
        if (event.duration !== undefined && event.duration !== null) {
          const hours = Math.floor(event.duration / 60);
          const mins = event.duration % 60;
          if (hours > 0 && mins > 0) {
            durationStr = `${hours}h ${mins}min`;
          } else if (hours > 0) {
            durationStr = `${hours}h`;
          } else {
            durationStr = `${mins}min`;
          }
        }
        
        // Crear objeto de evento completo
        events.push({
          id: booking.id || booking._id,
          title: event.title,
          start: new Date(booking.bookingDate),
          end: new Date(new Date(booking.bookingDate).getTime() + (event.duration || 60) * 60000),
          description: event.info,
          info: event.info,
          coverUrl: event.coverUrl,
          bookingInfo: booking.info,
          spaceName: space.name,
          categoryName: categoryName,
          addedBy: user.name, // Incluir el autor del evento
          duration: durationStr,
        });
      } catch (error) {
        console.error(`Error al procesar booking ${booking._id || booking.id}:`, error.message || error);
      }
    }
    
    // Ordenar eventos por fecha
    events.sort((a, b) => a.start - b.start);
    
    // Guardar en caché
    cacheSystem.save(cacheKey, events);
    
    console.log(`✅ Datos para pantalla cargados: ${events.length} eventos`);
    
    to.meta.initialData = {
      events,
      cachedAt: null, // Datos frescos
      error: false
    };
    
  } catch (error) {
    console.error("❌ Error al cargar datos para pantalla:", error.message || error);
    to.meta.initialData = {
      events: [],
      error: true,
      errorMessage: "Error de conexión al cargar eventos"
    };
  }
};
