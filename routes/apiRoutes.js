const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const enmap = require("enmap");
const database = require("../functions/eventsDb"); 
const events = new enmap({ name: "events" });

//* Almacenamiento de imágenes de los eventos, usamos Multer para poder gestionar las imágenes
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

//* Ruta para subir la imagen del evento
router.post("/upload", upload.single("thumbnailfile"), (req, res) => {
  const fileName = req.file.filename;
  const fileURL = `${process.env.APP_URL}/thumbs/${fileName}`;

  res.status(200).send({ url: fileURL });
});

//* Rutas para gestionar los eventos
router.post("/add", (req, res) => {
  const { title, desc, event_date, type, thumb_url, published_by } = req.body;
  try {
    database.saveEvent(events, title, desc, event_date, type, thumb_url, published_by);
    res.status(200).send("Evento editado correctamente.");
  } catch (error) {
    console.error("Error al añadir el evento:", error);
    res.status(500).send("Error al añadir el evento. Por favor, inténtalo de nuevo.");
  }
});

router.post("/edit", (req, res) => {
  const { id, title, desc, event_date, type, thumb_url, qr_url, published_by } = req.body;
  try {
    const event = database.checkEvent(events, id);
    if (event) {
      database.editEvent(events,id,title,desc,event_date,type,thumb_url,qr_url,published_by);
      res.status(200).send("Evento editado correctamente.");
    } else {
      res.status(404).send("El evento no existe.");
    }
  } catch (error) {
    console.error("Error al editar el evento:", error);
    res.status(500).send("Error al editar el evento. Por favor, inténtalo de nuevo.");
  }
});

router.post("/delete", (req, res) => {
  const { eventID } = req.body;
  try {
    const event = database.checkEvent(events, eventID);

    if (event) {
      function extractFileNameFromURL(url) {
        const matches = url.match(/\/([^\/?#]+)[^\/]*$/);
        return matches && matches[1];
      }

      const eventinfo = events.get(eventID, "thumb_url");
      const thumbnailURL = eventinfo;
      const thumbnailFileName = extractFileNameFromURL(thumbnailURL);
      const thumbnailPath = path.join(__dirname, "..", "uploads", thumbnailFileName);

      const eventsList = [];
      events.forEach((data, id) => {
        if (id !== "savedid") {
          eventsList.push({
            id: id,
            thumb_url: data.thumb_url
          });
        }
      });

      const entriesWithSameThumbnail = eventsList.filter(
        (entry) => entry.thumb_url === thumbnailURL
      );

      if (entriesWithSameThumbnail.length === 1) {
        fs.unlinkSync(thumbnailPath);
      }

      database.deleteEvent(events, eventID);
      res.status(200).send("Evento eliminado correctamente.");
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

router.post("/eventdata", (req, res) => {
  const { id } = req.body;
  try {
    const event = events.get(id);
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
