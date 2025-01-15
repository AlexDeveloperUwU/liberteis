/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as spaces from "../../db/spacesController.js";
import * as users from "../../db/usersController.js";

let userId = null;

beforeAll(async () => {
  await dbCreateTables();

  const user = { name: "Test user", email: "test@test.com", createdBy: "System", type: "normalUser" };
  await users.addUser(user);
  const result = await users.getUserByEmail("test@test.com");
  expect(result).toBeDefined();
  userId = result[0].id;

  const space = await spaces.getSpaceByName("testSpace");
  if (space !== undefined && space.length > 0) {
    await spaces.deleteSpace(space[0].id);
  }
});

describe("Spaces Controller Tests", () => {
  let spaceId = null;
  test("addSpace should insert a new space", async () => {
    const space = {
      name: "testSpace",
      location: "testLocation",
      info: "testInfo",
      createdBy: userId,
    };
    await spaces.addSpace(space);
    const result = await spaces.getSpaceByName("testSpace");
    expect(result).toBeDefined();
    spaceId = result[0].id;
  });

  test("getSpace should return a space", async () => {
    const result = await spaces.getSpace(spaceId);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("testSpace");
    expect(result[0].location).toBe("testLocation");
    expect(result[0].info).toBe("testInfo");
  });

  test("getSpaces should return a list of spaces", async () => {
    const result = await spaces.getSpaces();
    expect(result).toBeDefined();
  });

  test("getSpaceByName should return a space", async () => {
    const result = await spaces.getSpaceByName("testSpace");
    expect(result).toBeDefined();
    expect(result[0].name).toBe("testSpace");
    expect(result[0].location).toBe("testLocation");
    expect(result[0].info).toBe("testInfo");
    expect(result[0].id).toBe(spaceId);
  });

  test("updateSpace should update a space", async () => {
    const space = { name: "testSpace updated", location: "updatedLocation", info: "updatedInfo" };
    await spaces.updateSpace(spaceId, space);
    const result = await spaces.getSpace(spaceId);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("testSpace updated");
    expect(result[0].location).toBe("updatedLocation");
    expect(result[0].info).toBe("updatedInfo");
  });

  test("deleteSpace should remove a space", async () => {
    await spaces.deleteSpace(spaceId);
    const space = await spaces.getSpace(spaceId);
    expect(space).toEqual([]);
  });
});
