import * as dbc from "./dbController.js";
import { generatePass } from "../utils/password.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

//! Operaciones CRUD básicas

/**
 * Agrega un usuario a la base de datos.
 * @param {Object} user - Objeto que representa al usuario.
 * @returns {Promise<Object>} Resultado de la operación.
 */
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

/**
 * Actualiza un usuario en la base de datos.
 * @param {string} id - ID del usuario.
 * @param {Object} user - Objeto con los datos actualizados del usuario.
 * @returns {Promise<Object>} Resultado de la operación.
 */
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

/**
 * Actualiza la contraseña de un usuario en la base de datos.
 * @param {string} id - ID del usuario.
 * @param {string} pass - Nueva contraseña del usuario.
 * @returns {Promise<Object>} Resultado de la operación.
 */
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

/**
 * Cambia el estado de un usuario (habilitado/deshabilitado) en la base de datos.
 * @param {string} id - ID del usuario.
 * @returns {Promise<Object>} Resultado de la operación.
 */
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

/**
 * Habilita un usuario en la base de datos.
 * @param {string} id - ID del usuario.
 * @returns {Promise<Object>} Resultado de la operación.
 */
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

/**
 * Deshabilita un usuario en la base de datos.
 * @param {string} id - ID del usuario.
 * @returns {Promise<Object>} Resultado de la operación.
 */
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

//! Operaciones de recuperación de información

/**
 * Obtiene un usuario de la base de datos.
 * @param {string} id - ID del usuario.
 * @param {boolean} [includeInactive=false] - Si se deben incluir usuarios inactivos.
 * @returns {Promise<Object>} Usuario encontrado o un mensaje de error.
 */
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

/**
 * Obtiene un usuario por correo electrónico de la base de datos.
 * @param {string} email - Correo electrónico del usuario.
 * @param {boolean} [includeInactive=false] - Si se deben incluir usuarios inactivos.
 * @returns {Promise<Object>} Usuario encontrado o un mensaje de error.
 */
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

/**
 * Obtiene todos los usuarios de la base de datos.
 * @param {string} [status="active"] - Estado de los usuarios a recuperar ("all", "active", "inactive").
 * @returns {Promise<Array>} Lista de usuarios encontrados o un mensaje de error.
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

/**
 * Verifica el estado de un usuario (habilitado/deshabilitado).
 * @param {string} id - ID del usuario.
 * @returns {Promise<boolean>} Estado del usuario.
 */
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

/**
 * Verifica si un usuario existe en la base de datos.
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Promise<boolean>} `true` si el usuario existe, de lo contrario lanza un error.
 */
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
