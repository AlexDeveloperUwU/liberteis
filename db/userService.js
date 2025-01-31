import * as dbc from "./dbController.js";
import { generatePass } from "../utils/password.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add an user to the database
export async function addUser(user) {}

// Function to update an user in the database
export async function updateUser(id, user) {}

// Function to update the password of an user in the database
export async function updateUserPassword(id, pass) {}

// Function to enable or disable an user in the database
export async function changeUserStatus(id) {}

// Function to enable an user in the database
export async function enableUser(id) {}

// Function to disable an user in the database
export async function disableUser(id) {}

//! Info retrieval operations

// Function to get an user from the database
// It includes the option to include inactive users
export async function getUser(id, includeInactive = false) {}

// Function to get an user by email from the database
// It includes the option to include inactive users
export async function getUserByEmail(email, includeInactive = false) {}

// Function to get all users from the database
// It can return: all, active (DEFAULT) or inactive users
export async function getUsers(status) {}

// Function to check an user's status
export async function checkUserStatus(id) {}

// Function to check if an user exists
export async function checkUserExists(email) {}
