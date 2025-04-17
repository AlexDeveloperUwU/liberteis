import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

/**
 * Agrega un espacio a la base de datos.
 * @param {Object} space - Objeto que representa el espacio a agregar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function addSpace(space) {
  if (!space) {
    return { error: true, message: "Invalid parameters" };
  }

  space.id = await id.generateId("space");
  space.deleted = false;

  try {
    return await dbc.dbSaveData("spaces", space);
  } catch (error) {
    logger.error(`Error saving space to the database: ${error.message}`);
    throw new Error("Error saving space to the database");
  }
}

/**
 * Actualiza un espacio en la base de datos.
 * @param {string} id - ID del espacio a actualizar.
 * @param {Object} space - Objeto con los datos actualizados del espacio.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function updateSpace(id, space) {
  if (!id || !space) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const existingSpace = await getSpace(id, true);
    if (!existingSpace) {
      return { error: true, message: "Space not found" };
    }

    return await dbc.dbUpdateData("spaces", id, space);
  } catch (error) {
    logger.error(`Error updating space in the database: ${error.message}`);
    throw new Error("Error updating space in the database");
  }
}

/**
 * Cambia el estado de un espacio (habilitar/deshabilitar) en la base de datos.
 * @param {string} id - ID del espacio cuyo estado se cambiará.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function changeSpaceStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const newStatus = !(await checkSpaceStatus(id));
    return await dbc.dbUpdateData("spaces", id, { deleted: newStatus });
  } catch (error) {
    logger.error(`Error changing space status in the database: ${error.message}`);
    throw new Error("Error changing space status in the database");
  }
}

/**
 * Habilita un espacio en la base de datos.
 * @param {string} id - ID del espacio a habilitar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function enableSpace(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("spaces", id, { deleted: false });
  } catch (error) {
    logger.error(`Error enabling space in the database: ${error.message}`);
    throw new Error("Error enabling space in the database");
  }
}

/**
 * Deshabilita un espacio en la base de datos.
 * @param {string} id - ID del espacio a deshabilitar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function disableSpace(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("spaces", id, { deleted: true });
  } catch (error) {
    logger.error(`Error disabling space in the database: ${error.message}`);
    throw new Error("Error disabling space in the database");
  }
}

/**
 * Obtiene un espacio de la base de datos.
 * @param {string} id - ID del espacio a obtener.
 * @param {boolean} [includeInactive=false] - Si se deben incluir espacios inactivos.
 * @returns {Promise<Object>} Espacio encontrado o un mensaje de error.
 */
export async function getSpace(id, includeInactive = false) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetOne("spaces", id);
        break;
      case false:
        result = await dbc.dbGetWhere("spaces", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "Space with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving space from the database: ${error.message}`);
    throw new Error("Error retrieving space from the database");
  }
}

/**
 * Obtiene un espacio por nombre de la base de datos.
 * @param {string} name - Nombre del espacio a obtener.
 * @param {boolean} [includeInactive=false] - Si se deben incluir espacios inactivos.
 * @returns {Promise<Object>} Espacio encontrado o un mensaje de error.
 */
export async function getSpaceByName(name, includeInactive = false) {
  if (!name) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("spaces", [{ field: "name", operator: "=", value: name }]);
        break;
      case false:
        result = await dbc.dbGetWhere("spaces", [
          { field: "name", operator: "=", value: name },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "Space with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving space by name from the database: ${error.message}`);
    throw new Error("Error retrieving space by name from the database");
  }
}

/**
 * Obtiene todos los espacios de la base de datos según el estado.
 * @param {string} [status="active"] - Estado de los espacios a obtener ("all", "active", "inactive").
 * @returns {Promise<Object[]>} Lista de espacios encontrados o un mensaje de error.
 */
export async function getSpaces(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("spaces");
        break;
      case "active":
        result = await dbc.dbGetWhere("spaces", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("spaces", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return { error: true, message: "Spaces with the required criteria not found" };
    }

    return result;
  } catch (error) {
    logger.error(`Error retrieving spaces from the database: ${error.message}`);
    throw new Error("Error retrieving spaces from the database");
  }
}

/**
 * Verifica el estado de un espacio en la base de datos.
 * @param {string} id - ID del espacio a verificar.
 * @returns {Promise<boolean>} Estado del espacio (true si está eliminado, false si está activo).
 */
export async function checkSpaceStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const space = await getSpace(id, true);
    return space.deleted;
  } catch (error) {
    logger.error(`Error checking space status in the database: ${error.message}`);
    throw new Error("Error checking space status in the database");
  }
}

/**
 * Verifica si un espacio existe en la base de datos.
 * @param {string} name - Nombre del espacio a verificar.
 * @returns {Promise<Object>} Espacio encontrado o un mensaje de error.
 */
export async function checkSpaceExists(name) {
  if (!name) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const space = await getSpaceByName(name, true);
    return space;
  } catch (error) {
    logger.error(`Error checking space existence in the database: ${error.message}`);
    throw new Error("Error checking space existence in the database");
  }
}
