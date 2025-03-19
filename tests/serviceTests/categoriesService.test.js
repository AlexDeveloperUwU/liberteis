/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as userSvc from "../../db/userService.js";
import * as spacesSvc from "../../db/spacesService.js";
import * as categoriesSvc from "../../db/categoriesService.js";
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
let categoryId;
let categoryDisabled;

beforeAll(async () => {
  await dbCreateTables();
  const checkUser = await userSvc.getUserByEmail("test@mail.com", true);
  if (checkUser && !checkUser.error) {
    userId = checkUser.id;
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

  const checkSpace = await spacesSvc.getSpaceByName("Test Space", true);
  if (checkSpace && !checkSpace.error) {
    spaceId = checkSpace.id;
    const spaceStatus = await spacesSvc.checkSpaceStatus(spaceId);
    if (!spaceStatus) {
      await spacesSvc.enableSpace(spaceId);
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
  }

  const checkCategory = await categoriesSvc.getCategoryByName("Test Category Updated", true);
  if (checkCategory && !checkCategory.error) {
    categoryId = checkCategory.id;
    categoryDisabled = await categoriesSvc.checkCategoryStatus(categoryId);
    if (categoryDisabled) {
      await categoriesSvc.enableCategory(categoryId);
      categoryDisabled = false;
    }
  } else {
    const category = {
      name: "Test Category",
      createdBy: userId,
      spaces: [spaceId],
    };
    await categoriesSvc.addCategory(category);
    const newCategory = await categoriesSvc.getCategoryByName("Test Category", true);
    categoryId = newCategory.id;
    categoryDisabled = false;
  }
});

describe("Categories Service Test", () => {
  test("Insert a new category if it does not exist", async () => {
    if (categoryDisabled) {
      const category = {
        name: "Test Category",
        createdBy: userId,
        spaces: [spaceId],
      };
      await categoriesSvc.addCategory(category);
      logs("info", "Category added");
    } else {
      logs("warn", "Category already exists");
    }
  });

  test("Enable an existing category if it is disabled", async () => {
    if (categoryDisabled) {
      await categoriesSvc.enableCategory(categoryId);
      logs("info", "Category enabled");
    } else {
      logs("warn", "Category is already enabled");
    }
  });

  test("Update an existing category", async () => {
    const category = {
      name: "Test Category Updated",
      spaces: [spaceId],
    };
    await categoriesSvc.updateCategory(categoryId, category);
    logs("info", "Category updated");

    const dbCategory = await categoriesSvc.getCategoryByName("Test Category Updated", true);
    expect(dbCategory.name).toBe("Test Category Updated");
  });

  test("Get a category by its name", async () => {
    const dbCategory = await categoriesSvc.getCategoryByName("Test Category Updated", true);
    expect(dbCategory.name).toBe("Test Category Updated");
  });

  test("Get all categories", async () => {
    const categories = await categoriesSvc.getCategories("all");
    expect(categories.length).toBeGreaterThan(0);
  });

  test("Get all active categories", async () => {
    const categories = await categoriesSvc.getCategories("active");
    expect(categories.length).toBeGreaterThan(0);
  });

  test("Disable an existing category", async () => {
    if (!categoryDisabled) {
      await categoriesSvc.disableCategory(categoryId);
      logs("info", "Category disabled");
    } else {
      logs("warn", "Category is already disabled");
    }
  });

  test("Get all active categories after disabling one", async () => {
    const categories = await categoriesSvc.getCategories("active");
    if (categories === null || categories.error === true) {
      expect(categories.error).toBe(true);
    } else {
      const categoryIds = categories.map((category) => category.id);
      expect(categoryIds).not.toContain(categoryId);
    }
  });

  test("Get all disabled categories", async () => {
    const categories = await categoriesSvc.getCategories("inactive");
    expect(categories.length).toBeGreaterThan(0);
  });
});
