import { Router } from "express";
import * as spaces from "../../db/spacesService.js";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";
import { requireRole } from "../middleware/requireAdmin.js";

/**
 * Express router for space related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * @name POST /api/spaces
 * @description Creates a new space
 * @param {object} req - Express request object.
 * @param {object} req.body - Space data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", requireRole("managerUser"), async (req, res) => {
  try {
    const spaceData = req.body;
    if (!spaceData) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info(`Creating space with name: ${spaceData.name}`);
    const result = await spaces.addSpace(spaceData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/spaces/ [POST]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PUT /api/spaces/
 * @description Updates an existing space by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the space to update.
 * @param {object} req.body - The space data to update.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and update result.
 */
api.put("/", requireRole("managerUser"), async (req, res) => {
  try {
    const { id } = req.query;
    const spaceData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info(`Updating space with ID: ${id}`);
    const result = await spaces.updateSpace(id, spaceData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/spaces/ [PUT]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/spaces/toggle
 * @description Toggles the active status of a space by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the space to toggle.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and toggle result.
 */
api.patch("/toggle", requireRole("managerUser"), async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info(`Toggling space with ID: ${id}`);
    const result = await spaces.toggleSpaceStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/spaces/toggle [PATCH]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/spaces/count
 * @description Retrieves the count of spaces based on their status.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.type] - Type of count to perform.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the spaces count.
 */
api.get("/count", async (req, res) => {
  try {
    const { type } = req.query;
    const result = await spaces.getSpacesCount(type);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/spaces/count: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/spaces/
 * @description Gets either a specific space by ID or a list of spaces filtered by status
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.id] - ID of the space to retrieve.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive spaces.
 * @param {('all'|'active'|'inactive')} [req.query.status='active'] - Status to filter users.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and space data or error message.
 */
api.get("/", async (req, res) => {
  try {
    const { id, status, includeInactive } = req.query;
    if (id) {
      const include = includeInactive === "true";
      const result = await spaces.getSpace(id, include);
      return res.status(result.code).json(result);
    } else {
      const result = await spaces.getSpaces(status || "active");
      return res.status(result.code).json(result);
    }
  } catch (error) {
    logger.error(`Error in /api/spaces/ [GET]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
