import * as dbc from "./dbController.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

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
 * @returns {Promise<Object>} Operation result.
 */
export async function updateUserPassword(id, pass) {
  if (!id || !pass) {
    return ErrorManager.returnError("invalidParameters");
  }

  const hashedPass = ds.encryptPass(pass);

  try {
    const result = await dbc.dbUpdateData("users", id, { hashedPassword: hashedPass });
    return ErrorManager.returnSuccess(200, "User password updated successfully", result);
  } catch (error) {
    logger.error(`Error updating user password in the database: ${error.message}`);
    return ErrorManager.returnError("passwordUpdateError");
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
