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

  booking.id = await id.generateId("booking");
  booking.status = "active";
  booking.deleted = false;

  try {
    const result = await dbc.dbSaveData("bookings", booking);
    return ErrorManager.returnSuccess(201, "Booking created successfully", result);
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
    const result = await dbc.dbUpdateData("bookings", id, booking);
    return ErrorManager.returnSuccess(200, "Booking updated successfully", result);
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
    const newStatus = !(await checkBookingStatus(id));
    const result = await dbc.dbUpdateData("bookings", id, { deleted: newStatus });
    return ErrorManager.returnSuccess(200, "Booking status changed successfully", result);
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
    const result = await dbc.dbUpdateData("bookings", id, { deleted: false });
    return ErrorManager.returnSuccess(200, "Booking enabled successfully", result);
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
    const result = await dbc.dbUpdateData("bookings", id, { deleted: true });
    return ErrorManager.returnSuccess(200, "Booking disabled successfully", result);
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
        result = await dbc.dbGetData("bookings", id);
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
 * Retrieves bookings from the database based on their status.
 * @param {string} [status="active"] - The status of bookings to retrieve ("all", "active", "inactive").
 * @returns {Promise<object[]>} An array of bookings or an error message.
 */
export async function getBookings(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("bookings");
        break;
      case "active":
        result = await dbc.dbGetWhere("bookings", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("bookings", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("bookingNotFound");
    }

    return ErrorManager.returnSuccess(200, "Bookings retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving bookings from the database: ${error.message}`);
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
    const result = await dbc.dbGetData("bookings", id);
    return result.deleted;
  } catch (error) {
    logger.error(`Error checking booking status in the database: ${error.message}`);
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
