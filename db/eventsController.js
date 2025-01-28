import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

export async function addEvent(event) {
  event.id = await id.generateId("event");
  return await dbc.dbSaveData("events", event);
}

export async function getEvent(id) {
  return await dbc.dbGetOne("events", id);
}

export async function getEvents() {
  return await dbc.dbGetAll("events");
}

export async function getEventByTitle(title) {
  return await dbc.dbGetWhere("events", { field: "title", operator: "=", value: title });
}

export async function updateEvent(id, event) {
  return await dbc.dbUpdateData("events", id, event);
}

export async function deleteEvent(id) {
  return await dbc.dbDeleteData("events", id);
}

export async function checkEventExistence(id) {
  return await dbc.dbCheckExistence("events", id);
}
