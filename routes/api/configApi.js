import { Router } from "express";
import * as config from "../../db/configService.js";
import ErrorManager from "../../errors/errorManager.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { logger } from "../../utils/logger.js";

const api = Router();
export default api;

/**
 * Config keys that must never be exposed to a non-admin caller of GET /api/config.
 */
const SENSITIVE_CONFIG_KEYS = ["mailUser", "mailPassword"];

/**
 * Redacts a config row before it's sent to the client. `mailPassword` is never
 * returned in full (even to an admin) since it's encrypted at rest and only meant
 * to be overwritten, not read back.
 * @param {{id: string, value: string}} row - The config row.
 * @returns {{id: string, value: string}} The (possibly redacted) row.
 */
function redactConfigRow(row) {
  if (row.id === "mailPassword") {
    return { ...row, value: row.value ? "set" : "" };
  }
  return row;
}

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
    const isAdmin = req._reqUser?.type === "adminUser";

    if (key) {
      if (SENSITIVE_CONFIG_KEYS.includes(key) && !isAdmin) {
        return res.status(403).json(ErrorManager.returnError("forbiddenAdminOnly"));
      }

      const existsResult = await config.checkConfigExistence(key);
      if (!existsResult.success) {
        return res.status(existsResult.code).json(existsResult);
      }

      if (!existsResult.data.exists) {
        return res.status(404).json(ErrorManager.returnError("configNotFound"));
      }

      const result = await config.getConfig(key);
      if (result.success) {
        result.data = redactConfigRow(result.data);
      }
      return res.status(result.code).json(result);
    } else {
      const result = await config.getConfigs();
      if (result.success) {
        result.data = result.data
          .filter((row) => isAdmin || !SENSITIVE_CONFIG_KEYS.includes(row.id))
          .map(redactConfigRow);
      }
      return res.status(result.code).json(result);
    }
  } catch (error) {
    logger.error(`Error fetching config: ${error.message}`);
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
api.post("/", requireAdmin, async (req, res) => {
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
    logger.error(`Error creating config: ${error.message}`);
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
api.put("/", requireAdmin, async (req, res) => {
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
    logger.error(`Error updating config: ${error.message}`);
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
api.delete("/", requireAdmin, async (req, res) => {
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
    logger.error(`Error deleting config: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
