import { Router } from "express";
import * as users from "../../db/userService.js";

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

//! Basic CRUD operations

//! Info retrieval operations

/**
 * @name GET /api/users/count
 * @description Retrieves the count of users based on their status.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {object} req.body.user - User object containing details for registration.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the users count.
 */

api.get("/count", async (req, res) => {
  try {
    const { type } = req.query;
    const result = await users.getUsersCount(type);
    res.status(200).json({ code: 200, data: result });
  } catch (error) {
    console.error("Error in /api/users/count:", error.message);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

/**
 * @name GET /api/users/
 * @description Gets the list of users filtered by status.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {('all'|'active'|'inactive')} [req.query.status='active'] - Status to filter users.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and users array.
 * @returns {number} response.code - HTTP status code.
 * @returns {Array<object>} response.data - List of found users.
 */

api.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const result = await users.getUsers(status);
    res.status(200).json({ code: 200, data: result });
  } catch (error) {
    console.error("Error in /api/users/count:", error.message);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

/*
// POST /api/users
// Receives an object with the user data to add
// Uses the addUser function from userService
api.post("/", async (req, res) => {});

// PUT /api/users/:id
// Receives a user id and an object with the data to modify
// If the object contains the password, the request will be rejected
// Uses the updateUser function from userService
api.put("/:id", async (req, res) => {});

// PUT /api/users/:id/password
// Receives a user id and an object with the new password
// Uses the updateUserPassword function from userService
api.patch("/:id/password", async (req, res) => {});

// PUT /api/users/:id/statusSwitch
// Receives a user id
// Uses the changeUserStatus function from userService
api.patch("/:id/statusSwitch", async (req, res) => {});

// PATCH /api/users/:id/enable
// Receives a user id
// Uses the enableUser function from userService
api.patch("/:id/enable", async (req, res) => {});

// PATCH /api/users/:id/disable
// Receives a user id
// Uses the disableUser function from userService
api.patch("/:id/disable", async (req, res) => {});

//! Info retrieval operations

// GET /api/users/:id
// Receives a user id and optionally a boolean query includeInactive
// Uses the getUser function from userService
api.get("/:id", async (req, res) => {});

// GET /api/users/:email
// Receives a user email and optionally a boolean query includeInactive
// Uses the getUserByEmail function from userService
api.get("/:email", async (req, res) => {});

// GET /api/users
// Optionally receives a query string status
// The status query can be: all, active (DEFAULT) or inactive
// Uses the getUsers function from userService
api.get("/", async (req, res) => {});

// GET /api/users/:id/status
// Receives a user id
// Uses the checkUserStatus function from userService
api.get("/:id/status", async (req, res) => {});

// GET /api/users/:email/exists
// Receives a user email
// Uses the checkUserExists function from userService
api.get("/:email/exists", async (req, res) => {});
*/
