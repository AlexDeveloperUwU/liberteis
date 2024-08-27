const express = require("express");
const router = express.Router();
const db = require("../functions/usersdb.js");
const mail = require("../functions/mail.js");
const passgen = require("generate-password");
const bcrypt = require("bcrypt");

async function generatePassword() {
  const password = passgen.generate({
    length: 24,
    numbers: true,
    symbols: false,
    lowercase: true,
    uppercase: true,
  });
  const hashedPassword = await bcrypt.hash(password, 10);
  return { password, hashedPassword };
}

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

router.get("/register", estadoAuth(false), (req, res) => {
  const usersNum = db.getUserCount();
  if (usersNum === 0) {
    res.render("auth/register", { page: "register", t: res.t, lang: req.getLocale() });
  } else {
    res.redirect("/auth/login");
  }
});

router.post("/register", async (req, res) => {
  const { fullname, email, password, type, createdBy } = req.body;

  let plainPassword = password;
  let hashedPassword;
  if (!plainPassword) {
    const generated = await generatePassword();
    plainPassword = generated.password;
    hashedPassword = generated.hashedPassword;
  } else {
    hashedPassword = await bcrypt.hash(plainPassword, 10);
  }

  if (db.userExists(email)) {
    return res.status(400).json({ message: "El usuario ya existe en la base de datos" });
  } else {
    const lang = req.getLocale();
    const result = await db.saveUser(fullname, email, hashedPassword, type, createdBy, lang);

    if (!result) {
      return res.status(500).json({ message: "Error al registrar el usuario" });
    } else {
      res.status(201).json({ message: "Usuario registrado exitosamente" });
      await mail(
        "Biblioteca IES de Teis <biblio@iesteis.gal>",
        email,
        "registration_success",
        "registeredUser.html",
        plainPassword,
        lang
      );
    }
  }
});

router.post("/unregister", estadoAuth(true), async (req, res) => {
  const { email } = req.body;
  if (db.userExists(email)) {
    const result = db.unregisterUser(email);
    if (result) {
      res.status(200).json({ message: "Usuario eliminado exitosamente" });
      const lang = req.cookies.lang || "gl";
      await mail(
        "Biblioteca IES de Teis <biblio@iesteis.gal>",
        email,
        "account_deleted",
        "unregisteredUser.html",
        null,
        lang
      );
    } else {
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  } else {
    res.status(400).json({ message: "El usuario no existe en la base de datos" });
  }
});

//* Rutas de inicio de sesión

router.get("/login", estadoAuth(false), (req, res) => {
  const usersNum = db.getUserCount();
  if (usersNum !== 0) {
    res.render("auth/login", { page: "login", t: res.t, lang: req.getLocale() });
  } else {
    res.redirect("/auth/register");
  }
});

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

router.get("/logout", estadoAuth(true), (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.redirect("/dash");
  });
});

router.post("/list", estadoAuth(true), (req, res) => {
  res.status(200).json(db.listUsers());
});

//* Rutas para cambiar la contraseña

router.get("/changepass", estadoAuth(true), (req, res) => {
  res.render("auth/change", { page: "changePass", t: res.t, lang: req.getLocale() });
});

router.post("/changepass", estadoAuth(true), async (req, res) => {
  const { email, password } = req.body;

  const result = await db.changePassword(email, password);
  if (result) {
    res.status(200).json({ message: "Contraseña modificada exitosamente" });
    const lang = req.cookies.lang || "gl";
    await mail(
      "Biblioteca IES de Teis <biblio@iesteis.gal>",
      email,
      "password_changed",
      "passwordChanged.html",
      null,
      lang
    );
  } else {
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

//* Rutas para restablecer la contraseña olvidada

router.get("/resetpass", estadoAuth(false), (req, res) => {
  res.render("auth/reset", { page: "resetPass", t: res.t, lang: req.getLocale() });
});

router.post("/resetpass", estadoAuth(false), async (req, res) => {
  const { email, password } = req.body;

  const result = await db.resetPassword(email, password);
  if (result !== false) {
    res.status(200).json({ message: "Contraseña restablecida exitosamente" });
    const lang = req.cookies.lang || "gl";
    await mail(
      "Biblioteca IES de Teis <biblio@iesteis.gal>",
      email,
      "forgotten_password",
      "forgottenPassword.html",
      result,
      lang
    );
  } else {
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

//* Rutas para obtener información del usuario

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
