import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

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
    return ErrorManager.returnError("invalidParameters");
  }

  category.id = await id.generateId("category");

  if (!Array.isArray(category.spaces)) {
    category.spaces = [];
  }
  category.spaces = JSON.stringify(category.spaces);

  try {
    const result = await dbc.dbSaveData("categories", category);
    return ErrorManager.returnSuccess(201, "Category created successfully", result);
  } catch (error) {
    logger.error(`Error saving category to the database: ${error.message}`);
    return ErrorManager.returnError("categorySaveError");
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
    return ErrorManager.returnError("invalidParameters");
  }

  if (category.spaces) {
    if (!Array.isArray(category.spaces)) {
      category.spaces = [];
    }
    category.spaces = JSON.stringify(category.spaces);
  }

  try {
    const result = await dbc.dbUpdateData("categories", id, category);
    return ErrorManager.returnSuccess(200, "Category updated successfully", result);
  } catch (error) {
    logger.error(`Error updating category in the database: ${error.message}`);
    return ErrorManager.returnError("categoryUpdateError");
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
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const newStatus = !(await checkCategoryStatus(id));
    const result = await dbc.dbUpdateData("categories", id, { deleted: newStatus });
    return ErrorManager.returnSuccess(200, "Category status changed successfully", result);
  } catch (error) {
    logger.error(`Error changing category status in the database: ${error.message}`);
    return ErrorManager.returnError("categoryStatusChangeError");
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
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbUpdateData("categories", id, { deleted: false });
    return ErrorManager.returnSuccess(200, "Category enabled successfully", result);
  } catch (error) {
    logger.error(`Error enabling category in the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await dbc.dbUpdateData("categories", id, { deleted: true });
    return ErrorManager.returnSuccess(200, "Category disabled successfully", result);
  } catch (error) {
    logger.error(`Error disabling category in the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
    return ErrorManager.returnError("invalidParameters");
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
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("categoryNotFound");
    }

    // Process spaces
    let category = result[0];

    if (category.spaces) {
      try {
        category.spaces = JSON.parse(category.spaces);
        if (!Array.isArray(category.spaces)) {
          logger.warn(`Spaces is not an array for category ${id}, setting to empty array`);
          category.spaces = [];
        }
      } catch (e) {
        logger.warn(`Could not parse spaces for category ${id}: ${e.message}`);
        category.spaces = [];
      }
    } else {
      category.spaces = [];
    }

    return ErrorManager.returnSuccess(200, "Category retrieved successfully", category);
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
    return ErrorManager.returnError("invalidParameters");
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
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("categoryNotFound");
    }

    // Process spaces
    let category = result[0];

    if (category.spaces) {
      try {
        category.spaces = JSON.parse(category.spaces);
        if (!Array.isArray(category.spaces)) {
          logger.warn(`Spaces is not an array for category ${category.id}, setting to empty array`);
          category.spaces = [];
        }
      } catch (e) {
        logger.warn(`Could not parse spaces for category ${category.id}: ${e.message}`);
        category.spaces = [];
      }
    } else {
      category.spaces = [];
    }

    return ErrorManager.returnSuccess(200, "Category retrieved successfully", category);
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnError("categoryNotFound");
    }

    // Process spaces for each category
    result = result.map((category) => {
      if (category.spaces) {
        try {
          category.spaces = JSON.parse(category.spaces);
          if (!Array.isArray(category.spaces)) {
            logger.warn(`Spaces is not an array for category ${category.id}, setting to empty array`);
            category.spaces = [];
          }
        } catch (e) {
          logger.warn(`Could not parse spaces for category ${category.id}: ${e.message}`);
          category.spaces = [];
        }
      } else {
        category.spaces = [];
      }
      return category;
    });

    return ErrorManager.returnSuccess(200, "Categories retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving categories from the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const category = await getCategory(id, true);
    if (category.success === false) {
      return false;
    }
    return category.data.deleted;
  } catch (error) {
    logger.error(`Error checking category status in the database: ${error.message}`);
    return ErrorManager.handleError(error);
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
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const result = await getCategoryByName(title, true);
    return result.success;
  } catch (error) {
    logger.error(`Error checking if category exists in the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
