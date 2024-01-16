const express = require("express");
const router = express.Router();
const fs = require("fs");
const packageJsonContent = fs.readFileSync("package.json", "utf8");
const packageJson = JSON.parse(packageJsonContent);
const version = packageJson.version;

router.get("/", (req, res) => {
  res.render("dashevents", {
    version: version,
  });
});

module.exports = router;
