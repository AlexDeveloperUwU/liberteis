const express = require("express");
const router = express.Router();
const fs = require("fs");
const packageJsonContent = fs.readFileSync("package.json", "utf8");
const packageJson = JSON.parse(packageJsonContent);
const version = `v${packageJson.version}`;
const axios = require("axios");

// Función para comparar versiones semánticas
function semverCompare(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pa[i] - pb[i];
    }
  }
  return 0;
}

// Función que devuelve una Promesa para obtener la última versión
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

// Función que devuelve una Promesa para verificar si es la última versión
function isLatestVersion(version, latestVersion) {
  return new Promise((resolve, reject) => {
    resolve(version === latestVersion);
  });
}

router.get("/", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/events", { version, latestVersion: latest });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/eventlist", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/eventslist", { version, latestVersion: latest });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/userlist", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    const latest = await isLatestVersion(version, latestVersion);
    res.render("dash/userslist", {
      version,
      latestVersion: latest,
      loggedInUsername: res.locals.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
