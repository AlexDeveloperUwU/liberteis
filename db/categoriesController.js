import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

export async function addCategory(category) {
  category.id = await id.generateId("category");
  return await dbc.dbSaveData("categories", category);
}

export async function getCategory(id) {
  return await dbc.dbGetOne("categories", id);
}

export async function getCategories() {
  return await dbc.dbGetAll("categories");
}

export async function getCategoryByName(name) {
  return await dbc.dbGetWhere("categories", "name", "=", name);
}

export async function updateCategory(id, category) {
  return await dbc.dbUpdateData("categories", id, category);
}

export async function deleteCategory(id) {
  return await dbc.dbDeleteData("categories", id);
}

export async function checkCategoryExistence(id) {
  return await dbc.dbCheckExistence("categories", id);
}
