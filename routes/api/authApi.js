import { Router } from "express";
import * as users from "../../db/userService.js";
import { validatePass } from "../../utils/dataSecurity.js";
import ErrorManager from "../../errors/errorManager.js";
import { logger } from "../../utils/logger.js";

/**
 * Express router for authentication related endpoints.
 * @type {import('express').Router}
 */
const api = Router();
export default api;

/**
 * Builds a simple in-memory fixed-window rate limiter, keyed per client IP, to mitigate
 * brute-force/enumeration/abuse attacks.
 * @param {number} windowMs - Length of the rate-limiting window, in milliseconds.
 * @param {number} maxAttempts - Maximum attempts allowed per IP within the window.
 * @returns {import('express').RequestHandler}
 */
function createRateLimiter(windowMs, maxAttempts) {
  const attempts = new Map();

  const limiter = (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const entry = attempts.get(ip);

    if (!entry || now - entry.start > windowMs) {
      attempts.set(ip, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > maxAttempts) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return res.status(429).json(ErrorManager.returnError("tooManyRequests"));
    }
    next();
  };

  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of attempts) {
      if (now - entry.start > windowMs) attempts.delete(ip);
    }
  }, windowMs).unref();

  return limiter;
}

const loginRateLimiter = createRateLimiter(15 * 60 * 1000, 10);
const forgotPasswordRateLimiter = createRateLimiter(15 * 60 * 1000, 5);
const resetPasswordRateLimiter = createRateLimiter(15 * 60 * 1000, 10);

/**
 * @name POST /api/auth/login
 * @description Logs in an existing user.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.email - User's email.
 * @param {string} req.body.password - User's password.
 * @param {object} res - Express response object.
 */
api.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const userResult = await users.getUserByEmail(email);
    if (!userResult.success) {
      return res.status(userResult.code).json(userResult);
    }

    const user = userResult.data;
    if (user.deleted) {
      return res.status(403).json(ErrorManager.returnError("userDisabled"));
    }
    const isPasswordValid = validatePass(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json(ErrorManager.returnError("invalidParameters"));
    }

    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.userId = user.id;
    req.session.sessionVersion = user.sessionVersion ?? 0;
    const loginUpdate = await users.updateUserLastLogin(user.id);
    if (!loginUpdate.success) {
      logger.warn(`Failed to update last login time: ${loginUpdate.message}`);
    }

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      lang: user.lang,
    };

    return res.status(200).json(ErrorManager.returnSuccess(200, "Login successful", { user: responseUser }));
  } catch (error) {
    logger.error(`Error in /api/auth/login: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name POST /api/auth/logout
 * @description Logs out the current user.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
api.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json(ErrorManager.returnSuccess(200, "No active session to logout"));
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error(`Error destroying session: ${err.message}`);
      return res.status(500).json(ErrorManager.returnError("unknownError"));
    }

    res.clearCookie("session_cookie");
    return res.status(200).json(ErrorManager.returnSuccess(200, "Logout successful"));
  });
});

/**
 * @name POST /api/auth/forgotPassword
 * @description Requests a password reset email for the given address. Always responds with a
 * generic success message, regardless of whether the address is registered, to avoid leaking
 * which emails have an account.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.email - The account's email.
 * @param {object} res - Express response object.
 */
api.post("/forgotPassword", forgotPasswordRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const result = await users.requestPasswordReset(email);
    if (!result.success) {
      logger.info(`Password reset request for ${email} did not succeed: ${result.message}`);
    }

    return res
      .status(200)
      .json(ErrorManager.returnSuccess(200, "If that email is registered, a reset link has been sent"));
  } catch (error) {
    logger.error(`Error in /api/auth/forgotPassword: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name GET /api/auth/resetPassword/:token
 * @description Validates a password reset token without consuming it.
 * @param {object} req - Express request object.
 * @param {object} req.params - The request params.
 * @param {string} req.params.token - The raw token from the reset link.
 * @param {object} res - Express response object.
 */
api.get("/resetPassword/:token", resetPasswordRateLimiter, async (req, res) => {
  try {
    const result = await users.validateResetToken(req.params.token);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in GET /api/auth/resetPassword: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * @name POST /api/auth/resetPassword
 * @description Resets a user's password using a valid reset token.
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.token - The raw token from the reset link.
 * @param {string} req.body.password - The new password.
 * @param {object} res - Express response object.
 */
api.post("/resetPassword", resetPasswordRateLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(ErrorManager.returnError("invalidParameters"));
    }

    const result = await users.resetPassword(token, password);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(`Error in POST /api/auth/resetPassword: ${error.message}`);
    const errorResponse = ErrorManager.handleError(error);
    return res.status(errorResponse.code).json(errorResponse);
  }
});
