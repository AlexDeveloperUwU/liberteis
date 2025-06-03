import { Router } from "express";
import * as users from "../../db/userService.js";
import { validatePass } from "../../utils/dataSecurity.js";
import { generatePass } from "../../utils/password.js";

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * @name POST /api/auth/register
 * @description Registers a new user with a password.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {object} req.body.user - User object containing details for registration.
 * @param {object} res - Express response object.
 */
api.post("/register", async (req, res) => {
  const user = req.body;
  if (!user) {
    return res.status(400).json({ error: true, message: "Invalid parameters" });
  }

  try {
    const result = await users.addUser(user);
    if (result.error) {
      return res.status(500).json(result);
    }
    return res.status(201).json({ error: false, message: "User created" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

/**
 * @name POST /api/auth/createUser
 * @description Creates a new user with an automatically generated password.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {object} req.body.user - User object containing details for creation.
 * @param {object} res - Express response object.
 */
api.post("/createUser", async (req, res) => {
  const user = req.body;
  if (!user) {
    return res.status(400).json({ error: true, message: "Invalid parameters" });
  }

  try {
    user.password = generatePass();
    const result = await users.addUser(user);
    if (result.error) {
      return res.status(500).json(result);
    }
    return res.status(201).json({ error: false, message: "User created" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

/**
 * @name POST /api/auth/login
 * @description Logs in an existing user.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.email - User's email.
 * @param {string} req.body.password - User's password.
 * @param {object} res - Express response object.
 */
api.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await users.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const isPasswordValid = validatePass(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: true, message: "Invalid password" });
    }

    req.session.userId = user.id;
    await users.updateUserLastLogin(user.id);

    return res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        type: user.type,
        lang: user.lang,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

/**
 * @name POST /api/auth/logout
 * @description Logs out the current user.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
api.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");
    res.clearCookie("session_id");
    return res.status(200).json({ error: false, message: "Logout successful" });
  });
});
