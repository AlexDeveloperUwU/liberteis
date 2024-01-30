const nodemailer = require("nodemailer");
const fs = require("fs");
const envFilePath = path.join(__dirname, "../env", ".env");
require("dotenv").config({ path: envFilePath });

const transporter = nodemailer.createTransport({
  host: proccess.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const enviarCorreoHTML = async (destinatario, asunto, rutaHTML) => {
  try {
    const cuerpoHTML = fs.readFileSync(rutaHTML, "utf-8");

    const mensaje = {
      from: process.env.MAIL_USER,
      to: destinatario,
      subject: asunto,
      html: cuerpoHTML,
    };

    const info = await transporter.sendMail(mensaje);
    console.log("Correo enviado:", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};

module.exports = enviarCorreoHTML;
