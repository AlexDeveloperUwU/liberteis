import * as dbc from "./dbController.js";
import { logger } from "../utils/logger.js";

//! Basic CRUD operations

// Function to add a config to the database
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

// Function to update a config in the database
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

// Function to delete a config from the database
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

// Function to get a config from the database
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

// Function to get all configs from the database
export async function getConfigs() {
  try {
    return await dbc.dbGetAll("config");
  } catch (error) {
    logger.error(`Error retrieving configs from the database: ${error.message}`);
    throw new Error("Error retrieving configs from the database");
  }
}

// Function to check if a config exists in the database
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
