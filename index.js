// Dependencias del server
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const enmap = require("enmap");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Bases de Datos
const events = new enmap({ name: "events" });
const users = new enmap({ name: "users" });

module.exports = { events, users }; // Exportamos las bases de datos para usarlas en otros archivos

// Config del webserver
const app = express();
const port = process.env.APP_PORT || 3000;

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

app.use((req, res, next) => {
  const ip = req.ip.replace(/^::ffff:/, '');
  console.log(`Solicitud recibida de ${ip}: ${req.method} ${req.url}`);
  next();
});

// Rutas get del servidor web
files.forEach((file) => {
  if (path.extname(file) === ".ejs") {
    const name = path.basename(file, ".ejs");
    app.get(`/${name}`, (req, res) => {
      res.render(name);
    });
    console.log(`Ruta creada: /${name}`);
  }
});

// Rutas post del servidor web
const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

// Iniciamos el servidor web express
app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
