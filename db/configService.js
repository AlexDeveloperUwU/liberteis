import * as dbc from "./dbController.js";
import { logger } from "../utils/logger.js";

/**
 * Adds a configuration to the database.
 * @param {string} key - The key of the configuration.
 * @param {any} value - The value of the configuration.
 * @returns {Promise<object>} The result of the operation or an error object.
 */
export async function setConfig(key, value) {
  if (!key || !value) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbSaveData("config", { id: key, value: value });
  } catch (error) {
    logger.error(`Error saving config to the database: ${error.message}`);
    throw new Error("Error saving config to the database");
  }
}

/**
 * Updates a configuration in the database.
 * @param {string} key - The key of the configuration.
 * @param {any} value - The new value of the configuration.
 * @returns {Promise<object>} The result of the operation or an error object.
 */
export async function updateConfig(key, value) {
  if (!key || !value) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("config", key, { value: value });
  } catch (error) {
    logger.error(`Error updating config in the database: ${error.message}`);
    throw new Error("Error updating config in the database");
  }
}

/**
 * Deletes a configuration from the database.
 * @param {string} key - The key of the configuration to delete.
 * @returns {Promise<object>} The result of the operation or an error object.
 */
export async function deleteConfig(key) {
  if (!key) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbDeleteData("config", key);
  } catch (error) {
    logger.error(`Error deleting config from the database: ${error.message}`);
    throw new Error("Error deleting config from the database");
  }
}

/**
 * Retrieves a configuration from the database.
 * @param {string} key - The key of the configuration to retrieve.
 * @returns {Promise<object>} The configuration object or an error object.
 */
export async function getConfig(key) {
  if (!key) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const result = await dbc.dbGetOne("config", key);
    return result[0];
  } catch (error) {
    logger.error(`Error retrieving config from the database: ${error.message}`);
    throw new Error("Error retrieving config from the database");
  }
}

/**
 * Retrieves all configurations from the database.
 * @returns {Promise<object[]>} An array of all configuration objects.
 */
export async function getConfigs() {
  try {
    return await dbc.dbGetAll("config");
  } catch (error) {
    logger.error(`Error retrieving configs from the database: ${error.message}`);
    throw new Error("Error retrieving configs from the database");
  }
}

/**
 * Checks if a configuration exists in the database.
 * @param {string} key - The key of the configuration to check.
 * @returns {Promise<boolean>} True if the configuration exists, false otherwise.
 */
export async function checkConfigExistence(key) {
  if (!key) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbCheckExistence("config", key);
  } catch (error) {
    logger.error(`Error checking config in the database: ${error.message}`);
    throw new Error("Error checking config in the database");
  }
}
