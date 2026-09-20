import crypto from "crypto";
import { getKey, getEncryptionKey } from "./secretKey.js";

export function encryptPass(pass) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function validatePass(pass, storedHash) {
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, "sha512").toString("hex");

  const hashBuffer = Buffer.from(hash, "hex");
  const originalBuffer = Buffer.from(originalHash, "hex");
  if (hashBuffer.length !== originalBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function encryptData(data, keyHex = getEncryptionKey()) {
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encryptedData = cipher.update(data, "utf8", "base64");
  encryptedData += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encryptedData}`;
}

export function decryptData(encryptedData, keyHex = getEncryptionKey()) {
  const key = Buffer.from(keyHex, "hex");
  const [ivStr, authTagStr, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivStr, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(Buffer.from(authTagStr, "base64"));

  let decryptedData = decipher.update(encrypted, "base64", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}

/**
 * Decrypts data using the legacy (session-secret) key, used only for the
 * one-time migration in `db/dbController.js` that re-encrypts existing
 * config values under the new dedicated encryption key.
 * @param {string} encryptedData - Data encrypted under the old session key.
 * @returns {string} The decrypted plaintext.
 */
export function decryptDataWithLegacyKey(encryptedData) {
  return decryptData(encryptedData, getKey());
}
