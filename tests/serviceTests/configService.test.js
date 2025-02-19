/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as configSvc from "../../db/configService.js";

beforeAll(async () => {
  await dbCreateTables();
  const result = await configSvc.checkConfigExistence("testKey");
  if (result) {
    await configSvc.deleteConfig("testKey");
  }
});

describe("Config Service Tests", () => {
  test("Insert a new config", async () => {
    await configSvc.setConfig("testKey", "testValue");
    const exists = await configSvc.checkConfigExistence("testKey");
    expect(exists).toBe(true);
    const value = await configSvc.getConfig("testKey");
    expect(value.value).toBe("testValue");
  });

  test("Retrieve the correct config", async () => {
    const value = await configSvc.getConfig("testKey");
    expect(value.value).toBe("testValue");
  });

  test("Update an existing config", async () => {
    await configSvc.updateConfig("testKey", "updatedValue");
    const value = await configSvc.getConfig("testKey");
    expect(value.value).toBe("updatedValue");
  });

  test("Retrieve the updated config", async () => {
    const value = await configSvc.getConfig("testKey");
    expect(value.value).toBe("updatedValue");
  });

  test("Check if config exists", async () => {
    const exists = await configSvc.checkConfigExistence("testKey");
    expect(exists).toBe(true);
  });

  test("Retrieve all configs", async () => {
    const configs = await configSvc.getConfigs();
    expect(configs.length).toBe(1);
    expect(configs[0].id).toBe("testKey");
    expect(configs[0].value).toBe("updatedValue");
  });

  test("Delete the config", async () => {
    await configSvc.deleteConfig("testKey");
    const exists = await configSvc.checkConfigExistence("testKey");
    expect(exists).toBe(false);
  });

  test("Check if config does not exist", async () => {
    const exists = await configSvc.checkConfigExistence("testKey");
    expect(exists).toBe(false);
  });
});
