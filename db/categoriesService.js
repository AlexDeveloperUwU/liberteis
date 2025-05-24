import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

/**
 * Agrega una categoría a la base de datos.
 * @async
 * @param {Object} category - Objeto que representa la categoría.
 * @param {string} category.name - Nombre de la categoría.
 * @param {Array} [category.spaces=[]] - Espacios asociados a la categoría.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function addCategory(category) {
  if (!category) {
    return { error: true, message: "Invalid parameters" };
  }

  category.id = await id.generateId("category");

  // Validate and process spaces
  if (!Array.isArray(category.spaces)) {
    category.spaces = [];
  }
  category.spaces = JSON.stringify(category.spaces);

  try {
    return await dbc.dbSaveData("categories", category);
  } catch (error) {
    logger.error(`Error saving category to the database: ${error.message}`);
    throw new Error("Error saving category to the database");
  }
}

/**
 * Actualiza una categoría en la base de datos.
 * @async
 * @param {string} id - ID de la categoría a actualizar.
 * @param {Object} category - Objeto con los datos actualizados de la categoría.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function updateCategory(id, category) {
  if (!id || !category) {
    return { error: true, message: "Invalid parameters" };
  }

  if (category.spaces) {
    if (!Array.isArray(category.spaces)) {
      category.spaces = [];
    }
    category.spaces = JSON.stringify(category.spaces);
  }

  try {
    return await dbc.dbUpdateData("categories", id, category);
  } catch (error) {
    logger.error(`Error updating category in the database: ${error.message}`);
    throw new Error("Error updating category in the database");
  }
}

/**
 * Cambia el estado de una categoría (habilitar/deshabilitar) en la base de datos.
 * @async
 * @param {string} id - ID de la categoría.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function changeCategoryStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const newStatus = !(await checkCategoryStatus(id));
    return await dbc.dbUpdateData("categories", id, { deleted: newStatus });
  } catch (error) {
    logger.error(`Error changing category status in the database: ${error.message}`);
    throw new Error("Error changing category status in the database");
  }
}

/**
 * Habilita una categoría en la base de datos.
 * @async
 * @param {string} id - ID de la categoría.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function enableCategory(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("categories", id, { deleted: false });
  } catch (error) {
    logger.error(`Error enabling category in the database: ${error.message}`);
    throw new Error("Error enabling category in the database");
  }
}

/**
 * Deshabilita una categoría en la base de datos.
 * @async
 * @param {string} id - ID de la categoría.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function disableCategory(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("categories", id, { deleted: true });
  } catch (error) {
    logger.error(`Error disabling category in the database: ${error.message}`);
    throw new Error("Error disabling category in the database");
  }
}

/**
 * Obtiene una categoría de la base de datos.
 * @async
 * @param {string} id - ID de la categoría.
 * @param {boolean} [includeInactive=false] - Si se deben incluir categorías inactivas.
 * @returns {Promise<Object>} La categoría encontrada.
 */
export async function getCategory(id, includeInactive = false) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetOne("categories", id);
        break;
      case false:
        result = await dbc.dbGetWhere("categories", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Category with the required criteria not found",
      };
    }

    if (result[0].spaces) {
      if (!Array.isArray(result[0].spaces)) {
        logger.warn(`Spaces is not an array for category ${id}, setting to empty array`);
        result[0].spaces = [];
      }
    } else {
      result[0].spaces = [];
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    throw new Error("Error retrieving category from the database");
  }
}

/**
 * Obtiene una categoría por su nombre de la base de datos.
 * @async
 * @param {string} name - Nombre de la categoría.
 * @param {boolean} [includeInactive=false] - Si se deben incluir categorías inactivas.
 * @returns {Promise<Object>} La categoría encontrada.
 */
export async function getCategoryByName(name, includeInactive = false) {
  if (!name) {
    return { error: true, message: "Invalid parameters" };
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("categories", [{ field: "name", operator: "=", value: name }]);
        break;
      case false:
        result = await dbc.dbGetWhere("categories", [
          { field: "name", operator: "=", value: name },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Category with the required criteria not found",
      };
    }

    if (result[0].spaces) {
      if (!Array.isArray(result[0].spaces)) {
        logger.warn(`Spaces is not an array for category ${result[0].id}, setting to empty array`);
        result[0].spaces = [];
      }
    } else {
      result[0].spaces = [];
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    throw new Error("Error retrieving category from the database");
  }
}

/**
 * Obtiene todas las categorías de la base de datos.
 * @async
 * @param {string} [status="active"] - Estado de las categorías a obtener ("all", "active", "inactive").
 * @returns {Promise<Array>} Lista de categorías.
 */
export async function getCategories(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("categories");
        break;
      case "active":
        result = await dbc.dbGetWhere("categories", {
          field: "deleted",
          operator: "=",
          value: false,
        });
        break;
      case "inactive":
        result = await dbc.dbGetWhere("categories", {
          field: "deleted",
          operator: "=",
          value: true,
        });
        break;
      default:
        return { error: true, message: "Invalid parameters" };
    }

    if (result.length === 0) {
      return {
        error: true,
        message: "Category with the required criteria not found",
      };
    }

    result = result.map((category) => {
      if (category.spaces) {
        if (!Array.isArray(category.spaces)) {
          logger.warn(`Spaces is not an array for category ${category.id}, setting to empty array`);
          category.spaces = [];
        }
      } else {
        category.spaces = [];
      }
      return category;
    });

    return result;
  } catch (error) {
    logger.error(`Error retrieving categories from the database: ${error.message}`);
    throw new Error("Error retrieving categories from the database");
  }
}

/**
 * Verifica el estado de una categoría en la base de datos.
 * @async
 * @param {string} id - ID de la categoría.
 * @returns {Promise<boolean>} Estado de la categoría (true si está deshabilitada).
 */
export async function checkCategoryStatus(id) {
  if (!id) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    const category = await getCategory(id);
    return category.deleted;
  } catch (error) {
    logger.error(`Error checking category status in the database: ${error.message}`);
    throw new Error("Error checking category status in the database");
  }
}

/**
 * Verifica si una categoría existe en la base de datos.
 * @async
 * @param {string} title - Título de la categoría.
 * @returns {Promise<boolean>} True si la categoría existe, de lo contrario lanza un error.
 */
export async function checkCategoryExists(title) {
  if (!title) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    await getCategoryByName(title, true);
    return true;
  } catch (error) {
    logger.error(`Error checking if category exists in the database: ${error.message}`);
    throw new Error("Error checking if category exists in the database");
  }
}
