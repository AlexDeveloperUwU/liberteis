import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add a space to the database
export async function addSpace(space) {}

// Function to update a space in the database
export async function updateSpace(id, space) {}

// Function to enable or disable a space in the database
export async function changeSpaceStatus(id) {}

// Function to enable a space in the database
export async function enableSpace(id) {}

// Function to disable a space in the database
export async function disableSpace(id) {}

//! Info retrieval operations

// Function to get a space from the database
// It includes the option to include inactive spaces
export async function getSpace(id, includeInactive = false) {}

// Function to get a space by name from the database
// It includes the option to include inactive spaces
export async function getSpaceByName(name, includeInactive = false) {}

// Function to get all spaces from the database
// It can return: all, active (DEFAULT) or inactive spaces
export async function getSpaces(status) {}

// Function to check a space's status
export async function checkSpaceStatus(id) {}

// Function to check if a space exists
export async function checkSpaceExists(name) {}
