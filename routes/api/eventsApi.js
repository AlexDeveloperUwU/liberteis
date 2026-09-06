import { Router } from "express";
import * as events from "../../db/eventsService.js";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";
import { uploadEventImage, deleteEventImage } from "../../utils/fileUpload.js";
import { requireAuth } from "../middleware/requireAdmin.js";

/**
 * Express router for event related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * Whether the current user may modify the given event.
 * Managers and admins may modify any event; a normal user only their own.
 * @param {object} req - Express request object (must have req._reqUser).
 * @param {string} id - Event ID.
 * @returns {Promise<boolean>}
 */
async function canModifyEvent(req, id) {
  const type = req._reqUser?.type;
  if (type === "managerUser" || type === "adminUser") return true;
  const result = await events.getEvent(id, true);
  return result.success && result.data.createdBy === req._reqUser?.id;
}

/**
 * @name POST /api/events
 * @description Creates a new event
 * @param {object} req - Express request object.
 * @param {object} req.body - Event data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", requireAuth, uploadEventImage, async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData || !eventData.title || !eventData.info || !eventData.category) {
      logger.error("Invalid event data - missing required fields");
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const type = req._reqUser.type;
    if (type !== "managerUser" && type !== "adminUser") {
      eventData.createdBy = req._reqUser.id;
    } else if (!eventData.createdBy) {
      eventData.createdBy = req._reqUser.id;
    }

    if (req.file) {
      eventData.coverUrl = `/uploads/${req.file.filename}`;
      delete eventData.image;
      logger.info(`Image uploaded: ${req.file.filename}`);
    }

    logger.info(`Creating event with title: ${eventData.title}`);
    const result = await events.addEvent(eventData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/events/ [POST]: ${error.message}`);
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
api.put("/", requireAuth, uploadEventImage, async (req, res) => {
  try {
    const { id } = req.query;
    const eventData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    if (!(await canModifyEvent(req, id))) {
      return res.status(403).json(ErrorManager.returnError("forbidden"));
    }

    delete eventData.createdBy;

    if (req.file) {
      const currentEventResult = await events.getEvent(id, true);

      if (currentEventResult.code === 200 && currentEventResult.data && currentEventResult.data.coverUrl) {
        const oldFilename = currentEventResult.data.coverUrl.replace("/uploads/", "");
        deleteEventImage(oldFilename);
        logger.info(`Previous image deleted: ${oldFilename}`);
      }

      eventData.coverUrl = `/uploads/${req.file.filename}`;
      delete eventData.image;
      logger.info(`New image uploaded: ${req.file.filename}`);
    }

    logger.info(`Updating event with ID: ${id}`);
    const result = await events.updateEvent(id, eventData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/events/ [PUT]: ${error.message}`);
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
api.patch("/toggle", requireAuth, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    if (!(await canModifyEvent(req, id))) {
      return res.status(403).json(ErrorManager.returnError("forbidden"));
    }

    logger.info(`Toggling event with ID: ${id}`);
    const result = await events.changeEventStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/events/toggle [PATCH]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

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
    logger.error(`Error in /api/events/count: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/events/category
 * @description Gets events filtered by category ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} req.query.categoryId - ID of the category to filter by.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive events.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and events data.
 */
api.get("/category", async (req, res) => {
  try {
    const { categoryId, includeInactive } = req.query;

    if (!categoryId) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const include = includeInactive === "true";
    const result = await events.getEventsByCategory(categoryId, include);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/events/category [GET]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/events/
 * @description Gets either a specific event by ID or a list of events filtered by status.
 *              A normalUser is restricted to events they created.
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
    const userRole = req._reqUser?.type;
    const userId = req._reqUser?.id;

    if (id) {
      const include = includeInactive === "true";
      const result = await events.getEvent(id, include);

      if (userRole === "normalUser" && result.success && result.data.createdBy !== userId) {
        return res.status(403).json(ErrorManager.returnError("accessDenied"));
      }

      return res.status(result.code).json(result);
    } else {
      const filterUserId = userRole === "normalUser" ? userId : null;
      const result = await events.getEvents(status || "active", filterUserId);
      return res.status(result.code).json(result);
    }
  } catch (error) {
    logger.error(`Error in /api/events/ [GET]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
