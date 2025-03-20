import e from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import * as logs from "./utils/logger.js";

//! Init wrapper
async function main() {
  //! Define the __dirname and __filename variables
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const __filename = path.basename(fileURLToPath(import.meta.url));

  logs.logger.info(`Initializing the application`);

  //! Import all the routers and routes
  const { dbCreateTables } = await import("./db/dbController.js");
  const apiRouter = (await import("./routes/api.js")).default;

  //! Create an Express application
  const app = e();

  //! Configure the Express application
  const PORT = process.env.PORT || 3000;
  app.use(logs.httpLogger);
  app.use("/", e.static(path.join(__dirname, "views")));
  app.use("/uploads", e.static(path.join(__dirname, "uploads")));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  //! Create the database tables if they don't exist
  dbCreateTables();

  //! Define the routes
  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "views") + "/index.html");
  });
  app.use("/api", apiRouter);

  //! Launch the Express application
  app.listen(PORT, () => {
    logs.logger.info(`Server is running on port ${PORT}`);
  });
}

main().catch((err) => {
  logs.logger.error("Failed to start the application:", err);
});
