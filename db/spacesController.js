import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

export async function addSpace(space) {
  space.id = await id.generateId("space");
  return await dbc.dbSaveData("spaces", space);
}

export async function getSpace(id) {
  return await dbc.dbGetOne("spaces", id);
}

export async function getSpaces() {
  return await dbc.dbGetAll("spaces");
}

export async function getSpaceByName(name) {
  return await dbc.dbGetWhere("spaces", "name", "=", name);
}

export async function updateSpace(id, space) {
  return await dbc.dbUpdateData("spaces", id, space);
}

export async function deleteSpace(id) {
  return await dbc.dbDeleteData("spaces", id);
}

export async function checkSpaceExistence(id) {
  return await dbc.dbCheckExistence("spaces", id);
}
