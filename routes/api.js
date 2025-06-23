import router from "express";
import bookingsApi from "./api/bookingsApi.js";
import categoriesApi from "./api/categoriesApi.js";
import configApi from "./api/configApi.js";
import eventsApi from "./api/eventsApi.js";
import spacesApi from "./api/spacesApi.js";
import usersApi from "./api/usersApi.js";
import authApi from "./api/authApi.js";
import utilsApi from "./api/utilsApi.js";
import * as dbc from "../db/dbController.js";
import { logger } from "../utils/logger.js";

/**
 * Main router for all API routes.
 * @type {import('express').Router}
 */
const apiRouter = router();
export default apiRouter;

/**
 * Middleware to extract user information from session
 */
const userMiddleware = async (req, next) => {
  try {
    if (req.session && req.session.userId) {
      const userResult = await dbc.dbGetOne("users", req.session.userId);
      if (userResult.length > 0) {
        req._reqUser = userResult[0];
      }
    }
  } catch (error) {
    logger.error("Error in user middleware:", error);
  }
  next();
};

apiRouter.use(userMiddleware);

/**
 * @name /api/bookings
 * @description Routes for managing bookings.
 * @see {@link bookingsApi}
 */
apiRouter.use("/bookings", bookingsApi);

/**
 * @name /api/categories
 * @description Routes for managing categories.
 * @see {@link categoriesApi}
 */
apiRouter.use("/categories", categoriesApi);

/**
 * @name /api/config
 * @description Routes for managing configuration.
 * @see {@link configApi}
 */
apiRouter.use("/config", configApi);

/**
 * @name /api/events
 * @description Routes for managing events.
 * @see {@link eventsApi}
 */
apiRouter.use("/events", eventsApi);

/**
 * @name /api/spaces
 * @description Routes for managing spaces.
 * @see {@link spacesApi}
 */
apiRouter.use("/spaces", spacesApi);

/**
 * @name /api/users
 * @description Routes for managing users.
 * @see {@link usersApi}
 */
apiRouter.use("/users", usersApi);

/**
 * @name /api/auth
 * @description Routes for managing authentication.
 * @see {@link authApi}
 */
apiRouter.use("/auth", authApi);

/**
 * @name /api/utils
 * @description Routes for utility functions.
 * @see {@link utilsApi}
 */
apiRouter.use("/utils", utilsApi);
