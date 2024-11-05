const Router = require("express").Router;
const router = Router();
const controller = require("../../controllers/configController.js");

router.get("/", (req, res) => {
  res.status(404).send("API Endpoint not available.");
});

//! Rutas GET para obtener la configuración

router.get("/get", async (req, res) => {
  try {
    const config = await controller.getConfig(req.query);
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la configuración.", error: error.message });
  }
});

router.get("/getAll", async (req, res) => {
  try {
    const config = await controller.getAllConfigs();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la configuración.", error: error.message });
  }
});

//! Rutas POST para añadir y modificar la configuración

router.post("/add", async (req, res) => {
  try {
    await controller.addConfig(req.body);
    res.status(200).json({ message: "Configuración añadida correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al añadir la configuración.", error: error.message });
  }
});

router.patch("/update", async (req, res) => {
  try {
    await controller.updateConfig(req.body);
    res.status(200).json({ message: "Configuración actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la configuración.", error: error.message });
  }
});

//! Rutas DELETE para eliminar la configuración

router.delete("/delete", async (req, res) => {
  try {
    await controller.deleteConfig(req.body);
    res.status(200).json({ message: "Configuración eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la configuración.", error: error.message });
  }
});

module.exports = router;
