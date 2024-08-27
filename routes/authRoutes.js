const express = require("express");
const router = express.Router();
const db = require("../functions/usersdb.js");
const mail = require("../functions/mail.js");

// Middleware para requerir autenticación
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/auth/login");
  }
};

const estadoAuth = (autenticado) => {
  return (req, res, next) => {
    if (autenticado) {
      if (req.session && req.session.userId) {
        return next();
      } else {
        return res.redirect("/auth/login");
      }
    } else {
      if (!req.session || !req.session.userId) {
        return next();
      } else {
        return res.redirect("/dash");
      }
    }
  };
};

//* Rutas de registro

// Solo debe ser accesible si no está autenticado
router.get("/register", estadoAuth(false), (req, res) => {
  const usersNum = db.getUserCount();
  if (usersNum === 0) {
    res.render("auth/register", { page: "register", t: res.t, lang: req.getLocale() });
  } else {
    res.redirect("/auth/login");
  }
});

// Esta debe ser accesible en ambos casos => No middleware
router.post("/register", async (req, res) => {
  const { fullname, email, password, type, createdBy } = req.body;

  // Comprobamos si el usuario ya existe en la base de datos antes de registrarlo para evitar duplicados
  if (db.userExists(email)) {
    return res.status(400).json({ message: "El usuario ya existe en la base de datos" });
  } else {
    const lang = req.getLocale();
    const result = await db.saveUser(fullname, email, password, type, createdBy, lang);

    if (!result) {
      return res.status(500).json({ message: "Error al registrar el usuario" });
    } else {
      res.status(201).json({ message: "Usuario registrado exitosamente" });
      await mail(email, "Rexistro exitoso", "mailTemplates/registeredUser.html");
    }
  }
});

// Esta solo debe ser accesible si está autenticado
router.post("/unregister", estadoAuth(true), async (req, res) => {
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
// Solo debe ser accesible si no está autenticado
router.get("/login", estadoAuth(false), (req, res) => {
  const usersNum = db.getUserCount();
  if (usersNum !== 0) {
    res.render("auth/login", { page: "login", t: res.t, lang: req.getLocale() });
  } else {
    res.redirect("/auth/register");
  }
});

// Solo debe ser accesible si no está autenticado
router.post("/login", estadoAuth(false), async (req, res) => {
  const { email, password } = req.body;
  const cookieLang = req.cookies.lang || "gl";

  const response = await db.loginUser(email, password);
  if (response === false) {
    return res.status(403).json({ message: "Credenciales incorrectas" });
  } else {
    req.session.userId = response[0];
    req.session.userEmail = response[1];
    req.session.userType = response[2];
    req.session.userLang = response[3];

    if (response[3] !== cookieLang) {
      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        lang: response[3],
      });
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      lang: cookieLang,
    });
  }
});

// Solo debe ser accesible si está autenticado
router.get("/logout", estadoAuth(true), (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.redirect("/dash");
  });
});

// Solo debe ser accesible si está autenticado
router.post("/list", estadoAuth(true), (req, res) => {
  res.status(200).json(db.listUsers());
});

//* Rutas para cambiar la contraseña
// Solo debe ser accesible si está autenticado
router.get("/changepass", estadoAuth(true), (req, res) => {
  res.render("auth/change", { page: "changePass", t: res.t, lang: req.getLocale() });
});

// Solo debe ser accesible si está autenticado
router.post("/changepass", estadoAuth(true), async (req, res) => {
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
// Solo debe ser accesible si no está autenticado
router.get("/resetpass", estadoAuth(false), (req, res) => {
  res.render("auth/reset", { page: "resetPass", t: res.t, lang: req.getLocale() });
});

// Solo debe ser accesible si no está autenticado
router.post("/resetpass", estadoAuth(false), async (req, res) => {
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

//* Rutas para obtener información del usuario
// Solo debe ser accesible si está autenticado
router.get("/userInfo", estadoAuth(true), async (req, res) => {
  if (req.session && req.session.userId) {
    const user = db.getUserInfo(req.session.userEmail);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(500).json({ message: "Error al obtener la información del usuario" });
    }
  } else {
    res.status(401).json({ message: "No hay sesión activa" });
  }
});

//* Rutas para actualizar la información del usuario
// Solo debe ser accesible si está autenticado
router.post("/updateLang", estadoAuth(true), async (req, res) => {
  const { lang } = req.body;
  if (req.session && req.session.userId) {
    try {
      const result = await db.changeUserLang(req.session.userEmail, lang);
      if (result) {
        req.session.lang = lang;
        res.cookie("lang", lang, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.status(200).json({ message: "Idioma actualizado exitosamente" });
      } else {
        res.status(500).json({ message: "Error al actualizar el idioma" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  } else {
    res.status(401).json({ message: "No hay sesión activa" });
  }
});

//* Middleware para verificar la autenticación
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = req.session.userId;
    res.locals.email = req.session.userEmail;
    res.locals.type = req.session.userType;
    res.locals.lang = req.getLocale();
  }
  next();
};

module.exports = { router, requireAuth, estadoAuth, checkAuth };
