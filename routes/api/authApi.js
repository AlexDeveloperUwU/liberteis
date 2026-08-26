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
 * Simple in-memory fixed-window rate limiter for the login endpoint.
 * Limits attempts per client IP to mitigate brute-force attacks.
 */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map();

const loginRateLimiter = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.start > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { start: now, count: 1 });
    return next();
  }

  entry.count += 1;
  if (entry.count > LOGIN_MAX_ATTEMPTS) {
    logger.warn(`Login rate limit exceeded for IP: ${ip}`);
    return res.status(429).json(ErrorManager.returnError("tooManyRequests"));
  }
  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (now - entry.start > LOGIN_WINDOW_MS) loginAttempts.delete(ip);
  }
}, LOGIN_WINDOW_MS).unref();

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
