import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

/**
 * Adds a space to the database.
 * @param {Object} space - Object representing the space to add.
 * @returns {Promise<Object>} Operation result.
 */
export async function addSpace(space) {
  if (!space) {
    return ErrorManager.returnError("invalidParameters");
  }

  space.id = await id.generateId("space");
  space.deleted = false;

  try {
    await dbc.dbSaveData("spaces", space);
    return ErrorManager.returnSuccess(201, "Space created successfully", { code: 201 });
  } catch (error) {
    logger.error(`Error saving space to the database: ${error.message}`);
    return ErrorManager.returnError("spaceSaveError");
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
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const existingSpace = await getSpace(id, true);
    if (!existingSpace.success) {
      return ErrorManager.returnError("spaceNotFound");
    }

    await dbc.dbUpdateData("spaces", id, space);
    return ErrorManager.returnSuccess(200, "Space updated successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error updating space in the database: ${error.message}`);
    return ErrorManager.returnError("spaceUpdateError");
  }
}

/**
 * Changes the status of a space (enable/disable) in the database.
 * @param {string} id - ID of the space whose status will be changed.
 * @returns {Promise<Object>} Operation result.
 */
export async function toggleSpaceStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const currentSpace = await getSpace(id, true);
    if (!currentSpace.success) {
      return ErrorManager.returnError("spaceNotFound");
    }

    const newStatus = !currentSpace.data.deleted;
    await dbc.dbUpdateData("spaces", id, { deleted: newStatus });
    return ErrorManager.returnSuccess(200, "Space status changed successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error changing space status in the database: ${error.message}`);
    return ErrorManager.returnError("spaceStatusChangeError");
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
    return ErrorManager.returnError("invalidParameters");
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
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("spaceNotFound");
    }

    return ErrorManager.returnSuccess(200, "Space retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error retrieving space from the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("spaceNotFound");
    }

    return ErrorManager.returnSuccess(200, "Spaces retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving spaces from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets a space count summary.
 * @param {string} [type="null"] - Status of spaces to count ("all", "active", "inactive").
 * @return {Promise<Object>} Summary of spaces count by status.
 */
export async function getSpacesCount(type = "null") {
  try {
    let resultData;
    switch (type) {
      case "all": {
        resultData = await dbc.dbGetAll("spaces");
        break;
      }

      case "active": {
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activeSpaces = await dbc.dbGetWhere("spaces", activeFilters);
        resultData = { active: activeSpaces.length };
        break;
      }
      case "inactive": {
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactiveSpaces = await dbc.dbGetWhere("spaces", inactiveFilters);
        resultData = { inactive: inactiveSpaces.length };
        break;
      }

      case "null": {
        const totalSpaces = await dbc.dbGetAll("spaces");
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activeSpaces = await dbc.dbGetWhere("spaces", activeFilters);
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactiveSpaces = await dbc.dbGetWhere("spaces", inactiveFilters);
        resultData = {
          total: totalSpaces.length,
          active: activeSpaces.length,
          inactive: inactiveSpaces.length,
        };
        break;
      }
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    return ErrorManager.returnSuccess(200, "Spaces count retrieved successfully", resultData);
  } catch (error) {
    logger.error(`Error retrieving spaces count from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
