import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add a space to the database
export async function addSpace(space) {
  if (!space) {
    throw new Error("Invalid parameters");
  }

  space.id = await id.generateId("space");

  try {
    return await dbc.dbSaveData("spaces", space);
  } catch (error) {
    throw new Error("Error saving space to the database");
  }
}

// Function to update a space in the database
export async function updateSpace(id, space) {
  if (!id || !space) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("spaces", id, space);
  } catch (error) {
    throw new Error("Error updating space in the database");
  }
}

// Function to enable or disable a space in the database
export async function changeSpaceStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const newStatus = !(await checkSpaceStatus(id));
    return await dbc.dbUpdateData("spaces", id, { deleted: newStatus });
  } catch (error) {
    throw new Error("Error changing space status in the database");
  }
}

// Function to enable a space in the database
export async function enableSpace(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("spaces", id, { deleted: false });
  } catch (error) {
    throw new Error("Error enabling space in the database");
  }
}

// Function to disable a space in the database
export async function disableSpace(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    return await dbc.dbUpdateData("spaces", id, { deleted: true });
  } catch (error) {
    throw new Error("Error disabling space in the database");
  }
}

//! Info retrieval operations

// Function to get a space from the database
// It includes the option to include inactive spaces
export async function getSpace(id, includeInactive = false) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetOne("spaces", id);
        break;
      case false:
        result = await dbc.dbGetWhere("spaces", [
          { field: "id", operator: "=", value: id },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Space with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error retrieving space from the database");
  }
}

// Function to get a space by name from the database
// It includes the option to include inactive spaces
export async function getSpaceByName(name, includeInactive = false) {
  if (!name) {
    throw new Error("Invalid parameters");
  }

  let result;

  try {
    switch (includeInactive) {
      case true:
        result = await dbc.dbGetWhere("spaces", [{ field: "name", operator: "=", value: name }]);
        break;
      case false:
        result = await dbc.dbGetWhere("spaces", [
          { field: "name", operator: "=", value: name },
          { field: "deleted", operator: "=", value: false },
        ]);
        break;
      default:
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Space with the required criteria not found");
    }

    return result[0];
  } catch (error) {
    throw new Error("Error retrieving space from the database");
  }
}

// Function to get all spaces from the database
// It can return: all, active (DEFAULT) or inactive spaces
export async function getSpaces(status) {
  let result;

  try {
    switch (status) {
      case "all":
        result = await dbc.dbGetAll("spaces");
        break;
      case "active":
        result = await dbc.dbGetWhere("spaces", { field: "deleted", operator: "=", value: false });
        break;
      case "inactive":
        result = await dbc.dbGetWhere("spaces", { field: "deleted", operator: "=", value: true });
        break;
      default:
        throw new Error("Invalid parameters");
    }

    if (result.length === 0) {
      throw new Error("Spaces with the required criteria not found");
    }

    return result;
  } catch (error) {
    throw new Error("Error retrieving spaces from the database");
  }
}

// Function to check a space's status
export async function checkSpaceStatus(id) {
  if (!id) {
    throw new Error("Invalid parameters");
  }

  try {
    const space = await getSpace(id, true);
    return space.deleted;
  } catch (error) {
    throw new Error("Error checking space status in the database");
  }
}

// Function to check if a space exists
export async function checkSpaceExists(name) {
  if (!name) {
    throw new Error("Invalid parameters");
  }

  try {
    const space = await getSpaceByName(name, true);
    return space;
  } catch (error) {
    throw new Error("Error checking space existence in the database");
  }
}
