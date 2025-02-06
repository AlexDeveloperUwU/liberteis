import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add an event to the database
export async function addEvent(event) {
  if (!event) {
    throw new Error("Invalid parameters");
  }

  event.id = await id.generateId("event");

  try {
    return await dbc.dbSaveData("events", event);
  } catch (error) {
    throw new Error("Error saving event to the database");
  }
}

// Function to update an event in the database
export async function updateEvent(id, event) {
  if (!id || !event) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("events", id, event);
  } catch (error) {
    throw new Error("Error updating event in the database");
  }
}

// Function to enable or disable an event in the database
export async function changeEventStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const newStatus = !(await checkEventStatus(id));
    return await dbc.dbUpdateData("events", id, { deleted: newStatus });
  } catch (error) {
    throw new Error("Error changing event status in the database");
  }
}

// Function to enable an event in the database
export async function enableEvent(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("events", id, { deleted: false });
  } catch (error) {
    throw new Error("Error enabling event in the database");
  }
}

// Function to disable an event in the database
export async function disableEvent(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("events", id, { deleted: true });
  } catch (error) {
    throw new Error("Error disabling event in the database");
  }
}

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
export async function checkEventExists(title) {}
