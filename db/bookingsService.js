import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

//! Basic CRUD operations

/**
 * Adds a booking to the database.
 * @param {object} booking - The booking object to add.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function addBooking(booking) {
  if (!booking) {
    return ErrorManager.returnError("invalidParameters");
  }

  // Validar que el espacio pertenezca a la categoría del evento
  const spaceValidation = await validateSpaceForEvent(booking.eventId, booking.space);
  if (!spaceValidation.success) {
    return spaceValidation;
  }

  // Verificar disponibilidad del espacio en la fecha
  const availability = await checkSpaceAvailability(booking.space, booking.bookingDate, booking.eventId);
  if (!availability.success) {
    return availability;
  }

  booking.id = await id.generateId("booking");
  booking.deleted = false;

  try {
    await dbc.dbSaveData("bookings", booking);
    return ErrorManager.returnSuccess(201, "Booking created successfully", { code: 201 });
  } catch (error) {
    logger.error(`Error saving booking to the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Updates a booking in the database.
 * @param {string} id - The ID of the booking to update.
 * @param {object} booking - The updated booking object.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function updateBooking(id, booking) {
  if (!id || !booking) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const existingBooking = await getBooking(id, true);
    if (!existingBooking.success) {
      return ErrorManager.returnError("bookingNotFound");
    }

    // Si se cambia el espacio o evento, validar nuevamente
    if (booking.eventId || booking.space) {
      const eventId = booking.eventId || existingBooking.data.eventId;
      const space = booking.space || existingBooking.data.space;
      
      const spaceValidation = await validateSpaceForEvent(eventId, space);
      if (!spaceValidation.success) {
        return spaceValidation;
      }

      // Verificar disponibilidad si cambia fecha o espacio
      if (booking.bookingDate || booking.space) {
        const bookingDate = booking.bookingDate || existingBooking.data.bookingDate;
        const availability = await checkSpaceAvailability(space, bookingDate, eventId, id);
        if (!availability.success) {
          return availability;
        }
      }
    }

    await dbc.dbUpdateData("bookings", id, booking);
    return ErrorManager.returnSuccess(200, "Booking updated successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error updating booking in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Toggles the status of a booking (enabled/disabled).
 * @param {string} id - The ID of the booking to change status.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function changeBookingStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const bookingStatus = await getBookingStatus(id);
    if (typeof bookingStatus !== 'boolean') {
      return bookingStatus; // Return error if any
    }

    await dbc.dbUpdateData("bookings", id, { deleted: !bookingStatus });
    return ErrorManager.returnSuccess(200, "Booking status changed successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error changing booking status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Enables a booking in the database.
 * @param {string} id - The ID of the booking to enable.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function enableBooking(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    await dbc.dbUpdateData("bookings", id, { deleted: false });
    return ErrorManager.returnSuccess(200, "Booking enabled successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error enabling booking in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Disables a booking in the database.
 * @param {string} id - The ID of the booking to disable.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function disableBooking(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    await dbc.dbUpdateData("bookings", id, { deleted: true });
    return ErrorManager.returnSuccess(200, "Booking disabled successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error disabling booking in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

//! Info retrieval operations

/**
 * Retrieves a booking from the database.
 * @param {string} id - The ID of the booking to retrieve.
 * @param {boolean} [includeInactive=false] - Whether to include inactive bookings.
 * @returns {Promise<object>} The booking object or an error message.
 */
