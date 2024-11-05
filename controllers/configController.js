const db = require("./dbController.js");

function validateConfigObj(configObj) {
  if (typeof configObj !== "object" || configObj === null) {
    throw new Error("Invalid input: Expected an object with 'key' and 'value' properties.");
  }
  if (typeof configObj.key !== "string" || configObj.key.trim() === "") {
    throw new Error("Invalid key: 'key' must be a non-empty string.");
  }
  if (typeof configObj.value !== "string" || configObj.value.trim() === "") {
    throw new Error("Invalid value: 'value' must be a non-empty string.");
  }
}

function validateKeyObj(keyObj) {
  if (typeof keyObj !== "object" || keyObj === null || typeof keyObj.key !== "string" || keyObj.key.trim() === "") {
    throw new Error("Invalid key: 'key' must be a non-empty string.");
  }
}

async function addConfig(configObj) {
  validateConfigObj(configObj);
  await db.setConfig(configObj.key, configObj.value);
}

async function getConfig(keyObj) {
  validateKeyObj(keyObj);
  const key = keyObj.key;
  return await db.getConfig(key);
}

async function getAllConfigs() {
  return await db.getAllConfig();
}

async function updateConfig(configObj) {
  validateConfigObj(configObj);
  await db.updateConfig(configObj.key, configObj.value);
}

async function deleteConfig(keyObj) {
  validateKeyObj(keyObj);
  await db.deleteConfig(keyObj.key);
}

module.exports = {
  addConfig,
  getConfig,
  getAllConfigs,
  updateConfig,
  deleteConfig,
};
