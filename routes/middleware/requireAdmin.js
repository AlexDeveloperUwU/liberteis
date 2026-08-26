import ErrorManager from "../../errors/errorManager.js";

/**
 * Role hierarchy, mirroring client/src/utils/permissions.js.
 * A higher number outranks a lower one.
 */
const HIERARCHY = {
  normalUser: 1,
  managerUser: 2,
  adminUser: 3,
};

/**
 * Rejects the request if there is no authenticated, active user attached by userMiddleware.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {boolean} true if the request should be rejected (response already sent)
 */
function rejectUnauthenticated(req, res) {
  if (!req._reqUser || req._reqUser.deleted) {
    res.status(401).json(ErrorManager.returnError("unauthorized"));
    return true;
  }
  return false;
}

/**
 * Middleware requiring any authenticated, active user.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void}
 */
export const requireAuth = (req, res, next) => {
  if (rejectUnauthenticated(req, res)) return;
  next();
};

/**
 * Builds a middleware requiring at least the given role in the hierarchy.
 * @param {("normalUser"|"managerUser"|"adminUser")} minType - Minimum required role.
 * @returns {import('express').RequestHandler}
 */
export const requireRole = (minType) => (req, res, next) => {
  if (rejectUnauthenticated(req, res)) return;
  if ((HIERARCHY[req._reqUser.type] || 0) < (HIERARCHY[minType] || 0)) {
    return res.status(403).json(ErrorManager.returnError("forbidden"));
  }
  next();
};

/**
 * Middleware to restrict access to admin users only.
 * Relies on userMiddleware having attached req._reqUser from the session.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void}
 */
export const requireAdmin = (req, res, next) => {
  if (rejectUnauthenticated(req, res)) return;
  if (req._reqUser.type !== "adminUser") {
    return res.status(403).json(ErrorManager.returnError("forbiddenAdminOnly"));
  }
  next();
};

export { HIERARCHY };
