/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as userSvc from "../../db/userService.js";
import { testsLogger } from "../../utils/logger.js";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const fileName = path.basename(__filename).replace(".test.js", "");

function logs(type, msg) {
  const formattedMsg = `[${fileName}] ${msg}`;
  switch (type) {
    case "info":
      testsLogger.info(formattedMsg);
      break;
    case "warn":
      testsLogger.warn(formattedMsg);
      break;
    case "error":
      testsLogger.error(formattedMsg);
      break;
    default:
      testsLogger.info(formattedMsg);
      break;
  }
}

let userStatus = false;
let userId = null;

beforeAll(async () => {
  await dbCreateTables();
  const checkResult = await userSvc.getUserByEmail("test@mail.com", true);
  if (checkResult && !checkResult.error) {
    userStatus = await userSvc.checkUserStatus(checkResult.id);
    if (!userStatus) {
      await userSvc.disableUser(checkResult.id);
      userStatus = true;
    }
    userId = checkResult.id;
  }
});

describe("User Service Tests", () => {
  test("Insert a new user if it does not exist", async () => {
    if (!userStatus) {
      const user = {
        name: "John Doe",
        email: "test@mail.com",
        type: "normalUser",
        createdBy: "System",
      };
      await userSvc.addUser(user);
      logs("info", "User added");
      userStatus = true;
      userId = (await userSvc.getUserByEmail("test@mail.com")).id;
    } else {
      logs("warn", "User already exists");
    }
  });

  test("Enable an existing user if it is disabled", async () => {
    if (userStatus) {
      const dbUser = await userSvc.getUserByEmail("test@mail.com", true);
      userId = dbUser.id;
      await userSvc.enableUser(userId);
      logs("info", "User enabled");
    } else {
      logs("warn", "User is already enabled");
    }
  });

  test("Update an existing user", async () => {
    const user = {
      name: "Johana Doe",
      email: "test@mail.com",
      type: "adminUser",
      createdBy: "System",
    };
    await userSvc.updateUser(userId, user);
    logs("info", "User updated");
  });

  test("Get an user by its email", async () => {
    const dbUser = await userSvc.getUserByEmail("test@mail.com");
    expect(dbUser.name).toBe("Johana Doe");
    expect(dbUser.type).toBe("adminUser");
  });

  test("Edit an user password", async () => {
    const password = "abc123";
    await userSvc.updateUserPassword(userId, password);
    logs("info", "User password updated");
  });

  test("Get all active users", async () => {
    const activeUsers = await userSvc.getUsers("active");
    expect(activeUsers.length).toBeGreaterThan(0);
  });

  test("Disable an existing user", async () => {
    await userSvc.disableUser(userId);
    logs("info", "User disabled");
  });

  test("Get all active users after disabling", async () => {
    const activeUsers = await userSvc.getUsers("active");
    expect(activeUsers.error).toBe(true);
  });

  test("Get all inactive users", async () => {
    const inactiveUsers = await userSvc.getUsers("inactive");
    expect(inactiveUsers.length).toBeGreaterThan(0);
  });
});
