import * as dbc from "./dbController.js";

//! Basic CRUD operations

// Function to add a config to the database
export async function setConfig(key, value) {
  if (!key || !value) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbSaveData("config", { id: key, value: value });
  } catch (error) {
    throw new Error("Error saving config to the database");
  }
}

// Function to update a config in the database
export async function updateConfig(key, value) {
  if (!key || !value) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("config", key, { value: value });
  } catch (error) {
    throw new Error("Error updating config in the database");
  }
}

// Function to delete a config from the database
export async function deleteConfig(key) {
  if (!key) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbDeleteData("config", key);
  } catch (error) {
    throw new Error("Error deleting config from the database");
  }
}

// Function to get a config from the database
export async function getConfig(key) {
  if (!key) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbGetOne("config", key);
  } catch (error) {
    throw new Error("Error retrieving config from the database");
  }
}

// Function to get all configs from the database
export async function getConfigs() {
  if (!key) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbGetAll("config");
  } catch (error) {
    throw new Error("Error retrieving configs from the database");
  }
}

// Function to check if a config exists in the database
export async function checkConfigExistence(key) {
  if (!key) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbExists("config", key);
  } catch (error) {
    throw new Error("Error checking config in the database");
  }
}
