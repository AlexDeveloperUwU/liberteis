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
  event.deleted = false;

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
    const existingEvent = await getEvent(id, true);
    if (!existingEvent.success) {
      return ErrorManager.returnError("eventNotFound");
    }

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
    const eventStatus = await getEventStatus(id);
    if (typeof eventStatus !== 'boolean') {
      return eventStatus;
    }

    await dbc.dbUpdateData("events", id, { deleted: !eventStatus });
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
        result = await dbc.dbGetOne("events", id);
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
 * @param {string} [userId=null] - Optional user ID to filter events by specific user.
 * @returns {Promise<Array>} List of found events or error message.
 */
export async function getEvents(status = "active", userId = null) {
  let result;

  try {
    let conditions = [];
    
    switch (status) {
      case "all":
        if (userId) {
          conditions = [{ field: "createdBy", operator: "=", value: userId }];
          result = await dbc.dbGetWhere("events", conditions);
        } else {
          result = await dbc.dbGetAll("events");
        }
        break;
      case "active":
        conditions = [{ field: "deleted", operator: "=", value: false }];
        if (userId) {
          conditions.push({ field: "createdBy", operator: "=", value: userId });
        }
        result = await dbc.dbGetWhere("events", conditions);
        break;
      case "inactive":
        conditions = [{ field: "deleted", operator: "=", value: true }];
        if (userId) {
          conditions.push({ field: "createdBy", operator: "=", value: userId });
        }
        result = await dbc.dbGetWhere("events", conditions);
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
 * Gets the status of an event in the database.
 * @param {string} id - ID of the event to check.
 * @returns {Promise<boolean>} Event status (true if deleted, false if not).
 */
export async function getEventStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const event = await getEvent(id, true);
    if (event.success === false) {
      return false;
    }
    return event.data.deleted;
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

/**
 * Gets events by category ID from the database.
 * @param {string} categoryId - ID of the category to filter events by.
 * @param {boolean} [includeInactive=false] - Whether to include inactive events.
 * @returns {Promise<Object>} Found events or error message.
 */
export async function getEventsByCategory(categoryId, includeInactive = false) {
  if (!categoryId) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("events", [{ field: "category", operator: "=", value: categoryId }]);
        break;
      case false:
        result = await dbc.dbGetWhere("events", [
          { field: "category", operator: "=", value: categoryId },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnSuccess(200, "No events found for this category", []);
    }

    return ErrorManager.returnSuccess(200, "Events retrieved successfully", result);
  } catch (error) {
    logger.error(`Error getting events by category from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets a event count summary.
 * @param {string} [type="null"] - Status of events to count ("all", "active", "inactive").
 * @return {Promise<Object>} Summary of events count by status.
 */
export async function getEventsCount(type = "null") {
  try {
    let resultData;
    switch (type) {
      case "all": {
        resultData = await dbc.dbGetAll("events");
        break;
      }

      case "active": {
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activeEvents = await dbc.dbGetWhere("events", activeFilters);
        resultData = { active: activeEvents.length };
        break;
      }
      case "inactive": {
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactiveEvents = await dbc.dbGetWhere("events", inactiveFilters);
        resultData = { inactive: inactiveEvents.length };
        break;
      }

      case "null": {
        const totalEvents = await dbc.dbGetAll("events");
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activeEvents = await dbc.dbGetWhere("events", activeFilters);
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactiveEvents = await dbc.dbGetWhere("events", inactiveFilters);
        resultData = {
          total: totalEvents.length,
          active: activeEvents.length,
          inactive: inactiveEvents.length,
        };
        break;
      }
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    return ErrorManager.returnSuccess(200, "Events count retrieved successfully", resultData);
  } catch (error) {
    logger.error(`Error retrieving events count from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
