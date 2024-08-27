const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const getTranslation = (lang, key) => {
  const translations = {
    gl: {
      registration_success: "Rexistro exitoso",
      account_deleted: "Conta eliminada",
      password_changed: "Contrasinal da conta modificada",
      forgotten_password: "O teu novo (restabelecido) contrasinal",
    },
    es: {
      registration_success: "Registro exitoso",
      account_deleted: "Cuenta eliminada",
      password_changed: "Contraseña de la cuenta modificada",
      forgotten_password: "Tu nueva (reseteada) contraseña",
    },
    en: {
      registration_success: "Registration successful",
      account_deleted: "Account deleted",
      password_changed: "Account password changed",
      forgotten_password: "Your new (resetted) password",
    }
  };
  return translations[lang][key] || key;
};

const enviarCorreo = async (sender, destinatario, asuntoKey, rutaHTML, params, lang) => {
  try {
    const asunto = getTranslation(lang, asuntoKey);
    const rutaHTMLCompleta = path.join(__dirname, `../mailTemplates/${lang}/${rutaHTML}`);
    const cuerpoHTML = fs.readFileSync(rutaHTMLCompleta, "utf-8");

    let cuerpoHTMLModificado = cuerpoHTML.replace("{{email}}", destinatario);

    if (rutaHTML === "forgottenPassword.html") {
      cuerpoHTMLModificado = cuerpoHTMLModificado.replace("{{newPassword}}", params);
    } else if (rutaHTML === "registeredUser.html") {
      cuerpoHTMLModificado = cuerpoHTMLModificado.replace("{{password}}", params);
    }

    const mensaje = {
      from: process.env.MAIL_USER,
      to: destinatario,
      subject: asunto,
      html: cuerpoHTMLModificado,
    };

    await transporter.sendMail(mensaje);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};

module.exports = enviarCorreo;
