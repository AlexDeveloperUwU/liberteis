const express = require("express");
const enmap = require("enmap");
const bcrypt = require("bcrypt");
const router = express.Router();
const users = new enmap({ name: "users" });

const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/register", (req, res) => {
  res.render("auth/register");
});

router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;
  console.log(password)

  if (users.get(email)) {
    return res.status(400).json({ message: "Usuario ya existe" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { email, fullname, hashedPassword });

  res.status(201).json({ message: "Usuario registrado exitosamente" });
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.get(email);

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  req.session.userId = user.fullname;
  res.redirect("/dash");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.json({ message: "Sesión cerrada exitosamente" });
  });
});

const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = req.session.userId;
  }
  next();
};

module.exports = { router, requireAuth, checkAuth };
