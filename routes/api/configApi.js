import router from "express";
import * as config from "../../db/configController.js";

const api = router();
export default api;

// GET / - returns all configs
// GET /?key - returns a specific config if exists
api.get("/", async (req, res) => {
  const { key } = req.query;

  // If a key is provided, return a specific config, else return all configs
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

// POST / - creates a new config
api.post("/", async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ code: 400, message: "Key and value are required" });
  }

  try {
    const exists = await config.checkConfigExistence(key);
    if (!exists) {
      await config.setConfig(key, value);
      return res.status(201).json({ code: 201, message: "Config created correctly" });
    } else {
      return res.status(409).json({ code: 409, message: "Config already exists" });
    }
  } catch (error) {
    console.error("Error creating config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// PUT / - update an existing config (if required)
api.put("/", async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ code: 400, message: "Key and value are required" });
  }

  try {
    const exists = await config.checkConfigExistence(key);
    if (exists) {
      await config.updateConfig(key, value);
      return res.json({ code: 200, message: "Config updated correctly" });
    } else {
      return res.status(404).json({ code: 404, message: "Config not found" });
    }
  } catch (error) {
    console.error("Error updating config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// DELETE /?key - deletes a config
api.delete("/", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ code: 400, message: "Key is required" });
  }

  try {
    const exists = await config.checkConfigExistence(key);
    if (exists) {
      await config.deleteConfig(key);
      return res.json({ code: 200, message: "Config deleted correctly" });
    } else {
      return res.status(404).json({ code: 404, message: "Config not found" });
    }
  } catch (error) {
    console.error("Error deleting config:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});
