import crypto from "crypto";
import { getKey } from "./secretKey.js";

//! Contraseñas
export function encryptPass(pass) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function validatePass(pass, storedHash) {
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

//! Datos Cifrados
export function encryptData(data) {
  const key = Buffer.from(getKey(), "hex");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedData = cipher.update(data, "utf8", "base64");
  encryptedData += cipher.final("base64");

  return `${iv.toString("base64")}:${encryptedData}`;
}

export function decryptData(encryptedData) {
  const key = Buffer.from(getKey(), "hex");
  const [ivStr, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivStr, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decryptedData = decipher.update(encrypted, "base64", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}
