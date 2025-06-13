import { Router } from "express";
import * as users from "../../db/userService.js";
import ErrorManager from "../../errors/errorManager.js";

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

//! Basic CRUD operations

/**
 * @name POST /api/users
 * @description Creates a new user
 * @param {object} req - Express request object.
 * @param {object} req.body - User data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", async (req, res) => {
  try {
    const userData = req.body;
    if (!userData) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }
    
    const result = await users.addUser(userData);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error en /api/users/ [POST]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

//! Info retrieval operations

/**
 * @name GET /api/users/count
 * @description Retrieves the count of users based on their status.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.type] - Type of count to perform.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the users count.
 */
api.get("/count", async (req, res) => {
  try {
    const { type } = req.query;
    const result = await users.getUsersCount(type);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error in /api/users/count:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/users/
 * @description Gets either a specific user by ID or a list of users filtered by status.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} [req.query.id] - The ID of a specific user to retrieve.
 * @param {boolean} [req.query.includeInactive=false] - Whether to include inactive users.
 * @param {('all'|'active'|'inactive')} [req.query.status='active'] - Status to filter users.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and user data.
 */
api.get("/", async (req, res) => {
  try {
    const { id, status, includeInactive } = req.query;

    if (id) {
      const include = includeInactive === "true";
      const result = await users.getUser(id, include);
      return res.status(result.code).json(result);
    }

    const result = await users.getUsers(status || "active");
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error in /api/users/:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PUT /api/users/
 * @description Updates an existing user by ID.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the user to update.
 * @param {object} req.body - The user data to update.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and update result.
 */
api.put("/", async (req, res) => {
  try {
    const { id } = req.query;
    const userData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }    

    let passwordResult;
    if (userData.password) {
      passwordResult = await users.updateUserPassword(id, userData.password);
      
      if (!passwordResult.success) {
        return res.status(passwordResult.code).json(passwordResult);
      }
      delete userData.password;
    }

    let updateResult;
    const userDataKeys = Object.keys(userData).filter((key) => key !== "password");
    if (userDataKeys.length > 0) {
      updateResult = await users.updateUser(id, userData);
      
      if (!updateResult.success) {
        return res.status(updateResult.code).json(updateResult);
      }
    }

    return res.status(200).json(ErrorManager.returnSuccess(
      200, 
      "User updated successfully", 
      { passwordUpdate: !!passwordResult, dataUpdate: !!updateResult }
    ));
  } catch (error) {
    console.error("Error en /api/users/ [PUT]:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/users/:id/statusSwitch
 * @description Switches a user's status between active and inactive.
 * @param {object} req - Express request object.
 * @param {object} req.params - URL parameters.
 * @param {string} req.params.id - The user ID.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result.
 */
api.patch("/:id/statusSwitch", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await users.changeUserStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error in /api/users/:id/statusSwitch:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/users/:id/enable
 * @description Enables a user by ID.
 * @param {object} req - Express request object.
 * @param {object} req.params - URL parameters.
 * @param {string} req.params.id - The user ID.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result.
 */
api.patch("/:id/enable", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await users.enableUser(id);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error in /api/users/:id/enable:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/users/:id/disable
 * @description Disables a user by ID.
 * @param {object} req - Express request object.
 * @param {object} req.params - URL parameters.
 * @param {string} req.params.id - The user ID.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result.
 */
api.patch("/:id/disable", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await users.disableUser(id);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("Error in /api/users/:id/disable:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/users/:id/status
 * @description Gets the status of a user by ID.
 * @param {object} req - Express request object.
 * @param {object} req.params - URL parameters.
 * @param {string} req.params.id - The user ID.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and user status.
 */
api.get("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const status = await users.checkUserStatus(id);
    
    if (typeof status === 'object' && !status.success) {
      return res.status(status.code).json(status);
    }
    
    return res.status(200).json(ErrorManager.returnSuccess(200, "User status retrieved", { deleted: status }));
  } catch (error) {
    console.error("Error in /api/users/:id/status:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/users/:email/exists
 * @description Checks if a user with given email exists.
 * @param {object} req - Express request object.
 * @param {object} req.params - URL parameters.
 * @param {string} req.params.email - Email to check.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and existence status.
 */
api.get("/:email/exists", async (req, res) => {
  try {
    const { email } = req.params;
    const exists = await users.checkUserExists(email);
    
    if (typeof exists === 'object' && !exists.success) {
      return res.status(exists.code).json(exists);
    }
    
    return res.status(200).json(ErrorManager.returnSuccess(200, "User existence checked", { exists }));
  } catch (error) {
    console.error("Error in /api/users/:email/exists:", error);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
