import * as dbc from "./dbController.js";
import { generatePass } from "../utils/password.js";
import * as ds from "../utils/dataSecurity.js";
import * as id from "../utils/idGen.js";

export async function addUser(user) {
  const allowedTypes = ["normalUser", "managerUser", "adminUser"];
  if (!allowedTypes.includes(user.type)) {
    user.type = "normalUser";
  }
  const genPass = await generatePass();
  user.id = await id.generateId("user");
  user.hashedPassword = ds.encryptPass(genPass);
  user.createdDate = new Date().toISOString();
  user.lastLogin = null;
  user.lang = "gl";
  return await dbc.dbSaveData("users", user);
}

export async function getUser(id) {
  return await dbc.dbGetOne("users", id);
}

export async function getUsers() {
  return await dbc.dbGetAll("users");
}

export async function getUserByName(name) {
  return await dbc.dbGetWhere("users", "name", "=", name);
}

export async function updateUser(id, user) {
  return await dbc.dbUpdateData("users", id, user);
}

export async function updateUserPassword(id, pass) {
  const hashedPass = ds.encryptPass(pass);
  return await dbc.dbUpdateData("users", id, { hashedPassword: hashedPass });
}

export async function deleteUser(id) {
  return await dbc.dbDeleteData("users", id);
}

export async function checkUserExistence(id) {
  return await dbc.dbCheckExistence("users", id);
}
