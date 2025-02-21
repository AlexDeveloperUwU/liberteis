import * as dbc from "./dbController.js";
import { generatePass } from "../utils/password.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

//! Basic CRUD operations

// Function to add an user to the database
export async function addUser(user) {
  if (!user) {
    return { error: true, message: "Invalid parameters" };
  }

  const allowedTypes = ["normalUser", "managerUser", "adminUser"];
  if (!allowedTypes.includes(user.type)) {
    user.type = "normalUser";
  }
  const genPass = await generatePass();
  user.id = await id.generateId("user");
  user.hashedPassword = ds.encryptPass(genPass);
  user.lastLogin = undefined;
  user.lang = "gl";
  user.deleted = false;

  try {
    return await dbc.dbSaveData("users", user);
  } catch (error) {
    logger.error(`Error saving user to the database: ${error.message}`);
    throw new Error("Error saving user to the database");
  }
}

// Function to update an user in the database
export async function updateUser(id, user) {
  if (!id || !user) {
    return { error: true, message: "Invalid parameters" };
  }

  if (Object.keys(user).length === 1 && user.hasOwnProperty("password")) {
    return { error: true, message: "Use the dedicated function to update the password" };
  }

  try {
    return await dbc.dbUpdateData("users", id, user);
  } catch (error) {
    logger.error(`Error updating user in the database: ${error.message}`);
    throw new Error("Error updating user in the database");
  }
}

// Function to update the password of an user in the database
export async function updateUserPassword(id, pass) {
  if (!id || !pass) {
    return { error: true, message: "Invalid parameters" };
  }

  const hashedPass = ds.encryptPass(pass);

  try {
    return await dbc.dbUpdateData("users", id, { hashedPassword: hashedPass });
  } catch (error) {
    logger.error(`Error updating user password in the database: ${error.message}`);
    throw new Error("Error updating user password in the database");
  }
}

// Function to enable or disable an user in the database
export async function changeUserStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const newStatus = !(await checkUserStatus(id));
    return await dbc.dbUpdateData("users", id, { deleted: newStatus });
  } catch (error) {
    logger.error(`Error changing user status in the database: ${error.message}`);
    throw new Error("Error changing user status in the database");
  }
}

// Function to enable an user in the database
export async function enableUser(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("users", id, { deleted: false });
  } catch (error) {
    logger.error(`Error enabling user in the database: ${error.message}`);
    throw new Error("Error enabling user in the database");
  }
}

// Function to disable an user in the database
export async function disableUser(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("users", id, { deleted: true });
  } catch (error) {
    logger.error(`Error disabling user in the database: ${error.message}`);
    throw new Error("Error disabling user in the database");
  }
}

//! Info retrieval operations

// Function to get an user from the database
export async function getUser(id, includeInactive = false) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
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
        return { error: true, message: "Invalid includeInactive parameter" };
    }

    if (result.length === 0) {
      return { error: true, message: "User with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving user from the database: ${error.message}`);
    throw new Error("Error retrieving user from the database");
  }
}

// Function to get an user by email from the database
export async function getUserByEmail(email, includeInactive = false) {
  if (!email) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("users", { field: "email", operator: "=", value: email });
        break;
      case false:
        result = await dbc.dbGetWhere("users", [
          { field: "email", operator: "=", value: email },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return { error: true, message: "Invalid includeInactive parameter" };
    }

    if (result.length === 0) {
      return { error: true, message: "User with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving user by email from the database: ${error.message}`);
    throw new Error("Error retrieving user by email from the database");
  }
}

// Function to get all users from the database
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
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "User with the required criteria not found" };
    }

    return result;
  } catch (error) {
    logger.error(`Error retrieving users from the database: ${error.message}`);
    throw new Error("Error retrieving users from the database");
  }
}

// Function to check an user's status
export async function checkUserStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const user = await getUser(id, true);
    return user.deleted;
  } catch (error) {
    logger.error(`Error checking user status in the database: ${error.message}`);
    throw new Error("Error checking user status in the database");
  }
}

// Function to check if an user exists
export async function checkUserExists(email) {
  if (!email) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    await getUserByEmail(email, true);
    return true;
  } catch (error) {
    logger.error(`Error checking if user exists in the database: ${error.message}`);
    throw new Error("Error checking if user exists in the database");
  }
}
