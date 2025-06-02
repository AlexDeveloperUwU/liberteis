import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

/**
 * Adds a space to the database.
 * @param {Object} space - Object representing the space to add.
 * @returns {Promise<Object>} Operation result.
 */
export async function addSpace(space) {
  if (!space) {
    return { error: true, message: "Invalid parameters" };
  }

  space.id = await id.generateId("space");
  space.deleted = false;

  try {
    return await dbc.dbSaveData("spaces", space);
  } catch (error) {
    logger.error(`Error saving space to the database: ${error.message}`);
    throw new Error("Error saving space to the database");
  }
}

/**
 * Updates a space in the database.
 * @param {string} id - ID of the space to update.
 * @param {Object} space - Object with the updated space data.
 * @returns {Promise<Object>} Operation result.
 */
export async function updateSpace(id, space) {
  if (!id || !space) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const existingSpace = await getSpace(id, true);
    if (!existingSpace) {
      return { error: true, message: "Space not found" };
    }

    return await dbc.dbUpdateData("spaces", id, space);
  } catch (error) {
    logger.error(`Error updating space in the database: ${error.message}`);
    throw new Error("Error updating space in the database");
  }
}

/**
 * Changes the status of a space (enable/disable) in the database.
 * @param {string} id - ID of the space whose status will be changed.
 * @returns {Promise<Object>} Operation result.
 */
export async function changeSpaceStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const newStatus = !(await checkSpaceStatus(id));
    return await dbc.dbUpdateData("spaces", id, { deleted: newStatus });
  } catch (error) {
    logger.error(`Error changing space status in the database: ${error.message}`);
    throw new Error("Error changing space status in the database");
  }
}

/**
 * Enables a space in the database.
 * @param {string} id - ID of the space to enable.
 * @returns {Promise<Object>} Operation result.
 */
export async function enableSpace(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("spaces", id, { deleted: false });
  } catch (error) {
    logger.error(`Error enabling space in the database: ${error.message}`);
    throw new Error("Error enabling space in the database");
  }
}

/**
 * Disables a space in the database.
 * @param {string} id - ID of the space to disable.
 * @returns {Promise<Object>} Operation result.
 */
export async function disableSpace(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("spaces", id, { deleted: true });
  } catch (error) {
    logger.error(`Error disabling space in the database: ${error.message}`);
    throw new Error("Error disabling space in the database");
  }
}

/**
 * Gets a space from the database.
 * @param {string} id - ID of the space to retrieve.
 * @param {boolean} [includeInactive=false] - Whether to include inactive spaces.
 * @returns {Promise<Object>} Found space or error message.
 */
export async function getSpace(id, includeInactive = false) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetOne("spaces", id);
        break;
      case false:
        result = await dbc.dbGetWhere("spaces", [
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
        message: "Space with the required criteria not found",
      };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving space from the database: ${error.message}`);
    throw new Error("Error retrieving space from the database");
  }
}

/**
 * Gets a space by name from the database.
 * @param {string} name - Name of the space to retrieve.
 * @param {boolean} [includeInactive=false] - Whether to include inactive spaces.
 * @returns {Promise<Object>} Found space or error message.
 */
export async function getSpaceByName(name, includeInactive = false) {
  if (!name) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("spaces", [{ field: "name", operator: "=", value: name }]);
        break;
      case false:
        result = await dbc.dbGetWhere("spaces", [
          { field: "name", operator: "=", value: name },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Space with the required criteria not found",
      };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving space by name from the database: ${error.message}`);
    throw new Error("Error retrieving space by name from the database");
  }
}

/**
 * Gets all spaces from the database according to their status.
 * @param {string} [status="active"] - Status of spaces to retrieve ("all", "active", "inactive").
 * @returns {Promise<Object[]>} List of found spaces or error message.
 */
export async function getSpaces(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("spaces");
        break;
      case "active":
        result = await dbc.dbGetWhere("spaces", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("spaces", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Spaces with the required criteria not found",
      };
    }

    return result;
  } catch (error) {
    logger.error(`Error retrieving spaces from the database: ${error.message}`);
    throw new Error("Error retrieving spaces from the database");
  }
}

/**
 * Checks the status of a space in the database.
 * @param {string} id - ID of the space to check.
 * @returns {Promise<boolean>} Space status (true if deleted, false if active).
 */
export async function checkSpaceStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const space = await getSpace(id, true);
    return space.deleted;
  } catch (error) {
    logger.error(`Error checking space status in the database: ${error.message}`);
    throw new Error("Error checking space status in the database");
  }
}

/**
 * Checks if a space exists in the database.
 * @param {string} name - Name of the space to check.
 * @returns {Promise<Object>} Found space or error message.
 */
export async function checkSpaceExists(name) {
  if (!name) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const space = await getSpaceByName(name, true);
    return space;
  } catch (error) {
    logger.error(`Error checking space existence in the database: ${error.message}`);
    throw new Error("Error checking space existence in the database");
  }
}
