const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../functions/usersdb");

const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/auth/login");
  }
};

// Rutas de registro de usuarios
router.get("/register", (req, res) => {
  const usersNum = db.getUserCount();

  // Como queremos limitar a que solo se pueda registrar un usuario por cuenta propia, hacemos comprobaciones para saber si ya hay usuarios en la db
  if (!req.session || usersNum === 0) {
    res.render("auth/register");
  } else {
    res.redirect("/auth/login");
  }
});

router.post("/register", async (req, res) => {
  const { fullname, email, password, type } = req.body;

  // Comprobamos si el usuario ya existe en la base de datos antes de registrarlo para evitar duplicados
  if (db.userExists(email)) {
    return res.status(400).json({ message: "El usuario ya existe en la base de datos" });
  } else {
    const result = await db.saveUser(fullname, email, password, type);

    if (!result) {
      return res.status(500).json({ message: "Error al registrar el usuario" });
    } else {
      res.status(201).json({ message: "Usuario registrado exitosamente" });
    }
  }
});

// Rutas de inicio de sesión
router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const response = await db.loginUser(email, password);
  if (response === false) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  } else {
    req.session.userId = response;
    res.status(200).json({ message: "Inicio de sesión exitoso" });
  }
});

// Ruta de cierre de sesión
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.json({ message: "Sesión cerrada exitosamente" });
  });
});

// Middleware para verificar la autenticación
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = req.session.userId;
  }
  next();
};

module.exports = { router, requireAuth, checkAuth };
