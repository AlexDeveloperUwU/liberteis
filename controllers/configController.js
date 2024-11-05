const db = require("./dbController.js");

async function addConfig(configObj) {
  const requiredFields = ["key", "value"];

  for (const field of requiredFields) {
    if (!configObj.hasOwnProperty(field) || configObj[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  db.setConfig(configObj.key, configObj.value);
}

async function getConfig(keyObj) {

  if (typeof keyObj !== "object" || keyObj === null) {
    throw new Error("Invalid input: keyObj should be a non-null object");
  }

  keyObj = Object.assign({}, keyObj);

  const requiredFields = ["key"];

  for (const field of requiredFields) {
    if (!keyObj.hasOwnProperty(field) || keyObj[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  const key = keyObj.key;
  return db.getConfig(key);
}

async function getAllConfigs() {
  return db.getAllConfig();
}

async function updateConfig(configObj) {
  const requiredFields = ["key", "value"];

  for (const field of requiredFields) {
    if (!configObj.hasOwnProperty(field) || configObj[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  db.updateConfig(configObj.key, configObj.value);
}

async function deleteConfig(keyObj) {
  const requiredFields = ["key"];

  for (const field of requiredFields) {
    if (!keyObj.hasOwnProperty(field) || keyObj[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  db.deleteConfig(keyObj.key);
}

module.exports = {
  addConfig,
  getConfig,
  getAllConfigs,
  updateConfig,
  deleteConfig,
};
