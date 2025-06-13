import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errors = JSON.parse(fs.readFileSync(path.join(__dirname, "errors.json"), "utf8"));

class ErrorManager {
  /**
   * Returns a standard response for errors.
   * @param {string} errorKey - The error key defined in errors.json.
   * @param {object} data - (Optional) Additional data related to the error (will be ignored).
   * @returns {object} Standard response with success set to false.
   */
  static returnError(errorKey, data = null) {
    const error = errors[errorKey];
    if (!error) {
      return {
        success: false,
        code: 500,
        message: "Undefined error.",
        data: null,
      };
    }
    return {
      success: false,
      code: error.code,
      message: error.message,
      data: null,
    };
  }

  /**
   * Returns a standard response for successes.
   * @param {number} code - HTTP status code.
   * @param {string} message - Descriptive message.
   * @param {object} data - (Optional) Additional data related to the operation.
   * @returns {object} Standard response with success set to true.
   */
  static returnSuccess(code = 200, message = "Operation successful", data = null) {
    return {
      success: true,
      code,
      message,
      data,
    };
  }

  /**
   * Interprets generic or DB errors and returns the standard response.
   * @param {Error} error - Captured error.
   * @returns {object} Standard response with success = false.
   */
  static handleError(error) {
    if (!error || !error.message) {
      return this.returnError("unknownError");
    }

    if (error.message.includes("Duplicate entry")) {
      return this.returnError("dbDuplicateEntry");
    }

    return this.returnError("unknownError");
  }
}

export default ErrorManager;
