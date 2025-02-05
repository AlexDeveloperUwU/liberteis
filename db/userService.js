import * as dbc from "./dbController.js";
import { generatePass } from "../utils/password.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add an user to the database
export async function addUser(user) {
  if (!user) {
    throw new Error("Invalid parameters");
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
  return await dbc.dbSaveData("users", user);
}

// Function to update an user in the database
// TODO: Do not allow password update here, use the dedicated function
export async function updateUser(id, user) {
  if (!id || !user) {
    throw new Error("Invalid parameters");
  }

  if (Object.keys(user).length === 1 && user.hasOwnProperty("password")) {
    throw new Error("Use the dedicated function to update the password");
  }

  return await dbc.dbUpdateData("users", id, user);
}

// Function to update the password of an user in the database
export async function updateUserPassword(id, pass) {
  if (!id || !pass) {
    throw new Error("Invalid parameters");
  }

  const hashedPass = ds.encryptPass(pass);
  return await dbc.dbUpdateData("users", id, { hashedPassword: hashedPass });
}

// Function to enable or disable an user in the database
export async function changeUserStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  const newStatus = !(await checkUserStatus(id));
  return await dbc.dbUpdateData("users", id, { deleted: newStatus });
}

// Function to enable an user in the database
export async function enableUser(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  return await dbc.dbUpdateData("users", id, { deleted: false });
}

// Function to disable an user in the database
export async function disableUser(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  return await dbc.dbUpdateData("users", id, { deleted: true });
}

//! Info retrieval operations

// Function to get an user from the database
// It includes the option to include inactive users
export async function getUser(id, includeInactive = false) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  let result;

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
      throw new Error("Invalid includeInactive parameter");
  }

  if (result.length === 0) {
    throw new Error("User with the required criteria not found");
  }

  return result[0];
}

// Function to get an user by email from the database
// It includes the option to include inactive users
export async function getUserByEmail(email, includeInactive = false) {
  if (!email) {
    throw new Error("Invalid parameters");
  }

  let result;

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
      throw new Error("Invalid includeInactive parameter");
  }

  if (result.length === 0) {
    throw new Error("User with the required criteria not found");
  }

  return result[0];
}

// Function to get all users from the database
// It can return: all, active (DEFAULT) or inactive users
export async function getUsers(status = "active") {
  if (!status) {
    status = "active";
  }

  let result;

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
      throw new Error("Invalid status parameter");
  }

  if (result.length === 0) {
    throw new Error("User with the required criteria not found");
  }

  return result;
}

// Function to check an user's status
export async function checkUserStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  const user = await getUser(id);
  return user.deleted;
}

// Function to check if an user exists
export async function checkUserExists(email) {
  if (!email) {
    throw new Error("Invalid parameters");
  }

  try {
    await getUserByEmail(email, true);
    return true;
  } catch (error) {
    return false;
  }
}
