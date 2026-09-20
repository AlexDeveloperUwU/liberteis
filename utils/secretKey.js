import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "../data/secrets/secret.key");
const encryptionKeyPath = path.join(__dirname, "../data/secrets/encryption.key");

function generateKeyFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, crypto.randomBytes(32).toString("hex"), { mode: 0o600 });
}

/**
 * Session-signing secret for `express-session`.
 * @returns {string} Hex-encoded key.
 */
export function getKey() {
  if (!fs.existsSync(keyPath)) {
    generateKeyFile(keyPath);
  }
  return fs.readFileSync(keyPath, "utf8");
}

/**
 * AES-256-GCM key for `encryptData`/`decryptData`, kept separate from the
 * session secret so compromising one doesn't compromise the other.
 * @returns {string} Hex-encoded key.
 */
export function getEncryptionKey() {
  if (!fs.existsSync(encryptionKeyPath)) {
    generateKeyFile(encryptionKeyPath);
  }
  return fs.readFileSync(encryptionKeyPath, "utf8");
}
