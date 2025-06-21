import { Router } from "express";
import * as events from "../../db/eventsService.js";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";

/**
 * Express router for event related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

//! Basic CRUD operations

/**
 * @name POST /api/events
 * @description Creates a new event
 * @param {object} req - Express request object.
 * @param {object} req.body - Event data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", async (req, res) => {
  try {
    const eventData = req.body;
    logger.info("Raw event data received:", JSON.stringify(eventData, null, 2));
    
    if (!eventData || !eventData.title || !eventData.info || !eventData.category) {
      logger.error("Invalid event data - missing required fields:");
      logger.error("- title:", eventData?.title);
      logger.error("- info:", eventData?.info);
      logger.error("- category:", eventData?.category);
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }
    
    logger.info("Final event data to save:", JSON.stringify(eventData, null, 2));
    const result = await events.addEvent(eventData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error en /api/events/ [POST]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PUT /api/events/
 * @description Updates an existing event by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the event to update.
 * @param {object} req.body - The event data to update.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and update result.
 */
api.put("/", async (req, res) => {
  try {
    const { id } = req.query;
    const eventData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info("Updating event with ID:", id, "and data:", eventData);
    const result = await events.updateEvent(id, eventData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error en /api/events/ [PUT]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/events/toggle
 * @description Toggles the active status of an event by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the event to toggle.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and toggle result.
 */
api.patch("/toggle", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info("Toggling event with ID:", id);
    const result = await events.changeEventStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error en /api/events/toggle [PATCH]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

//! Info retrieval operations

/**
 * @name GET /api/events/count
 * @description Retrieves the count of events based on their status.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.type] - Type of count to perform.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the events count.
 */
api.get("/count", async (req, res) => {
  try {
    const { type } = req.query;
    const result = await events.getEventsCount(type);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error in /api/events/count:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/events/
 * @description Gets either a specific event by ID or a list of events filtered by status
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.id] - ID of the event to retrieve.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive events.
 * @param {('all'|'active'|'inactive')} [req.query.status='active'] - Status to filter events.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and event data or error message.
 */
api.get("/", async (req, res) => {
  try {
    const { id, status, includeInactive } = req.query;
    if (id) {
      const include = includeInactive === "true";
      const result = await events.getEvent(id, include);
      return res.status(result.code).json(result);
    } else {
      const result = await events.getEvents(status || "active");
      return res.status(result.code).json(result);
    }
  } catch (error) {
    logger.error("Error in /api/events/ [GET]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
