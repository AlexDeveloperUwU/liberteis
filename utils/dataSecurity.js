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

  const hashBuffer = Buffer.from(hash, "hex");
  const originalBuffer = Buffer.from(originalHash, "hex");
  if (hashBuffer.length !== originalBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

//! Tokens de un solo uso (recuperación de contraseña)
export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

//! Datos Cifrados
export function encryptData(data) {
  const key = Buffer.from(getKey(), "hex");
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encryptedData = cipher.update(data, "utf8", "base64");
  encryptedData += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encryptedData}`;
}

export function decryptData(encryptedData) {
  const key = Buffer.from(getKey(), "hex");
  const [ivStr, authTagStr, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivStr, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(Buffer.from(authTagStr, "base64"));

  let decryptedData = decipher.update(encrypted, "base64", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}
