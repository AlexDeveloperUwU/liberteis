import { Router } from "express";
import * as config from "../../db/configService.js";
import ErrorManager from "../../errors/errorManager.js";

const api = Router();
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
  try {
    const { key } = req.query;

    if (key) {
      const existsResult = await config.checkConfigExistence(key);
      if (!existsResult.success) {
        return res.status(existsResult.code).json(existsResult);
      }

      if (!existsResult.data.exists) {
        return res.status(404).json(ErrorManager.returnError("configNotFound"));
      }

      const result = await config.getConfig(key);
      return res.status(result.code).json(result);
    } else {
      const result = await config.getConfigs();
      return res.status(result.code).json(result);
    }
  } catch (error) {
    console.error("Error fetching config:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
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
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const existsResult = await config.checkConfigExistence(key);
    if (!existsResult.success) {
      return res.status(existsResult.code).json(existsResult);
    }

    if (existsResult.data.exists) {
      return res.status(409).json(ErrorManager.returnError("dbDuplicateEntry"));
    }

    const result = await config.setConfig(key, value);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error creating config:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
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
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const existsResult = await config.checkConfigExistence(key);
    if (!existsResult.success) {
      return res.status(existsResult.code).json(existsResult);
    }

    if (!existsResult.data.exists) {
      return res.status(404).json(ErrorManager.returnError("configNotFound"));
    }

    const result = await config.updateConfig(key, value);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error updating config:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
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
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const existsResult = await config.checkConfigExistence(key);
    if (!existsResult.success) {
      return res.status(existsResult.code).json(existsResult);
    }

    if (!existsResult.data.exists) {
      return res.status(404).json(ErrorManager.returnError("configNotFound"));
    }

    const result = await config.deleteConfig(key);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error deleting config:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
