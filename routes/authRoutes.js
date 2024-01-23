const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("../functions/auth");
const router = express.Router();
const { users } = require("../index");

// Función para procesar las contraseñas
const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
};

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = users.get(username);
    if (user) {
      res.status(409).send("El usuario ya existe.");
    } else {
      const hashedPassword = await hashPassword(password);
      users.set(username, hashedPassword);
      res.status(200).send("Usuario añadido correctamente.");
    }
  } catch (error) {
    console.error("Error al añadir el usuario:", error);
    res.status(500).send("Error al añadir el usuario. Por favor, inténtalo de nuevo.");
  }
});

router.post("/delete", (req, res) => {
  const { username } = req.body;
  try {
    const user = users.get(username);
    if (user) {
      users.delete(username);
      res.status(200).send("Usuario eliminado correctamente.");
    } else {
      res.status(404).send("El usuario no existe.");
    }
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).send("Error al eliminar el usuario. Por favor, inténtalo de nuevo.");
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.get("/register", (req, res) => {
  res.render("auth/register");
});

module.exports = router;