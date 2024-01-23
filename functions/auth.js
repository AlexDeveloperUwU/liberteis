// auth.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { users } = require("../index");

// Configuración de Passport
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = users.get(username);
      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      const match = await bcrypt.compare(password, user);
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Contraseña incorrecta" });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
