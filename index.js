// Dependencias del server
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

// Rutas del server
const { logRequests } = require("./functions/logRequests");
const envFilePath = path.join(__dirname, "env", ".env");
require("dotenv").config({ path: envFilePath });

// Config del webserver
const app = express();
const port = process.env.APP_PORT || 3000;
const { router: authRouter, requireAuth, checkAuth } = require("./routes/authRoutes");
app.use(logRequests);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/thumbs", express.static(__dirname + "/uploads"));
app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);
app.use(checkAuth); // Por algún motivo que desconozco esto debe estar aquí (?

// Mantener un registro de las solicitudes del servidor
app.get("/health", (req, res) => {
  res.sendStatus(200); // Healthcheck: OK
});

const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

const dashRoutes = require("./routes/dashRoutes");
app.use("/dash", requireAuth, dashRoutes);

const webRoutes = require("./routes/webRoutes");
app.use("/", webRoutes);

app.use("/auth", authRouter);

app.get("*", (req, res) => {
  res.render("errors/404");
});

// Iniciamos el servidor web express
app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
