import { Router } from "express";
import bookingsApi from "./bookingsApi.js";

const api = Router();
export default api;

//! Basic CRUD operations

// POST /api/bookings
// Receives an object with the booking data to add
// Uses the addBooking function from bookingsService
api.post("/", async (req, res) => {});

// PUT /api/bookings/:id
// Receives a booking id and an object with the data to modify
// Uses the updateBooking function from bookingsService
api.put("/:id", async (req, res) => {});

// PUT /api/bookings/:id/statusSwitch
// Receives a booking id
// Uses the changeBookingStatus function from bookingsService
api.patch("/:id/statusSwitch", async (req, res) => {});

// PATCH /api/bookings/:id/enable
// Receives a booking id
// Uses the enableBooking function from bookingsService
api.patch("/:id/enable", async (req, res) => {});

// PATCH /api/bookings/:id/disable
// Receives a booking id
// Uses the disableBooking function from bookingsService
api.patch("/:id/disable", async (req, res) => {});

//! Info retrieval operations

// GET /api/bookings/:id
// Receives a booking id and optionally a boolean query includeInactive
// Uses the getBooking function from bookingsService
api.get("/:id", async (req, res) => {});

// GET /api/bookings/:name
// Receives a booking name and optionally a boolean query includeInactive
// Uses the getBookingByName function from bookingsService
api.get("/:name", async (req, res) => {});

// GET /api/bookings
// Optionally receives a query string status
// The status query can be: all, active (DEFAULT) or inactive
// Uses the getBookings function from bookingsService
api.get("/", async (req, res) => {});

// GET /api/bookings/:id/status
// Receives a booking id
// Uses the checkBookingStatus function from bookingsService
api.get("/:id/status", async (req, res) => {});
