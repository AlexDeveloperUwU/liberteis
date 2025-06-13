import { Router } from "express";
import * as bookings from "../../db/bookingsService.js";
import ErrorManager from "../../errors/errorManager.js";

/**
 * Express router for bookings related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

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
    console.error("Error in /api/bookings/count:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
