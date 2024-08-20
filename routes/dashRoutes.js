const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");

// Cargar información del archivo package.json
const packageJsonContent = fs.readFileSync("package.json", "utf8");
const packageJson = JSON.parse(packageJsonContent);
const version = `v${packageJson.version}`;

// Función para comparar versiones semánticas
function semverCompare(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pa[i] - pb[i];
    }
  }
  return 0;
}

// Variable para almacenar la última versión y su timestamp
let latestVersionCache = null;
let cacheTimestamp = null;
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

// Función para obtener la última versión
async function getLatestVersion() {
  // Verificar si el caché está expirado
  const now = Date.now();
  if (latestVersionCache && cacheTimestamp && now - cacheTimestamp < CACHE_EXPIRY_MS) {
    return latestVersionCache;
  }

  const url = "https://api.github.com/repos/AlexDeveloperUwU/liberteis/tags";

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
      const versionesOrdenadas = data.sort((a, b) => {
        return semverCompare(b.name, a.name);
      });
      const nombreUltimaVersion = versionesOrdenadas[0].name;

      // Almacenar la versión más reciente en caché
      latestVersionCache = nombreUltimaVersion;
      cacheTimestamp = now;

      return nombreUltimaVersion;
    } else {
      throw new Error(`Error al realizar la solicitud: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Error en la solicitud: ${error.message}`);
  }
}

// Función para verificar si es la última versión
async function isLatestVersion(version, latestVersion) {
  return semverCompare(version, latestVersion) >= 0;
}

// Middleware para verificar dispositivo
function checkPCDevice(req, res, next) {
  const userAgent = req.get("User-Agent");
  if (/Mobi|Android|iPad|iPhone|Windows Phone/.test(userAgent)) {
    return res.render("errors/noDevice", {
      device: res.t("errors.pc"),
      t: res.t,
      lang: req.getLocale(),
    });
  }

  next();
}
router.use(checkPCDevice);

// Rutas de la dashboard
router.get("/", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/events", {
      version,
      latestVersion: latest,
      loggedInUsername: res.locals.user,
      loggedInType: res.locals.type,
      page: "dash",
      t: res.t,
      lang: req.getLocale(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/eventlist", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/eventsList", {
      version,
      latestVersion: latest,
      loggedInUsername: res.locals.user,
      loggedInType: res.locals.type,
      page: "eventList",
      t: res.t,
      lang: req.getLocale(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/userlist", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/usersList", {
      version,
      latestVersion: latest,
      loggedInUsername: res.locals.user,
      loggedInEmail: res.locals.email,
      loggedInType: res.locals.type,
      page: "userList",
      t: res.t,
      lang: req.getLocale(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/settings", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/usersettings", {
      version,
      latestVersion: latest,
      loggedInUsername: res.locals.user,
      loggedInEmail: res.locals.email,
      loggedInType: res.locals.type,
      page: "userSettings",
      t: res.t,
      lang: req.getLocale(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
