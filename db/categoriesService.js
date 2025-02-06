import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add a category to the database
export async function addCategory(category) {
  if (!category) {
    throw new Error("Invalid parameters");
  }

  category.id = await id.generateId("category");

  try {
    return await dbc.dbSaveData("categories", category);
  } catch (error) {
    throw new Error("Error saving category to the database");
  }
}

// Function to update a category in the database
export async function updateCategory(id, category) {
  if (!id || !category) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("categories", id, category);
  } catch (error) {
    throw new Error("Error updating category in the database");
  }
}

// Function to enable or disable a category in the database
export async function changeCategoryStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const newStatus = !(await checkCategoryStatus(id));
    return await dbc.dbUpdateData("categories", id, { deleted: newStatus });
  } catch (error) {
    throw new Error("Error changing category status in the database");
  }
}

// Function to enable an event in the database
export async function enableCategory(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("categories", id, { deleted: false });
  } catch (error) {
    throw new Error("Error enabling category in the database");
  }
}

// Function to disable an event in the database
export async function disableCategory(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("categories", id, { deleted: true });
  } catch (error) {
    throw new Error("Error disabling category in the database");
  }
}

//! Info retrieval operations

// Function to get a category from the database
// It includes the option to include inactive categories
export async function getCategory(id, includeInactive = false) {
  if (!id) {
    throw new Error("Invalid parameters");
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
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Category with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error retrieving category from the database");
  }
}

// Function to get a category by name from the database
// It includes the option to include inactive categories
export async function getCategoryByName(name, includeInactive = false) {
  if (!name) {
    throw new Error("Invalid parameters");
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
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Category with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error retrieving category from the database");
  }
}

// Function to get all categories from the database
// It can return: all, active (DEFAULT) or inactive categories
export async function getCategories(status) {}

// Function to check a category's status
export async function checkCategoryStatus(id) {}

// Function to check if a category exists
export async function checkCategoryExists(title) {}
