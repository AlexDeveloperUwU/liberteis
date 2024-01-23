const express = require("express");
const enmap = require("enmap");
const bcrypt = require("bcrypt");
const router = express.Router();
const users = new enmap({ name: "users" });

// Middleware para verificar si el usuario tiene una sesión iniciada
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/auth/login");
  }
};

// Ruta para el formulario de registro
router.get("/register", (req, res) => {
  res.render("auth/register");
});

// Ruta para manejar el registro
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (users.get(username)) {
    return res.status(400).json({ message: "Usuario ya existe" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, { username, hashedPassword });

  res.status(201).json({ message: "Usuario registrado exitosamente" });
});

// Ruta para el formulario de inicio de sesión
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// Ruta para manejar el inicio de sesión
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.get(username);

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  req.session.userId = user.username;
  res.redirect("/dash");
});

// Ruta para cerrar sesión
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.json({ message: "Sesión cerrada exitosamente" });
  });
});

// Función para verificar si el usuario tiene sesión iniciada
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = req.session.userId;
  }
  next();
};

module.exports = { router, requireAuth, checkAuth };
