import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

//! Basic CRUD operations

/**
 * Adds an event to the database.
 * @param {Object} event - Object representing the event to add.
 * @returns {Promise<Object>} Operation result.
 */
export async function addEvent(event) {
  if (!event) {
    return ErrorManager.returnError("invalidParameters");
  }

  event.id = await id.generateId("event");

  try {
    await dbc.dbSaveData("events", event);
    return ErrorManager.returnSuccess(201, "Event created successfully", { code: 201 });
  } catch (error) {
    logger.error(`Error saving event to the database: ${error.message}`);
    return ErrorManager.returnError("eventSaveError");
  }
}

/**
 * Updates an event in the database.
 * @param {string} id - ID of the event to update.
 * @param {Object} event - Object with the updated event data.
 * @returns {Promise<Object>} Operation result.
 */
export async function updateEvent(id, event) {
  if (!id || !event) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    await dbc.dbUpdateData("events", id, event);
    return ErrorManager.returnSuccess(200, "Event updated successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error updating event in the database: ${error.message}`);
    return ErrorManager.returnError("eventUpdateError");
  }
}

/**
 * Changes the enabled/disabled status of an event in the database.
 * @param {string} id - ID of the event whose status will be changed.
 * @returns {Promise<Object>} Operation result.
 */
export async function changeEventStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const newStatus = !(await checkEventStatus(id));
    await dbc.dbUpdateData("events", id, { deleted: newStatus });
    return ErrorManager.returnSuccess(200, "Event status changed successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error changing event status in the database: ${error.message}`);
    return ErrorManager.returnError("eventStatusChangeError");
  }
}

//! Info retrieval operations

/**
 * Gets an event from the database.
 * @param {string} id - ID of the event to retrieve.
 * @param {boolean} [includeInactive=false] - Indicates whether to include inactive events.
 * @returns {Promise<Object>} Found event or error message.
 */
export async function getEvent(id, includeInactive = false) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetData("events", id);
        break;
      case false:
        result = await dbc.dbGetWhere("events", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }

    return ErrorManager.returnSuccess(200, "Event retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error getting event from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets an event by title from the database.
 * @param {string} title - Title of the event to search for.
 * @param {boolean} [includeInactive=false] - Indicates whether to include inactive events.
 * @returns {Promise<Object>} Found event or error message.
 */
export async function getEventByTitle(title, includeInactive = false) {
  if (!title) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("events", [{ field: "title", operator: "=", value: title }]);
        break;
      case false:
        result = await dbc.dbGetWhere("events", [
          { field: "title", operator: "=", value: title },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }

    return ErrorManager.returnSuccess(200, "Event retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error getting event by title from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets all events from the database according to the specified status.
 * @param {string} [status="active"] - Status of events to retrieve ("all", "active", "inactive").
 * @returns {Promise<Array>} List of found events or error message.
 */
export async function getEvents(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("events");
        break;
      case "active":
        result = await dbc.dbGetWhere("events", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("events", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("eventNotFound");
    }

    return ErrorManager.returnSuccess(200, "Events retrieved successfully", result);
  } catch (error) {
    logger.error(`Error getting events from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Checks the status of an event in the database.
 * @param {string} id - ID of the event to check.
 * @returns {Promise<boolean>} Event status (true if deleted, false if not).
 */
export async function checkEventStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await getEvent(id, true);
    if (result.success === false) {
      return false;
    }
    return result.data.deleted;
  } catch (error) {
    logger.error(`Error checking event status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Checks if an event exists in the database.
 * @param {string} title - Title of the event to check.
 * @returns {Promise<boolean>} True if the event exists, false otherwise.
 */
export async function checkEventExists(title) {
  if (!title) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await getEventByTitle(title, true);
    return result.success;
  } catch (error) {
    logger.error(`Error checking event existence in the database: ${error.message}`);
    return false;
  }
}
