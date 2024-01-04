const express = require("express");
const router = express.Router();
const database = require("../functions/database"); // Importamos las funciones de la base de datos
const { events, users } = require("../index"); // Importamos las bases de datos

router.post("/add", (req, res) => {
  const { title, desc, full_desc, event_date, thumb_url, qr_url, published_by } = req.body;
  try {
    database.saveEvent(events, title, desc, full_desc, event_date, thumb_url, qr_url, published_by);
    res.redirect("/eventlist");
  } catch (error) {
    console.error("Error al añadir el evento:", error);
    res.status(500).send("Error al añadir el evento. Por favor, inténtalo de nuevo.");
  }
});

router.post("/delete", (req, res) => {
  const { eventID } = req.body;
  try {
    const event = database.checkEvent(events, eventID);
    if (event) {
      database.deleteEvent(events, eventID);
      res.redirect("/eventlist");
    } else {
      res.status(404).send("El evento no existe.");
    }
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    res.status(500).send("Error al eliminar el evento. Por favor, inténtalo de nuevo.");
  }
});

router.post("/check", (req, res) => {
  const { eventID } = req.body;
  try {
    const event = database.checkEvent(events, eventID);
    res.send(event);
  } catch (error) {
    console.error("Error al buscar el evento:", error);
    res.status(500).send("Error al buscar el evento. Por favor, inténtalo de nuevo.");
  }
});

router.post("/list", (req, res) => {
  const eventsList = database.getEvents(events);
  res.status(200).json(eventsList);
});

module.exports = router;
