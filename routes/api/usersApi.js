import { Router } from "express";
import * as users from "../../db/usersController.js";

const api = Router();
export default api;

// GET / - returns all users or a specific user by id or email
api.get("/", async (req, res) => {
  const { id, email } = req.query;

  // If an id or email is provided, return a specific user, else return all users
  try {
    if (id || email) {
      const exists = id ? await users.checkUserExistence(id) : await users.getUserByEmail(email);
      if (exists) {
        const response = id ? await users.getUser(id) : await users.getUserByEmail(email);
        return res.json({ code: 200, data: response });
      } else {
        return res.status(404).json({ code: 404, message: "User not found" });
      }
    } else {
      const response = await users.getUsers();
      return res.json({ code: 200, data: response });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// POST / - creates a new user
api.post("/", async (req, res) => {
  // Check if the request body is empty
  if (!req.body) {
    return res.status(400).json({ code: 400, message: "User data is required" });
  }

  // Check if the required fields are present
  const { name, email, type } = req.body;
  if (!name || !email || !type) {
    return res.status(400).json({ code: 400, message: "Name, email and type are required" });
  }

  try {
    const exists = await users.getUserByEmail(email);
    if (exists && exists.length > 0) {
      return res.status(409).json({ code: 409, message: "User already exists" });
    } else {
      const user = {
        name,
        email,
        type,
        createdBy: req.session?.userId || "system",
      };
      await users.addUser(user);
      return res.status(201).json({ code: 201, message: "User created sucessfully" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// PUT / - update an existing user
api.put("/", async (req, res) => {
  // Check if the request body is empty
  if (!req.body) {
    return res.status(400).json({ code: 400, message: "User data is required" });
  }

  // Check if the required fields are present
  const { id, email, name, type, lastLogin, lang } = req.body;
  if (!id && !email) {
    return res.status(400).json({ code: 400, message: "Id or email is required" });
  }

  try {
    let userId = id;
    if (email) {
      const user = await users.getUserByEmail(email);
      if (user) {
        userId = user[0].id;
      } else {
        return res.status(404).json({ code: 404, message: "User not found" });
      }
    }

    const exists = await users.checkUserExistence(userId);
    if (exists) {
      let user = await users.getUser(userId);
      user = user[0];

      // Update only the fields provided in the request body
      if (name) user.name = name;
      if (type) user.type = type;
      if (lastLogin) user.lastLogin = lastLogin;
      if (lang) user.lang = lang;
      user.updatedBy = req.session?.userId;

      // Validate user type
      const allowedTypes = ["normalUser", "managerUser", "adminUser"];
      if (!allowedTypes.includes(user.type)) {
        user.type = "normalUser";
      }

      await users.updateUser(userId, user);
      return res.json({ code: 200, message: "User updated successfully" });
    } else {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// DELETE /?id or /?email - deletes an existing user by id or email
api.delete("/", async (req, res) => {
  const { id, email } = req.query;

  // Check if the required fields are present
  if (!id && !email) {
    return res.status(400).json({ code: 400, message: "Id or email is required" });
  }

  try {
    let userId = id;
    if (email) {
      const user = await users.getUserByEmail(email);
      if (user) {
        userId = user[0].id;
      } else {
        return res.status(404).json({ code: 404, message: "User not found" });
      }
    }

    const exists = await users.checkUserExistence(userId);
    if (exists) {
      await users.deleteUser(userId);
      return res.json({ code: 200, message: "User deleted sucessfully" });
    } else {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});