export async function getBooking(id, includeInactive = false) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetOne("bookings", id);
        break;
      case false:
        result = await dbc.dbGetWhere("bookings", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("bookingNotFound");
    }

    return ErrorManager.returnSuccess(200, "Booking retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error retrieving booking from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Retrieves a booking by event ID and date.
 * @param {string} eventId - The event ID associated with the booking.
 * @param {string} bookingDate - The date of the booking.
 * @param {boolean} [includeInactive=false] - Whether to include inactive bookings.
 * @returns {Promise<object>} The booking object or an error message.
 */
export async function getBookingByEventAndDate(eventId, bookingDate, includeInactive = false) {
  if (!eventId || !bookingDate) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("bookings", [
          { field: "eventId", operator: "=", value: eventId },
          { field: "bookingDate", operator: "=", value: bookingDate },
        ]);
        break;
      case false:
        result = await dbc.dbGetWhere("bookings", [
          { field: "eventId", operator: "=", value: eventId },
          { field: "bookingDate", operator: "=", value: bookingDate },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("bookingNotFound");
    }

    return ErrorManager.returnSuccess(200, "Booking retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error retrieving booking by event and date from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Retrieves bookings from the database based on their status and optional filters.
 * @param {string} [status="active"] - The status of bookings to retrieve ("all", "active", "inactive").
 * @param {string} [userId=null] - Optional user ID to filter bookings by specific user.
 * @param {object} [filters={}] - Optional filters: { startMonth, endMonth }
 * @returns {Promise<object[]>} An array of bookings or an error message.
 */
export async function getBookings(status = "active", userId = null, filters = {}) {
  let result;

  try {
    let conditions = [];
    
    switch (status) {
      case "all":
        if (userId) {
          conditions = [{ field: "bookedBy", operator: "=", value: userId }];
          result = await dbc.dbGetWhere("bookings", conditions);
        } else {
          result = await dbc.dbGetAll("bookings");
        }
        break;
      case "active":
        conditions = [{ field: "deleted", operator: "=", value: false }];
        if (userId) {
          conditions.push({ field: "bookedBy", operator: "=", value: userId });
        }
        result = await dbc.dbGetWhere("bookings", conditions);
        break;
      case "inactive":
        conditions = [{ field: "deleted", operator: "=", value: true }];
        if (userId) {
          conditions.push({ field: "bookedBy", operator: "=", value: userId });
        }
        result = await dbc.dbGetWhere("bookings", conditions);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (filters.startMonth || filters.endMonth) {
      let startDate = null;
      let endDate = null;
      if (filters.startMonth) {
        const [sm, sy] = filters.startMonth.split("/");
        startDate = new Date(Number(`20${sy.length === 2 ? sy : "0" + sy}`), Number(sm) - 1, 1, 0, 0, 0, 0);
      }
      if (filters.endMonth) {
        const [em, ey] = filters.endMonth.split("/");
        endDate = new Date(Number(`20${ey.length === 2 ? ey : "0" + ey}`), Number(em), 0, 23, 59, 59, 999);
      }
      if (startDate) {
        conditions.push({ field: "bookingDate", operator: ">=", value: startDate.toISOString() });
      }
      if (endDate) {
        conditions.push({ field: "bookingDate", operator: "<=", value: endDate.toISOString() });
      }
    }

    result = await dbc.dbGetWhere("bookings", conditions);

    if (result.length === 0) {
      return ErrorManager.returnSuccess(200, "No bookings found", []);
    }

    return ErrorManager.returnSuccess(200, "Bookings retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving bookings from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets bookings filtered by event ID.
 * @param {string} eventId - ID of the event to filter by.
 * @param {boolean} [includeInactive=false] - Whether to include inactive bookings.
 * @returns {Promise<object>} Found bookings or error message.
 */
export async function getBookingsByEvent(eventId, includeInactive = false) {
  if (!eventId) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("bookings", [{ field: "eventId", operator: "=", value: eventId }]);
        break;
      case false:
        result = await dbc.dbGetWhere("bookings", [
          { field: "eventId", operator: "=", value: eventId },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnSuccess(200, "No bookings found", []);
    }

    return ErrorManager.returnSuccess(200, "Bookings retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving bookings by event from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets bookings filtered by user ID.
 * @param {string} userId - ID of the user to filter by.
 * @param {boolean} [includeInactive=false] - Whether to include inactive bookings.
 * @returns {Promise<object>} Found bookings or error message.
 */
export async function getBookingsByUser(userId, includeInactive = false) {
  if (!userId) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("bookings", [{ field: "bookedBy", operator: "=", value: userId }]);
        break;
      case false:
        result = await dbc.dbGetWhere("bookings", [
          { field: "bookedBy", operator: "=", value: userId },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnSuccess(200, "No bookings found", []);
    }

    return ErrorManager.returnSuccess(200, "Bookings retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving bookings by user from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets the status of a booking from the database.
 * @param {string} id - ID of the booking to check.
 * @returns {Promise<boolean>} True if booking is deleted, false if active.
 */
export async function getBookingStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const booking = await getBooking(id, true);
    if (booking.success === false) {
      return false;
    }
    return booking.data.deleted;
  } catch (error) {
    logger.error(`Error checking booking status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Checks the status of a booking.
 * @param {string} id - The ID of the booking to check.
 * @returns {Promise<boolean>} The status of the booking (true if deleted, false otherwise).
 */
export async function checkBookingStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbGetOne("bookings", id);
    return result[0]?.deleted || false;
  } catch (error) {
    logger.error(`Error checking booking status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Validates that a space belongs to the same category as the event.
 * @param {string} eventId - The ID of the event.
 * @param {string} spaceId - The ID of the space.
 * @returns {Promise<object>} Validation result.
 */
export async function validateSpaceForEvent(eventId, spaceId) {
  try {
    // Obtener el evento y su categoría
    const eventResult = await dbc.dbGetOne("events", eventId);
    if (eventResult.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }
    const event = eventResult[0];

    // Obtener la categoría y sus espacios
    const categoryResult = await dbc.dbGetOne("categories", event.category);
    if (categoryResult.length === 0) {
      return ErrorManager.returnError("categoryNotFound");
    }
    const category = categoryResult[0];

    // Parsear los espacios de la categoría
    let categorySpaces;
    try {
      categorySpaces = typeof category.spaces === 'string' ? JSON.parse(category.spaces) : category.spaces;
    } catch (error) {
      logger.error("Error parsing category spaces:", error);
      return ErrorManager.returnError("invalidCategoryData");
    }

    // Verificar que el espacio esté en la categoría
    if (!categorySpaces || !categorySpaces.includes(spaceId)) {
      return ErrorManager.returnError("spaceNotInCategory");
    }

    return ErrorManager.returnSuccess(200, "Space validation successful", { valid: true });
  } catch (error) {
    logger.error(`Error validating space for event: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Checks if a space is available for booking at a specific date and time.
 * @param {string} spaceId - The ID of the space.
 * @param {string} bookingDate - The date and time for the booking.
 * @param {string} eventId - The ID of the event.
 * @param {string} [excludeBookingId] - ID of booking to exclude from check (for updates).
 * @returns {Promise<object>} Availability result.
 */
export async function checkSpaceAvailability(spaceId, bookingDate, eventId, excludeBookingId = null) {
  try {
    // Obtener la duración del evento
    const eventResult = await dbc.dbGetOne("events", eventId);
    if (eventResult.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }
    const event = eventResult[0];
    const duration = event.duration || 30; // duración en minutos

    // Calcular el rango de tiempo del evento
    const startTime = new Date(bookingDate);
    const endTime = new Date(startTime.getTime() + duration * 60000); // convertir minutos a millisegundos

    // Buscar reservas conflictivas en el mismo espacio
    const conditions = [
      { field: "space", operator: "=", value: spaceId },
      { field: "deleted", operator: "=", value: false }
    ];

    if (excludeBookingId) {
      conditions.push({ field: "id", operator: "!=", value: excludeBookingId });
    }

    const existingBookings = await dbc.dbGetWhere("bookings", conditions);

    // Verificar conflictos de horario
    for (const booking of existingBookings) {
      // Obtener la duración del evento de la reserva existente
      const existingEventResult = await dbc.dbGetOne("events", booking.eventId);
      if (existingEventResult.length === 0) continue;
      
      const existingEvent = existingEventResult[0];
      const existingDuration = existingEvent.duration || 30;

      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

      // Verificar si hay solapamiento
      if ((startTime < existingEnd && endTime > existingStart)) {
        return ErrorManager.returnError("spaceNotAvailable");
      }
    }

    return ErrorManager.returnSuccess(200, "Space is available", { available: true });
  } catch (error) {
    logger.error(`Error checking space availability: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets a count or summary of bookings.
 * @param {string|null} [userId=null] - Optional user ID to filter bookings by user.
 * @param {string|null} [type=null] - Type of bookings to retrieve ("all", "done", "pending", or null for complete summary).
 * @returns {Promise<object>} A summary object containing booking counts or filtered bookings count.
 */
export async function getBookingsCount(userId = null, type = null) {
  try {
    const currentDate = new Date().toISOString();
    const baseFilters = [{ field: "deleted", operator: "=", value: false }];
    if (userId) baseFilters.push({ field: "bookedBy", operator: "=", value: userId });

    let resultData;

    switch (type) {
      case "all": {
        const total = await dbc.dbGetWhere("bookings", baseFilters);
        resultData = { totales: total.length };
        break;
      }
      case "done": {
        const doneFilters = [...baseFilters, { field: "bookingDate", operator: "<", value: currentDate }];
        const hechos = await dbc.dbGetWhere("bookings", doneFilters);
        resultData = { hechos: hechos.length };
        break;
      }
      case "pending": {
        const pendingFilters = [...baseFilters, { field: "bookingDate", operator: ">", value: currentDate }];
        const porHacer = await dbc.dbGetWhere("bookings", pendingFilters);
        resultData = { porHacer: porHacer.length };
        break;
      }
      case null: {
        const total = await dbc.dbGetWhere("bookings", baseFilters);
        const doneFilters = [...baseFilters, { field: "bookingDate", operator: "<", value: currentDate }];
        const hechos = await dbc.dbGetWhere("bookings", doneFilters);
        const pendingFilters = [...baseFilters, { field: "bookingDate", operator: ">", value: currentDate }];
        const porHacer = await dbc.dbGetWhere("bookings", pendingFilters);
        resultData = {
          totales: total.length,
          hechos: hechos.length,
          porHacer: porHacer.length,
        };
        break;
      }
      default:
        return ErrorManager.returnError("invalidBookingType");
    }

    return ErrorManager.returnSuccess(200, "Bookings summary retrieved successfully", resultData);
  } catch (error) {
    logger.error(`Error retrieving bookings summary: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
