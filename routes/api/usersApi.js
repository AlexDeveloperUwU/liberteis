import { Router } from "express";
import * as users from "../../db/userService.js";

const api = Router();
export default api;

//! Basic CRUD operations

// POST /api/users
// Receives an object with the user data to add
// Uses the addUser function from userService
api.post("/", async (req, res) => {
  const user = req.body;
  if (!user) {
    return res.status(400).json({ error: true, message: "Invalid parameters" });
  }

  try {
    const result = await users.addUser(user);
    if (result.error) {
      return res.status(500).json(result);
    }
    return res.status(201).json({error: false, message: "User created" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

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
