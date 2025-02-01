import router from "express";
import * as config from "../../db/configService.js";

const api = router();
export default api;

//! Basic CRUD operations

// GET /api/configs
// Optionally receives a query string key
// If a key is provided, returns a specific config if exists, else returns all configs
// Uses the getConfig and getConfigs functions from configService
api.get("/", async (req, res) => {
  const { key } = req.query;

  try {
    if (key) {
      const exists = await config.checkConfigExistence(key);
      if (exists) {
        const response = await config.getConfig(key);
        return res.json({ code: 200, data: response });
      } else {
        return res.status(404).json({ code: 404, message: "Config not found" });
      }
    } else {
      const response = await config.getConfigs();
      return res.json({ code: 200, data: response });
    }
  } catch (error) {
    console.error("Error fetching config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// POST /api/configs
// Receives an object with the key and value of the config to add
// Uses the setConfig function from configService
api.post("/", async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ code: 400, message: "Key and value are required" });
  }

  try {
    const exists = await config.checkConfigExistence(key);
    if (!exists) {
      await config.setConfig(key, value);
      return res.status(201).json({ code: 201, message: "Config created successfully" });
    } else {
      return res.status(409).json({ code: 409, message: "Config already exists" });
    }
  } catch (error) {
    console.error("Error creating config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// PUT /api/configs
// Receives an object with the key and value of the config to update
// Uses the updateConfig function from configService
api.put("/", async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ code: 400, message: "Key and value are required" });
  }

  try {
    const exists = await config.checkConfigExistence(key);
    if (exists) {
      await config.updateConfig(key, value);
      return res.json({ code: 200, message: "Config updated successfully" });
    } else {
      return res.status(404).json({ code: 404, message: "Config not found" });
    }
  } catch (error) {
    console.error("Error updating config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// DELETE /api/configs
// Optionally receives a query string key
// If a key is provided, deletes the specific config
// Uses the deleteConfig function from configService
api.delete("/", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ code: 400, message: "Key is required" });
  }

  try {
    const exists = await config.checkConfigExistence(key);
    if (exists) {
      await config.deleteConfig(key);
      return res.json({ code: 200, message: "Config deleted successfully" });
    } else {
      return res.status(404).json({ code: 404, message: "Config not found" });
    }
  } catch (error) {
    console.error("Error deleting config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});
