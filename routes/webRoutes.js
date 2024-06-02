const express = require("express");
const router = express.Router();

//* Rutas de la web
router.get("/rpi", (req, res) => {
  // Me falta testear esta parte, con lo que sigue quedando comentada
  //const userAgent = req.get("User-Agent");
  //if (!userAgent || !userAgent.includes("Linux aarch64")) {
  //  return res.render("403");
  //}
  res.render("others/rpi");
});

router.get("/event/:eventID", (req, res) => {
  const userAgent = req.get("User-Agent");

  if (!userAgent || !userAgent.includes("Android") || !userAgent.includes("iPhone")) {
    return res.render("errors/noDevice", {
      device: "dispositivo Android o iPhone",
    });
  }

  res.render("others/event");
});

router.get("/500", (req, res) => {
  res.render("errors/500");
});

router.get("/403", (req, res) => {
  res.render("errors/403");
});

module.exports = router;
