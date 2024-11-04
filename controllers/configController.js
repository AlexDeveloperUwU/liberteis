const db = require("./dbController.js");

async function addConfig(config) {
  const requiredFields = ["key", "value"];

  for (const field of requiredFields) {
    if (!config.hasOwnProperty(field) || config[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  db.setConfig(config.key, config.value);
}

async function getConfig(keyObj) {
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

async function updateConfig(config) {
  const requiredFields = ["key", "value"];

  for (const field of requiredFields) {
    if (!config.hasOwnProperty(field) || config[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  db.updateConfig(config.key, config.value);
}

async function deleteConfig(key) {
  const requiredFields = ["key"];

  for (const field of requiredFields) {
    if (!key.hasOwnProperty(field) || key[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  db.deleteConfig(key.key);
}

module.exports = {
  addConfig,
  getConfig,
  getAllConfigs,
  updateConfig,
  deleteConfig,
};
