import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";
import crypto from "crypto";

//! Basic CRUD operations

/**
 * Adds a booking to the database.
 * Supports single booking and recurring bookings.
 * @param {object} booking - The booking object to add.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function addBooking(booking) {
  if (!booking) {
    return ErrorManager.returnError("invalidParameters");
  }

  const spaceValidation = await validateSpaceForEvent(booking.eventId, booking.space);
  if (!spaceValidation.success) {
    return spaceValidation;
  }

  let bookingsToSave = [];
  let groupId = null;

  if (booking.recurrence) {
    if (!booking.recurrence.startDate || !booking.recurrence.endDate) {
      return ErrorManager.returnError("invalidParameters", "Recurrence missing start or end date");
    }

    groupId = crypto.randomUUID();
    const startDate = new Date(booking.recurrence.startDate);
    const endDate = new Date(booking.recurrence.endDate);
    const daysConfig = booking.recurrence.days || [];

    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      const jsDay = dt.getDay();

      const dayConfig = daysConfig.find((d) => parseInt(d.day) === jsDay);

      if (dayConfig && dayConfig.time) {
        const [hours, minutes] = dayConfig.time.split(":");
        const bookingDate = new Date(dt);
        bookingDate.setHours(hours, minutes, 0, 0);

        const newBooking = {
          eventId: booking.eventId,
          space: booking.space,
          info: booking.info,
          bookedBy: booking.bookedBy,
          bookingDate: toMySQLDateTime(bookingDate),
          id: await id.generateId("booking"),
          deleted: false,
          groupId: groupId,
        };
        bookingsToSave.push(newBooking);
      }
    }

    if (bookingsToSave.length === 0) {
      return ErrorManager.returnError("invalidParameters", "No bookings generated from recurrence pattern");
    }
  } else {
    if (!booking.bookingDate) {
      return ErrorManager.returnError("invalidParameters", "Missing booking date");
    }
    booking.id = await id.generateId("booking");
    booking.deleted = false;
    bookingsToSave.push(booking);
  }

  for (const b of bookingsToSave) {
    const availability = await checkSpaceAvailability(b.space, b.bookingDate, b.eventId);
    if (!availability.success) {
      return availability;
    }
  }

  try {
    for (const b of bookingsToSave) {
      await dbc.dbSaveData("bookings", b);
    }
    return ErrorManager.returnSuccess(201, "Booking(s) created successfully", {
      code: 201,
      count: bookingsToSave.length,
    });
  } catch (error) {
    logger.error(`Error saving booking to the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Updates a booking in the database.
 * Can update a single booking or a group of bookings (metadata only).
 * @param {string} id - The ID of the booking to update.
 * @param {object} booking - The updated booking object.
 * @param {string} [scope='single'] - 'single' or 'group'.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function updateBooking(id, booking, scope = "single") {
  if (!id || !booking) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const existingBookingResult = await getBooking(id, true);
    if (!existingBookingResult.success) {
      return ErrorManager.returnError("bookingNotFound");
    }
    const existingBooking = existingBookingResult.data;

    const eventId = booking.eventId || existingBooking.eventId;
    const space = booking.space || existingBooking.space;

    if (booking.eventId || booking.space) {
      const spaceValidation = await validateSpaceForEvent(eventId, space);
      if (!spaceValidation.success) {
        return spaceValidation;
      }
    }

    if (scope === "group" && existingBooking.groupId) {
      const fieldsToUpdate = {};
      if (booking.eventId) fieldsToUpdate.eventId = booking.eventId;
      if (booking.space) fieldsToUpdate.space = booking.space;
      if (booking.info !== undefined) fieldsToUpdate.info = booking.info;
      if (booking.bookedBy) fieldsToUpdate.bookedBy = booking.bookedBy;

      if (Object.keys(fieldsToUpdate).length === 0) {
        return ErrorManager.returnSuccess(200, "No fields to update");
      }

      if (booking.space || booking.eventId) {
        const groupBookings = await dbc.dbGetWhere("bookings", [
          { field: "groupId", operator: "=", value: existingBooking.groupId },
          { field: "deleted", operator: "=", value: false },
        ]);

        for (const gb of groupBookings) {
          const checkDate = gb.bookingDate;
          const availability = await checkSpaceAvailability(space, checkDate, eventId, gb.id);
          if (!availability.success) {
            return availability;
          }
        }
      }

      await dbc.dbUpdateWhere(
        "bookings",
        [{ field: "groupId", operator: "=", value: existingBooking.groupId }],
        fieldsToUpdate,
      );
      return ErrorManager.returnSuccess(200, "Booking group updated successfully", { code: 200 });
    } else {
      if (booking.bookingDate || booking.space || booking.eventId) {
        const bookingDate = booking.bookingDate || existingBooking.bookingDate;
        const availability = await checkSpaceAvailability(space, bookingDate, eventId, id);
        if (!availability.success) {
          return availability;
        }
      }

      await dbc.dbUpdateData("bookings", id, booking);
      return ErrorManager.returnSuccess(200, "Booking updated successfully", { code: 200 });
    }
  } catch (error) {
    logger.error(`Error updating booking in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Toggles the status of a booking (enabled/disabled).
 * @param {string} id - The ID of the booking to change status.
 * @param {string} [scope='single'] - 'single' or 'group'.
 * @returns {Promise<object>} The result of the operation or an error message.
 */
