import { Router } from "express";
import * as users from "../../db/userService.js";
import ErrorManager from "../../errors/errorManager.js";
import { generatePass } from "../../utils/password.js";
import { logger } from "../../utils/logger.js";
import { requireAdmin, requireAuth, requireRole } from "../middleware/requireAdmin.js";

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * @name POST /api/users
 * @description Creates a new user
 * @param {object} req - Express request object.
 * @param {object} req.body - User data to add.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and result message.
 */
api.post("/", requireAdmin, async (req, res) => {
  try {
    const userData = req.body;
    if (!userData) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    userData.password = generatePass();

    logger.info(`Creating user with email: ${userData.email}`);
    const result = await users.addUser(userData);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/users/ [POST]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PUT /api/users/
 * @description Updates an existing user by ID. Users may update their own profile;
 *              updating other users requires an admin session.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.id - The ID of the user to update.
 * @param {object} req.body - The user data to update.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and update result.
 */
api.put("/", requireAuth, async (req, res) => {
  try {
    const { id } = req.query;
    const userData = req.body;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    if (req._reqUser.id !== id) {
      if (req._reqUser.type !== "adminUser") {
        return res.status(403).json(ErrorManager.returnError("forbiddenAdminOnly"));
      }
    } else if (req._reqUser.type !== "adminUser") {
      // Users editing their own profile cannot change their role
      delete userData.type;
    }

    const currentUser = await users.getUser(id);
    if (currentUser.success && currentUser.data.createdBy === "System" && currentUser.data.name === "Administrador") {
      delete userData.name;
      delete userData.type;
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
      logger.info(`Updating user with ID: ${id}`);
      updateResult = await users.updateUser(id, userData);

      if (!updateResult.success) {
        return res.status(updateResult.code).json(updateResult);
      }
    }

    return res.status(200).json(
      ErrorManager.returnSuccess(200, "User updated successfully", {
        passwordUpdate: !!passwordResult,
        dataUpdate: !!updateResult,
      }),
    );
  } catch (error) {
    logger.error(`Error in /api/users/ [PUT]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name PATCH /api/users/toggle
 * @description Toggles a user's active/inactive status
 * @param {object} req - Express request object
 * @param {object} req.query - Query parameters
 * @param {string} req.query.id - The ID of the user to toggle
 * @param {object} res - Express response object
 * @returns {object} JSON with status code and toggle result
 */
api.patch("/toggle", requireAdmin, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const result = await users.toggleUserStatus(id);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/users/toggle [PATCH]: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/users/count
 * @description Retrieves the count of users based on their status.
 * @param {object} req - Express request object.
 * @param {object} req.query - Query parameters.
 * @param {string} [req.query.type] - Type of count to perform.
 * @param {object} res - Express response object.
 * @returns {object} JSON object containing the users count.
 */
api.get("/count", requireRole("managerUser"), async (req, res) => {
  try {
    const { type } = req.query;
    const result = await users.getUsersCount(type);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/users/count: ${error.message}`);
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

    if (!req._reqUser || (req._reqUser.type !== "managerUser" && req._reqUser.type !== "adminUser")) {
      return res.status(403).json(ErrorManager.returnError("forbidden"));
    }

    const result = await users.getUsers(status || "active");
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in /api/users/: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/users/emailCheck
 * @description Check if a user with a specific email exists.
 * @param {object} req - Express request object.
 * @param {object} req.query - The query parameters.
 * @param {string} req.query.email - The e-mail to check for existence.
 * @param {object} res - Express response object.
 * @returns {object} JSON with status code and check result.
 */
api.get("/emailCheck", requireRole("managerUser"), async (req, res) => {
  try {
    const { email } = req.query;
    const exists = await users.checkUserExists(email);
    return res.status(200).json(exists);
  } catch (error) {
    logger.error(`Error in /api/users/:email/exists: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
