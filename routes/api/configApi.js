import router from "express";
import * as config from "../../db/configService.js";

const api = router();
export default api;

//! Basic CRUD operations

/**
 * @name GET /api/configs
 * @description Gets all configs or a specific config by key
 * @param {object} req - Express request object
 * @param {object} req.query - The query parameters
 * @param {string} [req.query.key] - Optional key to fetch specific config
 * @param {object} res - Express response object
 * @returns {object} JSON response with configs or error message
 */
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

/**
 * @name POST /api/configs
 * @description Creates a new config entry
 * @param {object} req - Express request object
 * @param {object} req.body - The request body
 * @param {string} req.body.key - The config key
 * @param {any} req.body.value - The config value
 * @param {object} res - Express response object
 * @returns {object} JSON response with success or error message
 */
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

/**
 * @name PUT /api/configs
 * @description Updates an existing config entry
 * @param {object} req - Express request object
 * @param {object} req.body - The request body
 * @param {string} req.body.key - The config key to update
 * @param {any} req.body.value - The new config value
 * @param {object} res - Express response object
 * @returns {object} JSON response with success or error message
 */
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

/**
 * @name DELETE /api/configs
 * @description Deletes a specific config entry
 * @param {object} req - Express request object
 * @param {object} req.query - The query parameters
 * @param {string} req.query.key - The config key to delete
 * @param {object} res - Express response object
 * @returns {object} JSON response with success or error message
 */
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
