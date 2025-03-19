import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

//! Basic CRUD operations

// Function to add a booking to the database
export async function addBooking(booking) {
  if (!booking) {
    return { error: true, message: "Invalid parameters" };
  }

  booking.id = await id.generateId("booking");
  booking.status = "active";
  booking.deleted = false;

  try {
    return await dbc.dbSaveData("bookings", booking);
  } catch (error) {
    logger.error(`Error saving booking to the database: ${error.message}`);
    throw new Error("Error saving booking to the database");
  }
}

// Function to update a booking in the database
export async function updateBooking(id, booking) {
  if (!id || !booking) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("bookings", id, booking);
  } catch (error) {
    logger.error(`Error updating booking in the database: ${error.message}`);
    throw new Error("Error updating booking in the database");
  }
}

// Function to enable or disable a booking in the database
export async function changeBookingStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const newStatus = !(await checkBookingStatus(id));
    return await dbc.dbUpdateData("bookings", id, { deleted: newStatus });
  } catch (error) {
    logger.error(`Error changing booking status in the database: ${error.message}`);
    throw new Error("Error changing booking status in the database");
  }
}

// Function to enable a booking in the database
export async function enableBooking(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("bookings", id, { deleted: false });
  } catch (error) {
    logger.error(`Error enabling booking in the database: ${error.message}`);
    throw new Error("Error enabling booking in the database");
  }
}

// Function to disable a booking in the database
export async function disableBooking(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("bookings", id, { deleted: true });
  } catch (error) {
    logger.error(`Error disabling booking in the database: ${error.message}`);
    throw new Error("Error disabling booking in the database");
  }
}

//! Info retrieval operations

// Function to get a booking from the database
// It includes the option to include inactive bookings
export async function getBooking(id, includeInactive = false) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
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
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "Booking with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving booking from the database: ${error.message}`);
    throw new Error("Error retrieving booking from the database");
  }
}

// Function to get a booking by event ID and date from the database
// It includes the option to include inactive bookings
export async function getBookingByEventAndDate(eventId, bookingDate, includeInactive = false) {
  if (!eventId || !bookingDate) {
    return { error: true, message: "Invalid parameters" };
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
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "Booking with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving booking by event and date from the database: ${error.message}`);
    throw new Error("Error retrieving booking by event and date from the database");
  }
}

// Function to get all bookings from the database
// It can return: all, active (DEFAULT) or inactive bookings
export async function getBookings(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetData("bookings");
        break;
      case "active":
        result = await dbc.dbGetWhere("bookings", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("bookings", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "Booking with the required criteria not found" };
    }

    return result;
  } catch (error) {
    logger.error(`Error retrieving bookings from the database: ${error.message}`);
    throw new Error("Error retrieving bookings from the database");
  }
}

// Function to check a booking's status
export async function checkBookingStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const result = await dbc.dbGetData("bookings", id);
    return result.deleted;
  } catch (error) {
    logger.error(`Error checking booking status in the database: ${error.message}`);
    throw new Error("Error checking booking status in the database");
  }
}
