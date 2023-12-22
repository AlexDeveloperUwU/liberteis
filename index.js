// Dependencias del server
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const enmap = require("enmap");
const database = require("./functions/database");

// Bases de Datos
const events_short = new enmap({ name: "events_short" });
const events_pdf = new enmap({ name: "events_pdf" });
const users = new enmap({ name: "users" });

// Config del webserver
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Ee/KSrxWuh[iJ2*CgDiU{[RkWFW2xAn48)6Kit!2fbo7&O",
    resave: true,
    saveUninitialized: true,
  })
);

// Rutas get del servidor web
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/eventlist", (req, res) => {
  res.render("eventslist");
});

app.post("/api/events/add", (req, res) => {
  const { title, desc, event_date } = req.body;
  try {
    database.saveEvent(events_short, title, desc, event_date);
    res.redirect("/eventlist");
  } catch (error) {
    console.error("Error al añadir el evento:", error);
    res.status(500).send("Error al añadir el evento. Por favor, inténtalo de nuevo.");
  }
});

app.post("/api/events/delete", (req, res) => {
  const { eventID } = req.body;
  try {
    database.deleteEvent(events_short, eventID);
    res.redirect("/eventlist");
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    res.status(500).send("Error al eliminar el evento. Por favor, inténtalo de nuevo.");
  }
});

app.post("/api/events/check", (req, res) => {
  const { eventID } = req.body;
  try {
    const event = database.checkEvent(events_short, eventID);
    res.send(event);
  } catch (error) {
    console.error("Error al buscar el evento:", error);
    res.status(500).send("Error al buscar el evento. Por favor, inténtalo de nuevo.");
  }
});

app.post("/api/events/list", (req, res) => {
  const eventsList = database.getEvents(events_short);
  res.status(200).json(eventsList);
});

// Iniciamos el servidor web express
app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
