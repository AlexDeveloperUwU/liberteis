const express = require("express");
const router = express.Router();

//* Rutas de la web
router.get("/rpi", (req, res) => {
  res.render("others/rpi", { t: res.t, lang: req.getLocale() });
});

router.get("/event/:eventID", (req, res) => {
  const userAgent = req.get("User-Agent");

  if (/Mobi|Android|iPad|iPhone|Windows Phone/.test(userAgent)) {
    return res.render("others/event", { t: res.t, lang: req.getLocale() });
  }

  res.render("errors/noDevice", {
    device: res.t("errors.mobile"),
    t: res.t,
    lang: req.getLocale(),
  });
});

router.get("/500", (req, res) => {
  res.render("errors/500", { t: res.t, lang: req.getLocale() });
});

router.get("/403", (req, res) => {
  res.render("errors/403", { t: res.t, lang: req.getLocale() });
});

module.exports = router;
