import * as dbc from "./dbController.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";
import * as configService from "./configService.js";
import * as mailer from "../utils/mailer.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

//! Operaciones CRUD básicas

/**
 * Adds a user to the database.
 * @param {Object} user - Object representing the user.
 * @returns {Promise<Object>} Operation result.
 */
export async function addUser(user) {
  if (!user) {
    return ErrorManager.returnError("invalidParameters");
  }

  const allowedTypes = ["normalUser", "managerUser", "adminUser"];
  if (!allowedTypes.includes(user.type)) {
    user.type = "normalUser";
  }
  user.id = await id.generateId("user");
  user.hashedPassword = ds.encryptPass(user.password);
  delete user.password;
  user.lastLogin = undefined;
  user.lang = "gl";
  user.deleted = false;

  try {
    await dbc.dbSaveData("users", user);
    return ErrorManager.returnSuccess(201, "User created successfully", { code: 201 });
  } catch (error) {
    if (error.message && error.message.includes("Duplicate entry") && error.message.includes("for key 'users.email'")) {
      logger.error(`Duplicate email error: ${error.message}`);
      return ErrorManager.returnError("emailAlreadyExists");
    } else {
      logger.error(`Error adding user to the database: ${error.message}`);
      return ErrorManager.returnError("userSaveError");
    }
  }
}

/**
 * Updates a user in the database.
 * @param {string} id - User ID.
 * @param {Object} user - Object with updated user data.
 * @returns {Promise<Object>} Operation result.
 */
