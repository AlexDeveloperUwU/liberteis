import { Router } from "express";
import * as bookings from "../../db/bookingsService.js";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";

/**
 * Express router for bookings related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * @name POST /api/bookings
 * @description Creates a new booking
 * @param {object} req - Express request object.
 * @param {object} req.body - Booking data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", async (req, res) => {
  try {
    const bookingData = req.body;

    if (
      !bookingData ||
      !bookingData.eventId ||
      !bookingData.space ||
      !bookingData.bookingDate ||
      !bookingData.bookedBy
    ) {
      logger.error("Invalid booking data - missing required fields");
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info("Creating booking for event:", bookingData.eventId, "by user:", bookingData.bookedBy);
    const result = await bookings.addBooking(bookingData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error en /api/bookings/ [POST]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PUT /api/bookings/
 * @description Updates an existing booking by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the booking to update.
 * @param {object} req.body - The booking data to update.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and update result.
 */
api.put("/", async (req, res) => {
  try {
    const { id } = req.query;
    const bookingData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info("Updating booking with ID:", id);
    const result = await bookings.updateBooking(id, bookingData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error en /api/bookings/ [PUT]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/bookings/toggle
 * @description Toggles the active status of a booking by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the booking to toggle.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and toggle result.
 */
api.patch("/toggle", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    logger.info("Toggling booking with ID:", id);
    const result = await bookings.changeBookingStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error en /api/bookings/toggle [PATCH]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/bookings/count
 * @description Retrieves the count of bookings for a given user and type.
 * @param {string} req.query.userId - The ID of the user whose bookings are being counted.
 * @param {string} req.query.type - The type of bookings to count.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the bookings count.
 */
api.get("/count", async (req, res) => {
  try {
    const { userId, type } = req.query;
    const result = await bookings.getBookingsCount(userId, type);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error in /api/bookings/count:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/bookings/event
 * @description Gets bookings filtered by event ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} req.query.eventId - ID of the event to filter by.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive bookings.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and bookings data.
 */
api.get("/event", async (req, res) => {
  try {
    const { eventId, includeInactive } = req.query;

    if (!eventId) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const include = includeInactive === "true";
    const result = await bookings.getBookingsByEvent(eventId, include);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error in /api/bookings/event [GET]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/bookings/user
 * @description Gets bookings filtered by user ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} req.query.userId - ID of the user to filter by.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive bookings.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and bookings data.
 */
api.get("/user", async (req, res) => {
  try {
    const { userId, includeInactive } = req.query;

    if (!userId) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const include = includeInactive === "true";
    const result = await bookings.getBookingsByUser(userId, include);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error("Error in /api/bookings/user [GET]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/bookings/
 * @description Gets either a specific booking by ID or a list of bookings filtered by status
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.id] - ID of the booking to retrieve.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive bookings.
 * @param {('all'|'active'|'inactive')} [req.query.status='active'] - Status to filter bookings.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and booking data or error message.
 */
api.get("/", async (req, res) => {
  try {
    const { id, status, includeInactive, startMonth, endMonth } = req.query;
    const userRole = req._reqUser?.role;
    const userId = req._reqUser?.id;

    if (id) {
      const include = includeInactive === "true";
      const result = await bookings.getBooking(id, include);

      if (userRole === "normalUser" && result.success && result.data.bookedBy !== userId) {
        return res.status(403).json(ErrorManager.returnError("accessDenied"));
      }

      return res.status(result.code).json(result);
    } else {
      const filterUserId = userRole === "normalUser" ? userId : null;
      const filters = {};
      if (startMonth) filters.startMonth = startMonth;
      if (endMonth) filters.endMonth = endMonth;
      const result = await bookings.getBookings(status || "active", filterUserId, filters);
      return res.status(result.code).json(result);
    }
  } catch (error) {
    logger.error("Error in /api/bookings/ [GET]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
