import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add a category to the database
export async function addCategory(category) {}

// Function to update a category in the database
export async function updateCategory(id, category) {}

// Function to enable or disable a category in the database
export async function changeCategoryStatus(id) {}

// Function to enable an event in the database
export async function enableCategory(id) {}

// Function to disable an event in the database
export async function disableCategory(id) {}

//! Info retrieval operations

// Function to get a category from the database
// It includes the option to include inactive categories
export async function getCategory(id, includeInactive = false) {}

// Function to get a category by name from the database
// It includes the option to include inactive categories
export async function getCategoryByName(name, includeInactive = false) {}

// Function to get all categories from the database
// It can return: all, active (DEFAULT) or inactive categories
export async function getCategories(status) {}

// Function to check a category's status
export async function checkCategoryStatus(id) {}

// Function to check if a category exists
export async function checkCategoryExists(title) {}
