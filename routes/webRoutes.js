const express = require("express");
const router = express.Router();

router.get("/rpi", (req, res) => {
  //const userAgent = req.get("User-Agent");
  //if (!userAgent || !userAgent.includes("Linux aarch64")) {
  //  return res.render("403");
  //}
  res.render("rpi");
});

router.get("/event/:eventID", (req, res) => {
  const userAgent = req.get("User-Agent");
  console.log(userAgent);

  if (!userAgent || (!userAgent.includes("Android") && !userAgent.includes("iPhone"))) {
    return res.render("403");
  }

  res.render("event");
});

router.get("/500", (req, res) => {
  res.render("500");
});

router.get("/403", (req, res) => {
  res.render("403");
});

module.exports = router;
