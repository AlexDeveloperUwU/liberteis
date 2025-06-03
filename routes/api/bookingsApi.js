import { Router } from "express";
import * as bookings from "../../db/bookingsService.js";

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

//! Basic CRUD operations

/**
 * @name GET /api/bookings/count
 * @description Retrieves the count of bookings for a given user and type.
 * @param {string} req.userId - The ID of the user whose bookings are being counted.
 * @param {string} req.query.type - The type of bookings to count.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the bookings count.
 */
api.get("/count", async (req, res) => {
  try {
    const { userId, type } = req.query;
    const result = await bookings.getBookingsCount(userId, type);
    res.status(200).json({ code: 200, data: result });
  } catch (error) {
    console.error("Error in /api/bookings/count:", error.message);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});
