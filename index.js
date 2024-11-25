import e from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

//! Definition of the __dirname and __filename constants that are not available in ES6 modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = path.basename(fileURLToPath(import.meta.url));

//! Create an Express application
const app = e();

//! Configure the Express application
const PORT = process.env.PORT || 3000;
app.set("views", path.join(__dirname, "views"));
app.set("/uploads", e.static(path.join(__dirname, "uploads")));
app.set("/public", e.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//! Launch the Express application
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