export async function updateUser(id, user) {
  if (!id || !user) {
    return ErrorManager.returnError("invalidParameters");
  }

  if (Object.keys(user).length === 1 && user.hasOwnProperty("password")) {
    return ErrorManager.returnError("passwordUpdateError");
  }

  const allowedFields = ["name", "email", "type", "lang", "theme"];
  const sanitized = {};
  for (const field of allowedFields) {
    if (user[field] !== undefined) sanitized[field] = user[field];
  }

  if (sanitized.type !== undefined && !["normalUser", "managerUser", "adminUser"].includes(sanitized.type)) {
    return ErrorManager.returnError("invalidParameters");
  }

  if (Object.keys(sanitized).length === 0) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    await dbc.dbUpdateData("users", id, sanitized);
    return ErrorManager.returnSuccess(200, "User updated successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error updating user in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Enables / Disables a user in the database.
 * @param {string} id - User ID.
 * @returns {Promise<Object>} Operation result.
 */
export async function toggleUserStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const userResult = await getUser(id, true);
    if (userResult.error) {
      return userResult;
    }

    const user = userResult.data;
    const newStatus = { deleted: !user.deleted };

    await dbc.dbUpdateData("users", id, newStatus);
    return ErrorManager.returnSuccess(200, "User status updated successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error toggling user status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Updates a user's last login.
 * @param {string} id - User ID.
 * @returns {Promise<Object>} Operation result.
 */
export async function updateUserLastLogin(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  const lastLogin = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const result = await dbc.dbUpdateData("users", id, { lastLogin });
    return ErrorManager.returnSuccess(200, "User last login updated successfully", result);
  } catch (error) {
    logger.error(`Error updating user last login in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Updates a user's password in the database.
 * @param {string} id - User ID.
 * @param {string} pass - New user password.
 * @param {boolean} [invalidateOtherSessions=true] - Whether to bump the user's session version,
 *   logging out every other active session.
 * @returns {Promise<Object>} Operation result.
 */
export async function updateUserPassword(id, pass, invalidateOtherSessions = true) {
  if (!id || !pass) {
    return ErrorManager.returnError("invalidParameters");
  }

  const updateData = { hashedPassword: ds.encryptPass(pass) };

  try {
    if (invalidateOtherSessions) {
      const userResult = await dbc.dbGetOne("users", id);
      const user = userResult[0];
      if (user) {
        updateData.sessionVersion = (user.sessionVersion || 0) + 1;
      }
    }

    await dbc.dbUpdateData("users", id, updateData);
    return ErrorManager.returnSuccess(200, "User password updated successfully", {
      sessionVersion: updateData.sessionVersion,
    });
  } catch (error) {
    logger.error(`Error updating user password in the database: ${error.message}`);
    return ErrorManager.returnError("passwordUpdateError");
  }
}

//! Recuperación de contraseña

/**
 * Requests a password reset for the given email: issues a single-use, time-limited token and
 * emails a reset link. Always succeeds when the account isn't found, so the route can hide that
 * from the client (anti-enumeration) — only a genuine failure (e.g. DB error) returns an error.
 * @param {string} email - The account's email.
 * @returns {Promise<Object>} Operation result.
 */
export async function requestPasswordReset(email) {
  if (!email) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const userResult = await getUserByEmail(email);
    if (!userResult.success) {
      return userResult;
    }
    const user = userResult.data;

    const token = ds.generateResetToken();
    const tokenHash = ds.hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await dbc.dbSaveData("passwordresets", {
      id: await id.generateId("passwordReset"),
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });

    const domainResult = await configService.getConfig("domain");
    const domain = domainResult.success ? domainResult.data.value : "";
    const resetLink = `${domain}/auth/resetPassword/${token}`;

    await mailer.sendPasswordResetEmail(user, resetLink);

    return ErrorManager.returnSuccess(200, "Password reset requested", { code: 200 });
  } catch (error) {
    logger.error(`Error requesting password reset: ${error.message}`);
    return ErrorManager.returnError("passwordResetError");
  }
}

/**
 * Validates a password reset token without consuming it.
 * @param {string} token - The raw token from the reset link.
 * @returns {Promise<Object>} Success with `{userId}`, or `resetTokenInvalid`/`resetTokenExpired`.
 */
export async function validateResetToken(token) {
  if (!token) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const tokenHash = ds.hashToken(token);
    const result = await dbc.dbGetWhere("passwordresets", { field: "tokenHash", operator: "=", value: tokenHash });
    const record = result[0];

    if (!record || record.used) {
      return ErrorManager.returnError("resetTokenInvalid");
    }
    if (new Date(record.expiresAt) < new Date()) {
      return ErrorManager.returnError("resetTokenExpired");
    }

    return ErrorManager.returnSuccess(200, "Reset token is valid", { userId: record.userId });
  } catch (error) {
    logger.error(`Error validating password reset token: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Resets a user's password using a valid reset token: sets the new password, invalidates every
 * existing session for the account, and marks all of its reset tokens used.
 * @param {string} token - The raw token from the reset link.
 * @param {string} newPassword - The new password.
 * @returns {Promise<Object>} Operation result.
 */
export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const validation = await validateResetToken(token);
    if (!validation.success) {
      return validation;
    }
    const { userId } = validation.data;

    const passwordResult = await updateUserPassword(userId, newPassword, true);
    if (!passwordResult.success) {
      return passwordResult;
    }

    await dbc.dbUpdateWhere("passwordresets", { field: "userId", operator: "=", value: userId }, { used: true });

    return ErrorManager.returnSuccess(200, "Password reset successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
    return ErrorManager.returnError("passwordResetError");
  }
}

//! Operaciones de recuperación de información

/**
 * Gets a user from the database.
 * @param {string} id - User ID.
 * @param {boolean} [includeInactive=false] - Whether to include inactive users.
 * @returns {Promise<Object>} Found user or error message.
 */
export async function getUser(id, includeInactive = false) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetOne("users", id);
        break;
      case false:
        result = await dbc.dbGetWhere("users", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    const user = Array.isArray(result) ? result[0] : result;

    if (!user) {
      return ErrorManager.returnError("userNotFound");
    }

    const { hashedPassword, ...userWithoutPassword } = user;

    return ErrorManager.returnSuccess(200, "User retrieved successfully", userWithoutPassword);
  } catch (error) {
    logger.error(`Error retrieving user from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets a user by email from the database.
 * @param {string} email - User's email.
 * @param {boolean} [includeInactive=false] - Whether to include inactive users.
 * @returns {Promise<Object>} Found user or error message.
 */
export async function getUserByEmail(email, includeInactive = false) {
  if (!email) {
    return ErrorManager.returnError("invalidParameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("users", {
          field: "email",
          operator: "=",
          value: email,
        });
        break;
      case false:
        result = await dbc.dbGetWhere("users", [
          { field: "email", operator: "=", value: email },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("userNotFound");
    }

    return ErrorManager.returnSuccess(200, "User retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error retrieving user by email from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets all users from the database.
 * @param {string} [status="active"] - Status of users to retrieve ("all", "active", "inactive").
 * @returns {Promise<Array>} List of found users or error message.
 */
export async function getUsers(status = "active") {
  if (!status) {
    status = "active";
  }

  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("users");
        break;
      case "active":
        result = await dbc.dbGetWhere("users", {
          field: "deleted",
          operator: "=",
          value: false,
        });
        break;
      case "inactive":
        result = await dbc.dbGetWhere("users", {
          field: "deleted",
          operator: "=",
          value: true,
        });
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("userNotFound");
    }

    const usersWithoutPassword = result.map(({ hashedPassword, ...user }) => user);
    return ErrorManager.returnSuccess(200, "Users retrieved successfully", usersWithoutPassword);
  } catch (error) {
    logger.error(`Error retrieving users from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets a user count summary.
 * @param {string} [type=null] - Type of users to count ("all", "active", "inactive", or null for all).
 * @returns {Promise<object>} User count summary.
 */
export async function getUsersCount(type = null) {
  try {
    let resultData;

    switch (type) {
      case "all": {
        const total = await dbc.dbGetAll("users");
        resultData = { totales: total.length };
        break;
      }
      case "active": {
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activos = await dbc.dbGetWhere("users", activeFilters);
        resultData = { activos: activos.length };
        break;
      }
      case "inactive": {
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactivos = await dbc.dbGetWhere("users", inactiveFilters);
        resultData = { inactivos: inactivos.length };
        break;
      }
      case null: {
        const total = await dbc.dbGetAll("users");
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activos = await dbc.dbGetWhere("users", activeFilters);
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactivos = await dbc.dbGetWhere("users", inactiveFilters);
        resultData = {
          total: total.length,
          active: activos.length,
          inactive: inactivos.length,
        };
        break;
      }
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    return ErrorManager.returnSuccess(200, "Users summary retrieved successfully", resultData);
  } catch (error) {
    logger.error(`Error retrieving users summary: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Checks if an email is already registered in the database.
 * @param {string} email - Email to check.
 * @returns {Promise<Object>} Result indicating if the email exists.
 */

export async function checkUserExists(email) {
  if (!email) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbGetWhere("users", {
      field: "email",
      operator: "=",
      value: email,
    });

    if (result.length > 0) {
      return ErrorManager.returnSuccess(200, "Email is already registered", { exists: true });
    } else {
      return ErrorManager.returnSuccess(200, "Email is available", { exists: false });
    }
  } catch (error) {
    logger.error(`Error checking email registration: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
