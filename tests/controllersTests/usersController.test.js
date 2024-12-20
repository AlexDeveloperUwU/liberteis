import { dbCreateTables } from "../../db/dbController.js";
import * as users from "../../db/usersController.js";

beforeAll(async () => {
  await dbCreateTables();
  const user = await users.getUserByEmail("test@test.com");
  if (user !== undefined && user.length > 0) {
    await users.deleteUser(user[0].id);
  }
});

describe("Users Controller Tests", () => {
  let userId = null;
  test("addUser should insert a new user", async () => {
    const user = { name: "Test user", email: "test@test.com", createdBy: "System", type: "normalUser" };
    await users.addUser(user);
    const result = await users.getUserByEmail("test@test.com");
    expect(result).toBeDefined();
    userId = result[0].id;
  });

  test("getUser should return a user", async () => {
    const result = await users.getUser(userId);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("Test user");
  });

  test("getUsers should return a list of users", async () => {
    const result = await users.getUsers();
    expect(result).toBeDefined();
  });

  test("getUserByEmail should return a user", async () => {
    const result = await users.getUserByEmail("test@test.com");
    expect(result).toBeDefined();
    expect(result[0].name).toBe("Test user");
    expect(result[0].id).toBe(userId);
  });

  test("updateUser should update a user", async () => {
    const user = { name: "Test user updated" };
    await users.updateUser(userId, user);
    const result = await users.getUser(userId);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("Test user updated");
  });

  test("updateUserPassword should update the user password", async () => {
    const result = await users.updateUserPassword(userId, "newPassword");
    expect(result).toBeDefined();
  });

  test("deleteUser should remove a user", async () => {
    const result = await users.deleteUser(userId);
    const user = await users.getUser(userId);
    expect(user).toHaveLength(0);
  });
});
