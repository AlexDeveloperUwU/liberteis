import * as ds from "../../utils/dataSecurity.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//! Constants
const keyPath = path.join(__dirname, "../../db/secret.key");

describe("Data Security Tests - When secret.key does not exist", () => {
  let hashed = null;

  beforeAll(() => {
    if (fs.existsSync(keyPath)) {
      fs.unlinkSync(keyPath);
    }
  });

  test("Should encrypt a password", async () => {
    const pass = "testPass";
    const hashedPass = ds.encryptPass(pass);
    hashed = hashedPass;
    expect(hashedPass).toBeDefined();
  });

  test("Should validate a password", async () => {
    const pass = "testPass";
    const isValid = ds.validatePass(pass, hashed);
    expect(isValid).toBe(true);
  });

  test("Should encrypt data", async () => {
    const data = "testData";
    const encryptedData = ds.encryptData(data);
    expect(encryptedData).toBeDefined();
  });

  test("Should decrypt data", async () => {
    const data = "testData";
    const encryptedData = ds.encryptData(data);
    const decryptedData = ds.decryptData(encryptedData);
    expect(decryptedData).toBe(data);
  });

  test("Should create the secret.key file", () => {
    expect(fs.existsSync(keyPath)).toBe(true);
  });
});

describe("Data Security Tests - When secret.key exists", () => {
  let hashed = null;

  beforeAll(() => {
    if (!fs.existsSync(keyPath)) {
      fs.writeFileSync(keyPath, "dummyKeyForTest");
    }
  });

  test("Should encrypt a password", async () => {
    const pass = "testPass";
    const hashedPass = ds.encryptPass(pass);
    hashed = hashedPass;
    expect(hashedPass).toBeDefined();
  });

  test("Should validate a password", async () => {
    const pass = "testPass";
    const isValid = ds.validatePass(pass, hashed);
    expect(isValid).toBe(true);
  });

  test("Should encrypt data", async () => {
    const data = "testData";
    const encryptedData = ds.encryptData(data);
    expect(encryptedData).toBeDefined();
  });

  test("Should decrypt data", async () => {
    const data = "testData";
    const encryptedData = ds.encryptData(data);
    const decryptedData = ds.decryptData(encryptedData);
    expect(decryptedData).toBe(data);
  });

  test("Should validate the secret.key file exists", () => {
    expect(fs.existsSync(keyPath)).toBe(true);
  });
});
