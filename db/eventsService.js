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
export async function getEvent(id, includeInactive = false) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetData("events", id);
        break;
      case false:
        result = await dbc.dbGetWhere("events", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Event with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error getting event from the database");
  }
}

// Function to get an event by title from the database
// It includes the option to include inactive events
export async function getEventByTitle(title, includeInactive = false) {
  if (!title) {
    throw new Error("Invalid parameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("events", [{ field: "title", operator: "=", value: title }]);
        break;
      case false:
        result = await dbc.dbGetWhere("events", [
          { field: "title", operator: "=", value: title },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Event with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error getting event from the database");
  }
}

// Function to get all events from the database
// It can return: all, active (DEFAULT) or inactive events
export async function getEvents(status) {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("events");
        break;
      case "active":
        result = await dbc.dbGetWhere("events", [{ field: "deleted", operator: "=", value: false }]);
        break;
      case "inactive":
        result = await dbc.dbGetWhere("events", [{ field: "deleted", operator: "=", value: true }]);
        break;
      default:
        throw new Error("Invalid parameterss");
    }

    if (result.length === 0) {
      throw new Error("Events with the required criteria not found");
    }

    return result;
  } catch (error) {
    throw new Error("Error getting events from the database");
  }
}

// Function to check an event's status
export async function checkEventStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const result = await getEvent(id, true);
    return result.deleted;
  } catch (error) {
    throw new Error("Error checking event status in the database");
  }
}

// Function to check if an event exists
export async function checkEventExists(title) {
  if (!title) {
    throw new Error("Invalid parameters");
  }

  try {
    await getEventByTitle(title, true);
    return true;
  } catch (error) {
    return false;
  }
}
