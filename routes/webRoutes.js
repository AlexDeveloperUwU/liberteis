const express = require("express");
const router = express.Router();

router.get("/rpi", (req, res) => {
  res.render("rpi");
});

router.get("/event/:eventID", (req, res) => {
  res.render("event", { eventID: req.params.eventID });
});

module.exports = router;