export async function changeBookingStatus(id, scope = "single") {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const existingBookingResult = await getBooking(id, true);
    if (!existingBookingResult.success) {
      return ErrorManager.returnError("bookingNotFound");
    }
    const existingBooking = existingBookingResult.data;
    const newStatus = !existingBooking.deleted;

    if (scope === "group" && existingBooking.groupId) {
      await dbc.dbUpdateWhere("bookings", [{ field: "groupId", operator: "=", value: existingBooking.groupId }], {
        deleted: newStatus,
      });
    } else {
      await dbc.dbUpdateData("bookings", id, { deleted: newStatus });
    }

    return ErrorManager.returnSuccess(200, "Booking status changed successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error changing booking status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Deletes a booking or group of bookings permanently or logically.
 * For this app, we use logical delete (toggle status), but providing DELETE method as requested.
 * @param {string} id
 * @param {string} scope
 */
export async function deleteBooking(id, scope = "single") {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }
  try {
    const existingBookingResult = await getBooking(id, true);
    if (!existingBookingResult.success) {
      return ErrorManager.returnError("bookingNotFound");
    }
    const existingBooking = existingBookingResult.data;

    if (scope === "group" && existingBooking.groupId) {
      await dbc.dbUpdateWhere("bookings", [{ field: "groupId", operator: "=", value: existingBooking.groupId }], {
        deleted: true,
      });
    } else {
      await dbc.dbUpdateData("bookings", id, { deleted: true });
    }
    return ErrorManager.returnSuccess(200, "Booking deleted successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error deleting booking: ${error.message}`);
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
 * @param {object} [filters={}] - Optional filters: { startMonth, endMonth, startDate, endDate }
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

    if (filters.startDate) {
      conditions.push({ field: "bookingDate", operator: ">=", value: filters.startDate });
    }
    if (filters.endDate) {
      conditions.push({ field: "bookingDate", operator: "<=", value: filters.endDate });
    }

    if (!filters.startDate && !filters.endDate && (filters.startMonth || filters.endMonth)) {
      let startDateMonth = null;
      let endDateMonth = null;
      if (filters.startMonth) {
        const [sm, sy] = filters.startMonth.split("/");
        startDateMonth = new Date(Number(`20${sy.length === 2 ? sy : "0" + sy}`), Number(sm) - 1, 1, 0, 0, 0, 0);
      }
      if (filters.endMonth) {
        const [em, ey] = filters.endMonth.split("/");
        endDateMonth = new Date(Number(`20${ey.length === 2 ? ey : "0" + ey}`), Number(em), 0, 23, 59, 59, 999);
      }
      if (startDateMonth) {
        conditions.push({ field: "bookingDate", operator: ">=", value: startDateMonth.toISOString() });
      }
      if (endDateMonth) {
        conditions.push({ field: "bookingDate", operator: "<=", value: endDateMonth.toISOString() });
      }
    }

    if (conditions.length > 0) {
      result = await dbc.dbGetWhere("bookings", conditions);
    } else {
      result = await dbc.dbGetAll("bookings");
    }

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
    const eventResult = await dbc.dbGetOne("events", eventId);
    if (eventResult.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }
    const event = eventResult[0];

    const categoryResult = await dbc.dbGetOne("categories", event.category);
    if (categoryResult.length === 0) {
      return ErrorManager.returnError("categoryNotFound");
    }
    const category = categoryResult[0];

    let categorySpaces;
    try {
      categorySpaces = typeof category.spaces === "string" ? JSON.parse(category.spaces) : category.spaces;
    } catch (error) {
      logger.error(`Error parsing category spaces: ${error.message}`);
      return ErrorManager.returnError("invalidCategoryData");
    }

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
    const eventResult = await dbc.dbGetOne("events", eventId);
    if (eventResult.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }
    const event = eventResult[0];
    const duration = event.duration || 30;

    const startTime = new Date(bookingDate);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const conditions = [
      { field: "space", operator: "=", value: spaceId },
      { field: "deleted", operator: "=", value: false },
    ];

    if (excludeBookingId) {
      conditions.push({ field: "id", operator: "!=", value: excludeBookingId });
    }

    const existingBookings = await dbc.dbGetWhere("bookings", conditions);

    for (const booking of existingBookings) {
      const existingEventResult = await dbc.dbGetOne("events", booking.eventId);
      if (existingEventResult.length === 0) continue;

      const existingEvent = existingEventResult[0];
      const existingDuration = existingEvent.duration || 30;

      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

      if (startTime < existingEnd && endTime > existingStart) {
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
        resultData = { total: total.length };
        break;
      }
      case "done": {
        const doneFilters = [...baseFilters, { field: "bookingDate", operator: "<", value: currentDate }];
        const hechos = await dbc.dbGetWhere("bookings", doneFilters);
        resultData = { done: hechos.length };
        break;
      }
      case "pending": {
        const pendingFilters = [...baseFilters, { field: "bookingDate", operator: ">", value: currentDate }];
        const porHacer = await dbc.dbGetWhere("bookings", pendingFilters);
        resultData = { toDo: porHacer.length };
        break;
      }
      case null: {
        const total = await dbc.dbGetWhere("bookings", baseFilters);
        const doneFilters = [...baseFilters, { field: "bookingDate", operator: "<", value: currentDate }];
        const hechos = await dbc.dbGetWhere("bookings", doneFilters);
        const pendingFilters = [...baseFilters, { field: "bookingDate", operator: ">", value: currentDate }];
        const porHacer = await dbc.dbGetWhere("bookings", pendingFilters);
        resultData = {
          total: total.length,
          done: hechos.length,
          todo: porHacer.length,
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

/**
 * Helper: format ISO string to MySQL DateTime
 */
function toMySQLDateTime(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}
