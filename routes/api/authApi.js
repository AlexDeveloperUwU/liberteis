import { Router } from "express";
import jwt from "jsonwebtoken";
import * as users from "../../db/userService.js";
import { validatePass } from "../../utils/dataSecurity.js";
import { generatePass } from "../../utils/password.js";
import { getKey } from "../../utils/secretKey.js";

const api = Router();
export default api;

// Used to register a new user with password
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

api.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");
    res.clearCookie("session_id");
    return res.status(200).json({ error: false, message: "Logout successful" });
  });
});
