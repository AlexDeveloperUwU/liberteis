import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";
import { logger } from "../utils/logger.js";

//! Basic CRUD operations

// Function to add a category to the database
export async function addCategory(category) {
  if (!category) {
    return { error: true, message: "Invalid parameters" };
  }

  category.id = await id.generateId("category");

  try {
    return await dbc.dbSaveData("categories", category);
  } catch (error) {
    logger.error(`Error saving category to the database: ${error.message}`);
    throw new Error("Error saving category to the database");
  }
}

// Function to update a category in the database
export async function updateCategory(id, category) {
  if (!id || !category) {
    return { error: true, message: "Invalid parameters" };
  }

  try {
    return await dbc.dbUpdateData("categories", id, category);
  } catch (error) {
    logger.error(`Error updating category in the database: ${error.message}`);
    throw new Error("Error updating category in the database");
  }
}

// Function to enable or disable a category in the database
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

// Function to enable an event in the database
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

// Function to disable an event in the database
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

//! Info retrieval operations

// Function to get a category from the database
// It includes the option to include inactive categories
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
      return { error: true, message: "Category with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    throw new Error("Error retrieving category from the database");
  }
}

// Function to get a category by name from the database
// It includes the option to include inactive categories
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
      return { error: true, message: "Category with the required criteria not found" };
    }

    return result[0];
  } catch (error) {
    logger.error(`Error retrieving category from the database: ${error.message}`);
    throw new Error("Error retrieving category from the database");
  }
}

// Function to get all categories from the database
// It can return: all, active (DEFAULT) or inactive categories
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
      return { error: true, message: "Category with the required criteria not found" };
    }

    return result;
  } catch (error) {
    logger.error(`Error retrieving categories from the database: ${error.message}`);
    throw new Error("Error retrieving categories from the database");
  }
}

// Function to check a category's status
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

// Function to check if a category exists
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
