/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as userSvc from "../../db/userService.js";
import * as spacesSvc from "../../db/spacesService.js";
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

let userId;
let spaceId;
let spaceDisabled;

beforeAll(async () => {
  await dbCreateTables();
  const checkResult = await userSvc.getUserByEmail("test@mail.com", true);
  if (checkResult && !checkResult.error) {
    userId = checkResult.id;
    await userSvc.enableUser(userId);
  } else {
    const user = {
      name: "John Doe",
      email: "test@mail.com",
      type: "normalUser",
      createdBy: "System",
    };
    await userSvc.addUser(user);
    const newUser = await userSvc.getUserByEmail("test@mail.com", true);
    userId = newUser.id;
  }

  const checkResult2 = await spacesSvc.getSpaceByName("Test Space", true);
  if (checkResult2 && !checkResult2.error) {
    spaceId = checkResult2.id;
    spaceDisabled = !(await spacesSvc.checkSpaceStatus(spaceId));
    if (!spaceDisabled) {
      await spacesSvc.enableSpace(spaceId);
      spaceDisabled = false;
    }
  } else {
    const space = {
      name: "Test Space",
      location: "Test Location",
      info: "Test Info",
      createdBy: userId,
    };
    await spacesSvc.addSpace(space);
    const newSpace = await spacesSvc.getSpaceByName("Test Space", true);
    spaceId = newSpace.id;
    spaceDisabled = false;
  }
});

describe("Spaces Service Tests", () => {
  test("Insert a new space if it does not exist", async () => {
    if (spaceDisabled) {
      const space = {
        name: "Test Space",
        location: "Test Location",
        info: "Test Info",
        createdBy: userId,
      };
      await spacesSvc.addSpace(space);
      logs("info", "Space added");
    } else {
      logs("warn", "Space already exists");
    }
  });

  test("Enable an existing space if it is disabled", async () => {
    if (spaceDisabled) {
      await spacesSvc.enableSpace(spaceId);
      logs("info", "Space enabled");
    } else {
      logs("warn", "Space is already enabled");
    }
  });

  test("Update an existing space", async () => {
    const space = {
      info: "Test Info Updated",
    };
    await spacesSvc.updateSpace(spaceId, space);
    logs("info", "Space updated");

    const dbSpace = await spacesSvc.getSpace(spaceId, true);
    expect(dbSpace.info).toBe("Test Info Updated");
  });

  test("Get an space by its name", async () => {
    const dbSpace = await spacesSvc.getSpace(spaceId, true);
    expect(dbSpace.name).toBe("Test Space");
    expect(dbSpace.info).toBe("Test Info Updated");
    expect(dbSpace.location).toBe("Test Location");
  });

  test("Get all spaces", async () => {
    const dbSpaces = await spacesSvc.getSpaces("all");
    expect(dbSpaces.length).toBeGreaterThan(0);
  });

  test("Get all active spaces", async () => {
    const activeSpaces = await spacesSvc.getSpaces("active");
    expect(activeSpaces.length).toBeGreaterThan(0);
  });

  test("Disable an existing space", async () => {
    await spacesSvc.disableSpace(spaceId);
    spaceDisabled = true;
    logs("info", "Space disabled");
  });

  test("Get all active spaces after disabling", async () => {
    const activeSpaces = await spacesSvc.getSpaces("active");
    if (activeSpaces === null || activeSpaces.error === true) {
      expect(activeSpaces.error).toBe(true);
    } else {
      const spaceIds = activeSpaces.map((space) => space.id);
      expect(spaceIds).not.toContain(spaceId);
    }
  });

  test("Get all disabled spaces", async () => {
    const disabledSpaces = await spacesSvc.getSpaces("inactive");
    expect(disabledSpaces.length).toBeGreaterThan(0);
  });
});
