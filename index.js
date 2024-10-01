const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const i18n = require("i18n");
const fs = require("fs");
const path = require("path");
const FileStore = require("session-file-store")(session);
const lusca = require("lusca");

// Rutas del server
const { logRequests } = require("./functions/logrequests.js");
const envFilePath = path.join(__dirname, "env", ".env");
require("dotenv").config({ path: envFilePath });

// Configuración de i18n
i18n.configure({
  locales: ["en", "es", "gl"],
  directory: __dirname + "/locales",
  defaultLocale: "gl",
  cookie: "lang",
  queryParameter: "lang",
  autoReload: true,
  updateFiles: false,
  objectNotation: true,
});

// Config del webserver
const app = express();
const port = process.env.APP_PORT || 3000;
const { router: authRouter, requireAuth, checkAuth } = require("./routes/authRoutes.js");

app.use(logRequests);

// Configuración de las vistas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/thumbs", express.static(__dirname + "/uploads"));
app.use("/assets", express.static(__dirname + "/public"));

// Middleware para manejar datos en el body de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de la sesión con FileStore
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "data", "sessions"),
      logFn: function () {},
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  })
);

// Inicialización de cookieParser e i18n
app.use(cookieParser());
app.use(i18n.init);
app.use(lusca.csrf());

// Middleware para establecer el idioma según la cookie o el parámetro de consulta
app.use((req, res, next) => {
  let selectedLanguage = req.query.lang || req.cookies.lang || "gl";
  const tenYearsInMilliseconds = 10 * 365 * 24 * 60 * 60 * 1000;
  res.cookie("lang", selectedLanguage, { maxAge: tenYearsInMilliseconds, httpOnly: true });
  req.setLocale(selectedLanguage);
  res.t = res.__;
  next();
});

// Middleware de autenticación
app.use(checkAuth);

// Mantener un registro de las solicitudes del servidor
app.get("/health", (req, res) => {
  res.sendStatus(200); // Healthcheck: OK
});

// Rutas
const apiRoutes = require("./routes/apiRoutes.js");
app.use("/api", apiRoutes);

const dashRoutes = require("./routes/dashRoutes.js");
app.use("/dash", requireAuth, dashRoutes);

const webRoutes = require("./routes/webRoutes.js");
app.use("/", webRoutes);

app.use("/auth", authRouter);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).render("errors/404", { t: res.t, lang: req.getLocale() });
});

// Middleware para manejar errores internos del servidor (500)
app.use((err, req, res, next) => {
  res.status(500).render("errors/500", { t: res.t, lang: req.getLocale() });
});

// Iniciamos el servidor web express
app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
