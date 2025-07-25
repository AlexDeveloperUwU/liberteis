import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";
import ErrorManager from "../errors/errorManager.js";

/**
 * Adds a category to the database.
 * @param {Object} category - Object representing the category to add.
 * @returns {Promise<Object>} Operation result.
 */
export async function addCategory(category) {
  if (!category) {
    return ErrorManager.returnError("invalidParameters");
  }

  category.id = await id.generateId("category");
  category.deleted = false;

  logger.info("Category data before saving:", JSON.stringify(category));

  if (typeof category.spaces === "string") {
    try {
      JSON.parse(category.spaces);
      logger.info("Spaces field is valid JSON string:", category.spaces);
    } catch (err) {
      logger.error("Invalid JSON in spaces field:", category.spaces, err.message);
      return ErrorManager.returnError("invalidParameters");
    }
  } else {
    logger.error("Spaces field is not a string:", typeof category.spaces, category.spaces);
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    await dbc.dbSaveData("categories", category);
    return ErrorManager.returnSuccess(201, "Category created successfully", { code: 201 });
  } catch (error) {
    logger.error(`Error saving category to the database: ${error.message}`);
    return ErrorManager.returnError("categorySaveError");
  }
}

/**
 * Updates a category in the database.
 * @param {string} id - ID of the category to update.
 * @param {Object} category - Object with the updated category data.
 * @returns {Promise<Object>} Operation result.
 */
export async function updateCategory(id, category) {
  if (!id || !category) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const existingCategory = await getCategory(id, true);
    if (!existingCategory.success) {
      return ErrorManager.returnError("categoryNotFound");
    }

    await dbc.dbUpdateData("categories", id, category);
    return ErrorManager.returnSuccess(200, "Category updated successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error updating category in the database: ${error.message}`);
    return ErrorManager.returnError("categoryUpdateError");
  }
}

/**
 * Changes the status of a category (enable/disable) in the database.
 * @param {string} id - ID of the category whose status will be changed.
 * @returns {Promise<Object>} Operation result.
 */
export async function changeCategoryStatus(id) {
  if (!id) {
    return ErrorManager.returnError("invalidParameters");
  }

  try {
    const currentCategory = await getCategory(id, true);
    if (!currentCategory.success) {
      return ErrorManager.returnError("categoryNotFound");
    }

    const newStatus = !currentCategory.data.deleted;
    await dbc.dbUpdateData("categories", id, { deleted: newStatus });
    return ErrorManager.returnSuccess(200, "Category status changed successfully", { code: 200 });
  } catch (error) {
    logger.error(`Error changing category status in the database: ${error.message}`);
    return ErrorManager.returnError("categoryStatusChangeError");
  }
}

/**
 * Gets a category from the database.
 * @param {string} id - ID of the category to retrieve.
 * @param {boolean} [includeInactive=false] - Whether to include inactive categories.
 * @returns {Promise<Object>} Found category or error message.
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

    return ErrorManager.returnSuccess(200, "Category retrieved successfully", result[0]);
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets all categories from the database according to their status.
 * @param {string} [status="active"] - Status of categories to retrieve ("all", "active", "inactive").
 * @returns {Promise<Object[]>} List of found categories or error message.
 */
export async function getCategories(status = "active") {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("categories");
        break;
      case "active":
        result = await dbc.dbGetWhere("categories", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("categories", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    if (result.length === 0) {
      return ErrorManager.returnSuccess(200, "No categories found", []);
    }

    return ErrorManager.returnSuccess(200, "Categories retrieved successfully", result);
  } catch (error) {
    logger.error(`Error retrieving categories from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}

/**
 * Gets a category count summary.
 * @param {string} [type="null"] - Status of categories to count ("all", "active", "inactive").
 * @return {Promise<Object>} Summary of categories count by status.
 */
export async function getCategoriesCount(type = "null") {
  try {
    let resultData;
    switch (type) {
      case "all": {
        resultData = await dbc.dbGetAll("categories");
        break;
      }

      case "active": {
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activeCategories = await dbc.dbGetWhere("categories", activeFilters);
        resultData = { active: activeCategories.length };
        break;
      }
      case "inactive": {
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactiveCategories = await dbc.dbGetWhere("categories", inactiveFilters);
        resultData = { inactive: inactiveCategories.length };
        break;
      }

      case "null": {
        const totalCategories = await dbc.dbGetAll("categories");
        const activeFilters = [{ field: "deleted", operator: "=", value: false }];
        const activeCategories = await dbc.dbGetWhere("categories", activeFilters);
        const inactiveFilters = [{ field: "deleted", operator: "=", value: true }];
        const inactiveCategories = await dbc.dbGetWhere("categories", inactiveFilters);
        resultData = {
          total: totalCategories.length,
          active: activeCategories.length,
          inactive: inactiveCategories.length,
        };
        break;
      }
      default:
        return ErrorManager.returnError("invalidParameters");
    }

    return ErrorManager.returnSuccess(200, "Categories count retrieved successfully", resultData);
  } catch (error) {
    logger.error(`Error retrieving categories count from the database: ${error.message}`);
    return ErrorManager.handleError(error);
  }
}
