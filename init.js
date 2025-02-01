import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

//! Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "data/secrets/secret.key");
const initIndicatorPath = path.join(__dirname, "data/init/initialized.txt");
const dbCredsPath = path.join(__dirname, "data/secrets/dbcreds.env");

//! Create the required directories
async function createDirectories() {
  const directories = [
    path.join(__dirname, "data"),
    path.join(__dirname, "data", "secrets"),
    path.join(__dirname, "data", "db"),
    path.join(__dirname, "data", "uploads"),
    path.join(__dirname, "data", "init"),
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory ${dir}:`, err);
    }
  }
}

//! Function to handle the key file
async function setKey() {
  try {
    const newKey = crypto.randomBytes(32).toString("hex");
    await fs.writeFile(keyPath, newKey);
  } catch (error) {
    console.error("Error creating the key file:", error);
  }
}

//! Function to generate random passwords
function generateRandomPassword() {
  return crypto.randomBytes(16).toString("hex");
}

//! Function to create dbcreds.env file
async function createDbCredsFile() {
  const rootPassword = generateRandomPassword();
  const userPassword = generateRandomPassword();
  const content = `MYSQL_ROOT_PASSWORD=${rootPassword}\nMYSQL_DATABASE=liberteis-db\nMYSQL_USER=liberteis-app\nMYSQL_PASSWORD=${userPassword}\n`;

  try {
    await fs.writeFile(dbCredsPath, content);
  } catch (error) {
    console.error("Error creating dbcreds.env file:", error);
  }
}

//! Function to create init indicator file
async function createInitIndicator() {
  try {
    await fs.writeFile(initIndicatorPath, "");
  } catch (error) {
    console.error("Error creating the initialization indicator file:", error);
  }
}

//! Initialize the application
export async function initialize() {
  try {
    const exists = await fs.stat(initIndicatorPath).catch(() => false);
    if (!exists) {
      console.log("Running initialization...");
      await createDirectories();
      await setKey();
      await createDbCredsFile();
      await createInitIndicator();
      console.log("Initialization complete.");
    } else {
      console.log("Initialization already complete. Skipping.");
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}
