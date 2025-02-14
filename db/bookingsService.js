import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add a booking to the database
export async function addBooking(booking) {
  if (!booking) {
    throw new Error("Invalid parameters");
  }

  booking.id = await id.generateId("booking");
  booking.status = "active";
  booking.deleted = false;

  try {
    return await dbc.dbSaveData("bookings", booking);
  } catch (error) {
    throw new Error("Error saving booking to the database");
  }
}

// Function to update a booking in the database
export async function updateBooking(id, booking) {
  if (!id || !booking) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("bookings", id, booking);
  } catch (error) {
    throw new Error("Error updating booking in the database");
  }
}

// Function to enable or disable a booking in the database
export async function changeBookingStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const newStatus = !(await checkBookingStatus(id));
    return await dbc.dbUpdateData("bookings", id, { deleted: newStatus });
  } catch (error) {
    throw new Error("Error changing booking status in the database");
  }
}

// Function to enable a booking in the database
export async function enableBooking(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("bookings", id, { deleted: false });
  } catch (error) {
    throw new Error("Error enabling booking in the database");
  }
}

// Function to disable a booking in the database
export async function disableBooking(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("bookings", id, { deleted: true });
  } catch (error) {
    throw new Error("Error disabling booking in the database");
  }
}

//! Info retrieval operations

// Function to get a booking from the database
// It includes the option to include inactive bookings
export async function getBooking(id, includeInactive = false) {
  if (!id) {
    throw new Error("Invalid parameters");
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
        throw new Error("Invalid parameters");
    }
  } catch (error) {}
}

// Function to get a booking by name from thse database
// It includes the option to include inactive bookings
export async function getBookingByName(name, includeInactive = false) {
  if (!name) {
    throw new Error("Invalid parameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("bookings", [{ field: "name", operator: "=", value: name }]);
        break;
      case false:
        result = await dbc.dbGetWhere("bookings", [
          { field: "name", operator: "=", value: name },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Booking with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error getting booking from the database");
  }
}

// Function to get all bookings from the database
// It can return: all, active (DEFAULT) or inactive bookings
export async function getBookings(status) {
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
        throw new Error("Invalid parameters");
    }

    return result;
  } catch (error) {
    throw new Error("Error getting bookings from the database");
  }
}

// Function to check a booking's status
export async function checkBookingStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const result = await dbc.dbGetData("bookings", id);
    return result.deleted;
  } catch (error) {
    throw new Error("Error getting booking status from the database");
  }
}
