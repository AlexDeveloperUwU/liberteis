import * as dbc from "./dbController.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

/**
 * Adds a configuration to the database.
 * @param {string} key - The key of the configuration.
 * @param {any} value - The value of the configuration.
 * @returns {Promise<object>} The result of the operation or an error object.
 */
export async function setConfig(key, value) {
  if (!key || value === undefined) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbSaveData("config", { id: key, value: value });
    return ErrorManager.returnSuccess(201, "Configuration created successfully", result);
  } catch (error) {
    logger.error(`Error saving config to the database: ${error.message}`);
    return ErrorManager.returnError("configSaveError");
  }
}

/**
 * Updates a configuration in the database.
 * @param {string} key - The key of the configuration.
 * @param {any} value - The new value of the configuration.
 * @returns {Promise<object>} The result of the operation or an error object.
 */
export async function updateConfig(key, value) {
  if (!key || value === undefined) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbUpdateData("config", key, { value: value });
    return ErrorManager.returnSuccess(200, "Configuration updated successfully", result);
  } catch (error) {
    logger.error(`Error updating config in the database: ${error.message}`);
    return ErrorManager.returnError("configUpdateError");
  }
}

/**
 * Deletes a configuration from the database.
 * @param {string} key - The key of the configuration to delete.
 * @returns {Promise<object>} The result of the operation or an error object.
 */
export async function deleteConfig(key) {
  if (!key) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbDeleteData("config", key);
    return ErrorManager.returnSuccess(200, "Configuration deleted successfully", result);
  } catch (error) {
    logger.error(`Error deleting config from the database: ${error.message}`);
    return ErrorManager.returnError("configDeleteError");
  }
}

/**
 * Retrieves a configuration from the database.
 * @param {string} key - The key of the configuration to retrieve.
 * @returns {Promise<object>} The configuration object or an error object.
 */
export async function getConfig(key) {
  if (!key) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbGetOne("config", key);
    if (result.length === 0) {
      return ErrorManager.returnError("configNotFound");
    }
    return ErrorManager.returnSuccess(200, "Configuration retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error retrieving config from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Retrieves all configurations from the database.
 * @returns {Promise<object[]>} An array of all configuration objects.
 */
export async function getConfigs() {
  try {
    const result = await dbc.dbGetAll("config");
    if (result.length === 0) {
      return ErrorManager.returnError("configNotFound");
    }
    return ErrorManager.returnSuccess(200, "Configurations retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving configs from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Checks if a configuration exists in the database.
 * @param {string} key - The key of the configuration to check.
 * @returns {Promise<boolean>} True if the configuration exists, false otherwise.
 */
export async function checkConfigExistence(key) {
  if (!key) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const exists = await dbc.dbCheckExistence("config", key);
    return ErrorManager.returnSuccess(200, "Configuration existence checked", { exists });
  } catch (error) {
    logger.error(`Error checking config in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
