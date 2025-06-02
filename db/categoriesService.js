import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

/**
 * Adds a category to the database.
 * @async
 * @param {Object} category - Object representing the category.
 * @param {string} category.name - Name of the category.
 * @param {Array} [category.spaces=[]] - Spaces associated with the category.
 * @returns {Promise<Object>} Operation result.
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
 * Updates a category in the database.
 * @async
 * @param {string} id - ID of the category to update.
 * @param {Object} category - Object with updated category data.
 * @returns {Promise<Object>} Operation result.
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
 * Changes a category's status (enable/disable) in the database.
 * @async
 * @param {string} id - Category ID.
 * @returns {Promise<Object>} Operation result.
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
 * Enables a category in the database.
 * @async
 * @param {string} id - Category ID.
 * @returns {Promise<Object>} Operation result.
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
 * Disables a category in the database.
 * @async
 * @param {string} id - Category ID.
 * @returns {Promise<Object>} Operation result.
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
 * Retrieves a category from the database.
 * @async
 * @param {string} id - Category ID.
 * @param {boolean} [includeInactive=false] - Whether to include inactive categories.
 * @returns {Promise<Object>} The found category.
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
 * Retrieves a category by its name from the database.
 * @async
 * @param {string} name - Category name.
 * @param {boolean} [includeInactive=false] - Whether to include inactive categories.
 * @returns {Promise<Object>} The found category.
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
 * Retrieves all categories from the database.
 * @async
 * @param {string} [status="active"] - Status of categories to retrieve ("all", "active", "inactive").
 * @returns {Promise<Array>} List of categories.
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
 * Checks the status of a category in the database.
 * @async
 * @param {string} id - Category ID.
 * @returns {Promise<boolean>} Category status (true if disabled).
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
 * Checks if a category exists in the database.
 * @async
 * @param {string} title - Category title.
 * @returns {Promise<boolean>} True if the category exists, otherwise throws an error.
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
