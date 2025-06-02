import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

//! Basic CRUD operations

/**
 * Adds an event to the database.
 * @param {Object} event - Object representing the event to add.
 * @returns {Promise<Object>} Operation result.
 */
export async function addEvent(event) {
  if (!event) {
    return { error: true, message: "Invalid parameters" };
  }

  event.id = await id.generateId("event");

  try {
    return await dbc.dbSaveData("events", event);
  } catch (error) {
    logger.error(`Error saving event to the database: ${error.message}`);
    throw new Error("Error saving event to the database");
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
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("events", id, event);
  } catch (error) {
    logger.error(`Error updating event in the database: ${error.message}`);
    throw new Error("Error updating event in the database");
  }
}

/**
 * Changes the enabled/disabled status of an event in the database.
 * @param {string} id - ID of the event whose status will be changed.
 * @returns {Promise<Object>} Operation result.
 */
export async function changeEventStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const newStatus = !(await checkEventStatus(id));
    return await dbc.dbUpdateData("events", id, { deleted: newStatus });
  } catch (error) {
    logger.error(`Error changing event status in the database: ${error.message}`);
    throw new Error("Error changing event status in the database");
  }
}

/**
 * Enables an event in the database.
 * @param {string} id - ID of the event to enable.
 * @returns {Promise<Object>} Operation result.
 */
export async function enableEvent(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("events", id, { deleted: false });
  } catch (error) {
    logger.error(`Error enabling event in the database: ${error.message}`);
    throw new Error("Error enabling event in the database");
  }
}

/**
 * Disables an event in the database.
 * @param {string} id - ID of the event to disable.
 * @returns {Promise<Object>} Operation result.
 */
export async function disableEvent(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("events", id, { deleted: true });
  } catch (error) {
    logger.error(`Error disabling event in the database: ${error.message}`);
    throw new Error("Error disabling event in the database");
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
    return { error: true, message: "Invalid parameters" };
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
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Event with the required criteria not found",
      };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error getting event from the database: ${error.message}`);
    throw new Error("Error getting event from the database");
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
    return { error: true, message: "Invalid parameters" };
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
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Event with the required criteria not found",
      };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error getting event by title from the database: ${error.message}`);
    throw new Error("Error getting event by title from the database");
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
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Events with the required criteria not found",
      };
    }

    return result;
  } catch (error) {
    logger.error(`Error getting events from the database: ${error.message}`);
    throw new Error("Error getting events from the database");
  }
}

/**
 * Checks the status of an event in the database.
 * @param {string} id - ID of the event to check.
 * @returns {Promise<boolean>} Event status (true if deleted, false if not).
 */
export async function checkEventStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const result = await getEvent(id, true);
    return result.deleted;
  } catch (error) {
    logger.error(`Error checking event status in the database: ${error.message}`);
    throw new Error("Error checking event status in the database");
  }
}

/**
 * Checks if an event exists in the database.
 * @param {string} title - Title of the event to check.
 * @returns {Promise<boolean>} True if the event exists, false otherwise.
 */
export async function checkEventExists(title) {
  if (!title) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    await getEventByTitle(title, true);
    return true;
  } catch (error) {
    logger.error(`Error checking event existence in the database: ${error.message}`);
    return false;
  }
}
