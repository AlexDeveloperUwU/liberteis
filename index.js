import e from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";

//! Definition of the __dirname and __filename constants that are not available in ES6 modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = path.basename(fileURLToPath(import.meta.url));

//! Create the required directories
const directories = [
  path.join(__dirname, "data"),
  path.join(__dirname, "data", "keys"),
  path.join(__dirname, "data", "db"),
  path.join(__dirname, "data", "uploads"),
];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

//! Import all the routers and routes
import { dbCreateTables } from "./db/dbController.js";
import apiRouter from "./routes/api.js";

//! Create an Express application
const app = e();

//! Configure the Express application
const PORT = process.env.PORT || 3000;
app.set("views", path.join(__dirname, "views"));
app.set("/uploads", e.static(path.join(__dirname, "uploads")));
app.set("/public", e.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//! Create the database tables if they don't exist
dbCreateTables();

//! Define the routes
app.use("/api", apiRouter);

//! Launch the Express application
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
