import e from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import * as logs from "./utils/logger.js";
import dotenv from "dotenv";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { getKey } from "./utils/secretKey.js";

//! Init wrapper
async function main() {
  //! Define the __dirname and __filename variables
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const __filename = path.basename(fileURLToPath(import.meta.url));

  logs.logger.info(`Initializing the application`);

  //! Import things for the cookie session
  const envConfig = dotenv.config({
    path: path.resolve(__dirname, "./data/secrets/dbcreds.env"),
  }).parsed;

  const MySQLStore = MySQLStoreFactory(session);

  //! Import all the routers and routes
  const { dbCreateTables } = await import("./db/dbController.js");
  const apiRouter = (await import("./routes/api.js")).default;

  //! Create an Express application
  const app = e();

  //! Configure the Express application
  const PORT = process.env.PORT || 3000;

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.frameguard({ action: "deny" }));
  app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    }),
  );

  const sessionOptions = {
    host: envConfig.MYSQL_HOST,
    port: "3306",
    user: envConfig.MYSQL_USER,
    password: envConfig.MYSQL_PASSWORD,
    database: envConfig.MYSQL_DATABASE,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 604800000,
    createDatabaseTable: true,
  };

  const sessionStore = new MySQLStore(sessionOptions);

  app.use(
    session({
      key: "session_cookie",
      secret: getKey(),
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 604800000,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
      },
      proxy: false,
    }),
  );

  app.use(helmet.originAgentCluster());
  app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
  app.use(logs.httpLogger);
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: "15mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "15mb" }));

  app.use("/", e.static(path.join(__dirname, "views")));
  app.use("/uploads", e.static(path.join(__dirname, "data", "uploads")));

  //! Create the database tables if they don't exist
  dbCreateTables();

  //! Define the routes
  app.use("/api", apiRouter);

  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  });

  //! Launch the Express application
  app.listen(PORT, () => {
    logs.logger.info(`Server is running on port ${PORT}`);
  });
}

main().catch((err) => {
  logs.logger.error(`Failed to start the application: ${err.message}`);
});
