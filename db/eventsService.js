import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add an event to the database
export async function addEvent(event) {}

// Function to update an event in the database
export async function updateEvent(id, event) {}

// Function to enable or disable an event in the database
export async function changeEventStatus(id) {}

// Function to enable an event in the database
export async function enableEvent(id) {}

// Function to disable an event in the database
export async function disableEvent(id) {}

//! Info retrieval operations

// Function to get an event from the database
// It includes the option to include inactive events
export async function getEvent(id, includeInactive = false) {}

// Function to get an event by name from the database
// It includes the option to include inactive events
export async function getEventByName(name, includeInactive = false) {}

// Function to get all events from the database
// It can return: all, active (DEFAULT) or inactive events
export async function getEvents(status) {}

// Function to check an event's status
export async function checkEventStatus(id) {}

// Function to check if an event exists
export async function checkEventExists(id) {}
