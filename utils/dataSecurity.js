import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

//! Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "../db/secret.key");

//! Functions to handle the key file
function getKey() {
  try {
    return fs.readFileSync(keyPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      setKey();
      return fs.readFileSync(keyPath, "utf8");
    } else {
      console.error(error);
    }
  }
}

function setKey() {
  try {
    const newKey = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(keyPath, newKey);
  } catch (error) {
    console.error(error);
  }
}

//! Functions for encrypting passwords (it doesn't decrypt)
export function encryptPass(pass) {
  const key = getKey();
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(pass);
  const hashedPassword = hmac.digest("hex");
  return hashedPassword;
}

// Pass is the plain password and hash is the hashed password from the database
export function validatePass(pass, hash) {
  return encryptPass(pass) === hash;
}

//! Functions for encrypting and decrypting data
export function encryptData(data) {
  const key = Buffer.from(getKey(), "hex"); // Convertir la clave a Buffer usando 'hex'
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedData = cipher.update(data, "utf8", "base64");
  encryptedData += cipher.final("base64");

  return iv.toString("base64") + ":" + encryptedData;
}

export function decryptData(encryptedData) {
  const key = Buffer.from(getKey(), "hex"); // Convertir la clave a Buffer usando 'hex'

  const [ivStr, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivStr, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decryptedData = decipher.update(encrypted, "base64", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}
