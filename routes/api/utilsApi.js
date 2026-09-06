import { Router } from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();

/**
 * GET /version
 * Gets the project version from package.json.
 */
api.get("/version", (req, res) => {
  try {
    const packagePath = join(__dirname, "../..", "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

    const result = ErrorManager.returnSuccess(200, "Version retrieved successfully", {
      version: packageJson.version,
      name: packageJson.name,
    });

    res.status(result.code).json(result);

    logger.info("Version requested successfully");
  } catch (error) {
    logger.error(`Error reading package.json: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

export default api;
