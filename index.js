// Dependencias del server
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const enmap = require("enmap");
const fs = require("fs");
const path = require("path");
const envFilePath = path.join(__dirname, "env", ".env");
require("dotenv").config({ path: envFilePath });

// Bases de Datos
const events = new enmap({ name: "events" });
module.exports = { events }; // Exportamos las bases de datos para usarlas en otros archivos

// Config del webserver
const app = express();
const port = process.env.APP_PORT || 3000;
const { router: authRouter, requireAuth, checkAuth } = require("./routes/authRoutes");

const viewsFolder = path.join(__dirname, "views");
const files = fs.readdirSync(viewsFolder);

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
  })
);
app.use(checkAuth);


// Mantener un registro de las solicitudes del servidor
const getTimeDate = () => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.toLocaleTimeString("en-US", { hour12: false }).replace(/:/g, ""); // Eliminar puntos (:) de la hora
  return `${fecha}-${hora}`;
};

const logsDirectorio = path.join(__dirname, "logs");
const nombreArchivo = `log-${getTimeDate()}.log`;
const rutaArchivo = path.join(logsDirectorio, nombreArchivo);

if (!fs.existsSync(logsDirectorio)) {
  fs.mkdirSync(logsDirectorio);
}

app.use((req, res, next) => {
  const ip = req.ip.replace(/^::ffff:/, "");
  const metodo = req.method;
  const url = req.url;

  const registro = `${ip} [${getTimeDate()}] ${metodo} ${url}\n`;
  fs.writeFileSync(rutaArchivo, registro, { flag: "a" });

  next();
});

// Rutas del servidor web
const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

const dashRoutes = require("./routes/dashRoutes");
app.use("/dash", requireAuth, dashRoutes);

const webRoutes = require("./routes/webRoutes");
app.use("/", webRoutes);

app.use('/auth', authRouter);

app.get("*", (req, res) => {
  res.render("errors/404");
});

// Iniciamos el servidor web express
app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
