/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as categories from "../../db/categoriesController.js";
import * as users from "../../db/usersController.js";

let userId = null;

beforeAll(async () => {
  await dbCreateTables();

  const user = { name: "Test user", email: "test@test.com", createdBy: "System", type: "normalUser" };
  let result = await users.getUserByEmail("test@test.com");
  if (result.length === 0) {
    await users.addUser(user);
    result = await users.getUserByEmail("test@test.com");
  }
  expect(result).toBeDefined();
  userId = result[0].id;

  const category = await categories.getCategoryByName("testCategory");
  if (category !== undefined && category.length > 0) {
    await categories.deleteCategory(category[0].id);
  }
});

describe("Categories Controller Tests", () => {
  let categoryId = null;
  test("addCategory should insert a new category", async () => {
    const category = {
      name: "testCategory",
      spaces: JSON.stringify([]),
      createdBy: userId,
    };
    await categories.addCategory(category);
    const result = await categories.getCategoryByName("testCategory");
    expect(result).toBeDefined();
    categoryId = result[0].id;
  });

  test("getCategory should return a category", async () => {
    const result = await categories.getCategory(categoryId);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("testCategory");
    expect(JSON.parse(result[0].spaces)).toEqual([]);
  });

  test("getCategories should return a list of categories", async () => {
    const result = await categories.getCategories();
    expect(result).toBeDefined();
  });

  test("getCategoryByName should return a category", async () => {
    const result = await categories.getCategoryByName("testCategory");
    expect(result).toBeDefined();
    expect(result[0].name).toBe("testCategory");
    expect(result[0].id).toBe(categoryId);
    expect(JSON.parse(result[0].spaces)).toEqual([]);
  });

  test("updateCategory should update a category", async () => {
    const category = { name: "testCategory updated", spaces: JSON.stringify([]) };
    await categories.updateCategory(categoryId, category);
    const result = await categories.getCategory(categoryId);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("testCategory updated");
    expect(JSON.parse(result[0].spaces)).toEqual([]);
  });

  test("deleteCategory should remove a category", async () => {
    await categories.deleteCategory(categoryId);
    const category = await categories.getCategory(categoryId);
    expect(category).toEqual([]);
  });
});
