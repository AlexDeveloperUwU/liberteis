const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");

//* Funciones relacionadas con las versiones del software y actualizaciones
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

// Función para obtener la última versión
function getLatestVersion() {
  return new Promise((resolve, reject) => {
    const url = "https://api.github.com/repos/AlexDeveloperUwU/liberteis/tags";

    axios
      .get(url)
      .then((response) => {
        if (response.status === 200) {
          const data = response.data;
          const versionesOrdenadas = data.sort((a, b) => {
            return semverCompare(b.name, a.name);
          });
          const nombreUltimaVersion = versionesOrdenadas[0].name;
          resolve(nombreUltimaVersion);
        } else {
          reject(new Error(`Error al realizar la solicitud: ${response.status}`));
        }
      })
      .catch((error) => {
        reject(new Error(`Error en la solicitud: ${error.message}`));
      });
  });
}

// Función para verificar si es la última versión
function isLatestVersion(version, latestVersion) {
  return new Promise((resolve, reject) => {
    if (semverCompare(version, latestVersion) >= 0) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

//* Rutas de la dashboard
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
