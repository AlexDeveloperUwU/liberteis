import { dbCreateTables } from "../db/dbController.js";
import {
  setConfig,
  getConfig,
  getConfigs,
  updateConfig,
  deleteConfig,
  checkConfigExistence,
} from "../db/configController.js";

beforeAll(async () => {
  await dbCreateTables();
  const result = await checkConfigExistence("testKey");
  if (result) {
    await deleteConfig("testKey");
  }
});

describe("Config Controller Tests", () => {
  test("setConfig should insert a new config", async () => {
    const key = "testKey";
    const value = "testValue";
    await setConfig(key, value);
    const result = await getConfig(key);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe(key);
    expect(result[0].value).toBe(value);
  });

  test("getConfig should retrieve the correct config", async () => {
    const key = "testKey";
    const result = await getConfig(key);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe(key);
    expect(result[0].value).toBeDefined();
  });

  test("getConfigs should retrieve all configs", async () => {
    const result = await getConfigs();
    expect(result.length).toBeGreaterThan(0);
  });

  test("updateConfig should update an existing config", async () => {
    const key = "testKey";
    const newValue = "newValue";
    await updateConfig(key, newValue);
    const result = await getConfig(key);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].value).toBe(newValue);
  });

  test("deleteConfig should delete the config", async () => {
    const key = "testKey";
    await deleteConfig(key);
    const result = await getConfig(key);
    expect(result.length).toBe(0);
  });

  test("checkConfigExistence should return true if config exists", async () => {
    const key = "testKey";
    const value = "testValue";
    await setConfig(key, value);
    const exists = await checkConfigExistence(key);
    expect(exists).toBe(true);
  });

  test("checkConfigExistence should return false if config does not exist", async () => {
    const key = "nonExistentKey";
    const exists = await checkConfigExistence(key);
    expect(exists).toBe(false);
  });
});
