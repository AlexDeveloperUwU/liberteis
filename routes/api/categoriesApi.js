import { Router } from "express";
import * as categories from "../../db/categoriesService.js";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";
import { requireRole } from "../middleware/requireAdmin.js";

/**
 * Express router for category related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * @name POST /api/categories
 * @description Creates a new category
 * @param {object} req - Express request object.
 * @param {object} req.body - Category data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", requireRole("managerUser"), async (req, res) => {
  try {
    const categoryData = req.body;

    if (!categoryData || !categoryData.name || !Array.isArray(categoryData.spaces)) {
      logger.error("Invalid category data - missing required fields");
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    try {
      categoryData.spaces = JSON.stringify(categoryData.spaces);
      logger.info(`Creating category with name: ${categoryData.name}`);
    } catch (err) {
      logger.error(`Error converting spaces to JSON: ${err.message}`);
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const result = await categories.addCategory(categoryData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/categories/ [POST]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PUT /api/categories/
 * @description Updates an existing category by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the category to update.
 * @param {object} req.body - The category data to update.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and update result.
 */
api.put("/", requireRole("managerUser"), async (req, res) => {
  try {
    const { id } = req.query;
    const categoryData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    if (Array.isArray(categoryData.spaces)) {
      try {
        categoryData.spaces = JSON.stringify(categoryData.spaces);
      } catch (err) {
        logger.error(`Error converting spaces to JSON (PUT): ${err.message}`);
        return res.status(400).json(ErrorManager.returnError("invalidParameters"));
      }
    }

    logger.info(`Updating category with ID: ${id}`);
    const result = await categories.updateCategory(id, categoryData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/categories/ [PUT]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/categories/toggle
 * @description Toggles the active status of a category by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the category to toggle.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and toggle result.
 */
api.patch("/toggle", requireRole("managerUser"), async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info(`Toggling category with ID: ${id}`);
    const result = await categories.changeCategoryStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/categories/toggle [PATCH]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/categories/count
 * @description Retrieves the count of categories based on their status.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.type] - Type of count to perform.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the categories count.
 */
api.get("/count", async (req, res) => {
  try {
    const { type } = req.query;
    const result = await categories.getCategoriesCount(type);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/categories/count: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/categories/
 * @description Gets either a specific category by ID or a list of categories filtered by status
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.id] - ID of the category to retrieve.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive categories.
 * @param {('all'|'active'|'inactive')} [req.query.status='active'] - Status to filter categories.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and category data or error message.
 */
api.get("/", async (req, res) => {
  try {
    const { id, status, includeInactive } = req.query;
    if (id) {
      const include = includeInactive === "true";
      const result = await categories.getCategory(id, include);
      return res.status(result.code).json(result);
    } else {
      const result = await categories.getCategories(status || "active");
      return res.status(result.code).json(result);
    }
  } catch (error) {
    logger.error(`Error in /api/categories/ [GET]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
