import ErrorManager from "../../errors/errorManager.js";

/**
 * Middleware to restrict access to admin users only.
 * Relies on userMiddleware having attached req._reqUser from the session.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void}
 */
export const requireAdmin = (req, res, next) => {
  if (!req._reqUser) {
    return res.status(401).json(ErrorManager.returnError("unauthorized"));
  }
  if (req._reqUser.type !== "adminUser") {
    return res.status(403).json(ErrorManager.returnError("forbiddenAdminOnly"));
  }
  next();
};
