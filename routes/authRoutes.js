const express = require("express");
const router = express.Router();
const db = require("../functions/usersDb");
const mail = require("../functions/mail");

const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/auth/login");
  }
};

//* Rutas de registro
router.get("/register", (req, res) => {
  const usersNum = db.getUserCount();

  // Si no hay usuarios registrados, mostramos el formulario de registro
  // Si ya hay usuarios registrados, redirigimos al formulario de inicio de sesión
  if (usersNum === 0) {
    res.render("auth/register");
  } else {
    res.redirect("/auth/login");
  }
});

router.post("/register", async (req, res) => {
  const { fullname, email, password, type, createdBy } = req.body;

  // Comprobamos si el usuario ya existe en la base de datos antes de registrarlo para evitar duplicados
  if (db.userExists(email)) {
    return res.status(400).json({ message: "El usuario ya existe en la base de datos" });
  } else {
    const result = await db.saveUser(fullname, email, password, type, createdBy);

    if (!result) {
      return res.status(500).json({ message: "Error al registrar el usuario" });
    } else {
      res.status(201).json({ message: "Usuario registrado exitosamente" });
      await mail(email, "Rexistro exitoso", "mailTemplates/registeredUser.html");
    }
  }
});

router.post("/unregister", async (req, res) => {
  const { email } = req.body;
  if (db.userExists(email)) {
    const result = db.unregisterUser(email);
    if (result) {
      res.status(200).json({ message: "Usuario eliminado exitosamente" });
      await mail(email, "Conta eliminada", "mailTemplates/unregisteredUser.html");
    } else {
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  } else {
    res.status(400).json({ message: "El usuario no existe en la base de datos" });
  }
});

//* Rutas de inicio de sesión
router.get("/login", (req, res) => {
  const usersNum = db.getUserCount();
  if (usersNum !== 0) {
    res.render("auth/login");
  } else {
    res.redirect("/auth/register");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const needsReset = db.forcePasswordReset(email);

  if (needsReset) {
    return res.status(400).json({ message: "Se requiere restablecer la contraseña" });
  } else {
    const response = await db.loginUser(email, password);
    if (response === false) {
      return res.status(403).json({ message: "Credenciales incorrectas" });
    } else {
      req.session.userId = response[0];
      req.session.userEmail = response[1];
      req.session.userType = response[2];
      res.status(200).json({ message: "Inicio de sesión exitoso" });
    }
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.redirect("/dash");
  });
});

router.post("/list", (req, res) => {
  res.status(200).json(db.listUsers());
});

//* Rutas para cambiar la contraseña
router.get("/changepass", (req, res) => {
  res.render("auth/change");
});

router.post("/changepass", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.changePassword(email, password);
  if (result) {
    res.status(200).json({ message: "Contraseña modificada exitosamente" });
    await mail(email, "Contrasinal da conta modificada", "mailTemplates/passwordChanged.html");
  } else {
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

//* Rutas para restablecer la contraseña olvidada
router.get("/resetpass", (req, res) => {
  res.render("auth/reset");
});

router.post("/resetpass", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.resetPassword(email, password);
  if (result !== false) {
    res.status(200).json({ message: "Contraseña restablecida exitosamente" });
    await mail(
      email,
      "Tua nova contrasinal dun único uso",
      "mailTemplates/forgottenPassword.html",
      result
    );
  } else {
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

//* Middleware para verificar la autenticación
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = req.session.userId;
    res.locals.email = req.session.userEmail;
    res.locals.type = req.session.userType;
  }
  next();
};

module.exports = { router, requireAuth, checkAuth };
