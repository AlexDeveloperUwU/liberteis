import nodemailer from "nodemailer";
import * as configService from "../db/configService.js";
import { decryptData } from "./dataSecurity.js";
import { logger } from "./logger.js";

/**
 * Reads the current mail configuration from the config table.
 * Called fresh on every send so an admin changing settings takes effect
 * immediately, with no restart.
 * @returns {Promise<{hostPort: string, secure: boolean, user: string, password: string, fromAddress: string, appName: string}>}
 */
async function getMailSettings() {
  const result = await configService.getConfigs();
  const rows = result.success ? result.data : [];
  const byId = Object.fromEntries(rows.map((row) => [row.id, row.value]));

  let password = byId.mailPassword || "";
  if (password) {
    try {
      password = decryptData(password);
    } catch (error) {
      logger.error(`Error decrypting mail password: ${error.message}`);
      password = "";
    }
  }

  return {
    hostPort: byId.mailHostPort || "",
    secure: byId.mailSecure === "true",
    user: byId.mailUser || "",
    password,
    fromAddress: byId.mailFromAddress || "",
    appName: byId.appName || "LiberTeis",
  };
}

/**
 * Sends an email through the configured SMTP transport. Never throws: any
 * misconfiguration or transport error is logged and swallowed so a mail
 * failure can never break the caller's flow.
 * @param {object} params
 * @param {string} params.to - Recipient email address.
 * @param {string} params.subject - Email subject.
 * @param {string} [params.text] - Plain-text body.
 * @param {string} [params.html] - HTML body.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendMail({ to, subject, text, html }) {
  try {
    const settings = await getMailSettings();

    if (!settings.hostPort || !settings.user || !settings.password) {
      logger.info(`Mailer not configured, skipping email to ${to}`);
      return false;
    }

    const [host, port] = settings.hostPort.split(":");
    const transport = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.password },
    });

    await transport.sendMail({
      from: `${settings.appName} <${settings.fromAddress || settings.user}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return false;
  }
}

/**
 * Replaces `{{token}}` placeholders in a string with values from `data`.
 * Unknown tokens are replaced with an empty string.
 * @param {string} str - The template string.
 * @param {object} data - The values to inject.
 * @returns {string} The rendered string.
 */
function render(str, data) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, token) => (data[token] !== undefined ? data[token] : ""));
}

/**
 * Email templates, keyed by template name then locale. Adding a new email is
 * a data change here, not a code change.
 */
const templates = {
  userCreated: {
    en: {
      subject: "Welcome to {{appName}}",
      body: "Hi {{name}},\n\nAn account was created for you on {{appName}}. Your temporary password is: {{tempPassword}}\n\nPlease log in and change it as soon as possible.",
    },
    es: {
      subject: "Bienvenido/a a {{appName}}",
      body: "Hola {{name}},\n\nSe ha creado una cuenta para ti en {{appName}}. Tu contraseña temporal es: {{tempPassword}}\n\nInicia sesión y cámbiala lo antes posible.",
    },
    gl: {
      subject: "Benvido/a a {{appName}}",
      body: "Ola {{name}},\n\nCreouse unha conta para ti en {{appName}}. O teu contrasinal temporal é: {{tempPassword}}\n\nInicia sesión e cámbiao canto antes.",
    },
  },
  passwordReset: {
    en: {
      subject: "Reset your {{appName}} password",
      body: "Hi {{name}},\n\nWe received a request to reset your password. Use the link below to choose a new one:\n{{resetLink}}\n\nIf you didn't request this, you can ignore this email.",
    },
    es: {
      subject: "Restablece tu contraseña de {{appName}}",
      body: "Hola {{name}},\n\nHemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente enlace para elegir una nueva:\n{{resetLink}}\n\nSi no solicitaste esto, puedes ignorar este correo.",
    },
    gl: {
      subject: "Restablece o teu contrasinal de {{appName}}",
      body: "Ola {{name}},\n\nRecibimos unha solicitude para restablecer o teu contrasinal. Usa a seguinte ligazón para escoller un novo:\n{{resetLink}}\n\nSe non solicitaches isto, podes ignorar este correo.",
    },
  },
  accountChanged: {
    en: {
      subject: "Your {{appName}} account was updated",
      body: "Hi {{name}},\n\nYour {{reason}} was just changed on {{appName}}. If this wasn't you, please contact an administrator.",
    },
    es: {
      subject: "Tu cuenta de {{appName}} ha sido actualizada",
      body: "Hola {{name}},\n\nTu {{reason}} se acaba de cambiar en {{appName}}. Si no fuiste tú, contacta con un administrador.",
    },
    gl: {
      subject: "A túa conta de {{appName}} foi actualizada",
      body: "Ola {{name}},\n\nO teu {{reason}} acaba de cambiar en {{appName}}. Se non fuches ti, contacta cun administrador.",
    },
  },
};

/**
 * Renders and sends one of the templates above to a user, in their stored
 * locale (falling back to "gl"). Never throws — see `sendMail`.
 * @param {string} templateKey - One of the keys in `templates`.
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {object} [data] - Extra values available to the template as `{{tokens}}`.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendTemplatedMail(templateKey, user, data = {}) {
  const localeTemplates = templates[templateKey];
  if (!localeTemplates) {
    logger.error(`Unknown mail template: ${templateKey}`);
    return false;
  }

  const settings = await getMailSettings();
  const tpl = localeTemplates[user.lang] || localeTemplates.gl;
  const mergedData = { name: user.name, appName: settings.appName, ...data };

  return sendMail({
    to: user.email,
    subject: render(tpl.subject, mergedData),
    text: render(tpl.body, mergedData),
  });
}

/**
 * Sends the "welcome, here's your temporary password" email for a newly
 * created user.
 *
 * Not called from anywhere yet — ready for a future task to wire into user
 * creation (`db/userService.js` / `routes/api/usersApi.js`).
 * @param {{email: string, name: string, lang?: string}} user - The new user.
 * @param {string} tempPassword - The generated temporary password.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendUserCreatedEmail(user, tempPassword) {
  return sendTemplatedMail("userCreated", user, { tempPassword });
}

/**
 * Sends a password-reset email with a reset link.
 *
 * Not called from anywhere yet — no forgot/reset-password flow exists in the
 * app yet to call it from. Ready for a future task to wire in once that flow
 * (token issuance, `/api/auth/forgot-password`, etc.) is built.
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {string} resetLink - The password-reset URL, including the token.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendPasswordResetEmail(user, resetLink) {
  return sendTemplatedMail("passwordReset", user, { resetLink });
}

/**
 * Sends a generic "your account changed" notification.
 *
 * Not called from anywhere yet — ready for a future task to wire into
 * `routes/api/usersApi.js` (email/password/status changes).
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {("email"|"password"|"status")} reason - What changed.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendAccountChangedEmail(user, reason) {
  return sendTemplatedMail("accountChanged", user, { reason });
}
