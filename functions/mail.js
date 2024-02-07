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

const enviarCorreo = async (destinatario, asunto, rutaHTML, params) => {
  try {
    const cuerpoHTML = fs.readFileSync(rutaHTML, "utf-8");
    if (rutaHTML === "mailTemplates/forgottenPassword.html") {
      const cuerpoHTMLModificado = cuerpoHTML
        .replace("{{email}}", destinatario)
        .replace("{{newPassword}}", params);

      const mensaje = {
        from: process.env.MAIL_USER,
        to: destinatario,
        subject: asunto,
        html: cuerpoHTMLModificado,
      };

      await transporter.sendMail(mensaje);
    } else {
      const cuerpoHTMLModificado = cuerpoHTML.replace("{{email}}", destinatario);

      const mensaje = {
        from: process.env.MAIL_USER,
        to: destinatario,
        subject: asunto,
        html: cuerpoHTMLModificado,
      };

      await transporter.sendMail(mensaje);
    }
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};

module.exports = enviarCorreo;
