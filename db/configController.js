import * as dbc from "./dbController.js";

export async function setConfig(key, value) {
  return await dbc.dbSaveData("config", { id: key, value: value });
}

export async function getConfig(key) {
  return await dbc.dbGetOne("config", key);
}

export async function getConfigs() {
  return await dbc.dbGetAll("config");
}

export async function updateConfig(key, value) {
  return await dbc.dbUpdateData("config", key, { value: value });
}

export async function deleteConfig(key) {
  return await dbc.dbDeleteData("config", key);
}
