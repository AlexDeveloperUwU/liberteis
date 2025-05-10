import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "../data/secrets/secret.key");

function setKey() {
  const dir = path.dirname(keyPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(keyPath, crypto.randomBytes(32).toString("hex"));
}

export function getKey() {
  if (!fs.existsSync(keyPath)) {
    setKey();
  }
  return fs.readFileSync(keyPath, "utf8");
}
