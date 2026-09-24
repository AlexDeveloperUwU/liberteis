import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import * as configService from "../db/configService.js";
import { decryptData } from "./dataSecurity.js";
import { logger } from "./logger.js";
import { ensureIcon, ensureBrandIcon } from "../emails/generate-icons.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAILS_DIR = path.join(__dirname, "..", "emails");

/**
 * Reads the current mail configuration from the config table.
 * Called fresh on every send so an admin changing settings takes effect
 * immediately, with no restart.
 * @returns {Promise<{hostPort: string, secure: boolean, user: string, password: string, fromAddress: string, appName: string, domain: string}>}
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
    domain: byId.domain || "",
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
 * @param {object[]} [params.attachments] - Nodemailer attachments (e.g. `cid`-referenced inline images).
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendMail({ to, subject, text, html, attachments }) {
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
      attachments,
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
 * Escapes HTML-significant characters so an interpolated value can't break
 * out of its slot in a rendered email.
 * @param {*} value - The value to escape (stringified first).
 * @returns {string} The escaped string.
 */
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

/**
 * Non-translatable presentation metadata for templates that have been
 * migrated to the HTML `emails/` template system. A template key present
 * here uses `emails/base.html` + `emails/locales/<lang>/<key>.json`; a key
 * absent here falls back to the legacy plain-text `templates` object below.
 * `titleIcon`/`infoIcon` are Lucide icon names resolved via `ensureIcon()`
 * (see its own doc comment for why they're PNG attachments, not inline SVG).
 */
const TEMPLATE_META = {
  passwordReset: {
    accent: "#2159a3",
    badgeBg: "#d4e2f5",
    titleIcon: "key",
    infoIcon: "clock",
  },
};

/**
 * Reads a template's locale JSON file, falling back to "gl" if the
 * requested language is missing.
 * @param {string} templateKey - One of the keys in `TEMPLATE_META`.
 * @param {string} lang - The user's language.
 * @returns {{subject: string, title: string, body: string, infoLabel: string, buttonLabel: string}}
 */
function loadLocale(templateKey, lang) {
  const localePath = path.join(EMAILS_DIR, "locales", lang, `${templateKey}.json`);
  const fallbackPath = path.join(EMAILS_DIR, "locales", "gl", `${templateKey}.json`);
  const file = fs.existsSync(localePath) ? localePath : fallbackPath;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Reads the shared HTML email shell. Read fresh on every call so editing the
 * template takes effect without a server restart.
 * @returns {string} The base template's raw HTML.
 */
function loadBaseTemplate() {
  return fs.readFileSync(path.join(EMAILS_DIR, "base.html"), "utf8");
}

/**
 * Converts a plain-text body (paragraphs separated by blank lines) into
 * escaped HTML paragraphs.
 * @param {string} text - The plain-text body.
 * @returns {string} HTML `<p>` tags.
 */
function buildBodyHtml(text) {
  return text
    .split("\n\n")
    .map((paragraph) => `<p style="margin: 0 0 16px;">${escapeHtml(paragraph)}</p>`)
    .join("");
}

/**
 * Email templates, keyed by template name then locale. Adding a new email is
 * a data change here, not a code change. Templates listed in `TEMPLATE_META`
 * above have moved to the HTML `emails/` system and are removed from here.
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
  accountPasswordChanged: {
    en: {
      subject: "Your {{appName}} password was changed",
      body: "Hi {{name}},\n\nYour password was just changed on {{appName}}. If this wasn't you, please contact an administrator immediately.",
    },
    es: {
      subject: "Tu contraseña de {{appName}} ha sido cambiada",
      body: "Hola {{name}},\n\nTu contraseña se acaba de cambiar en {{appName}}. Si no fuiste tú, contacta con un administrador de inmediato.",
    },
    gl: {
      subject: "O teu contrasinal de {{appName}} foi cambiado",
      body: "Ola {{name}},\n\nO teu contrasinal acaba de cambiar en {{appName}}. Se non fuches ti, contacta cun administrador inmediatamente.",
    },
  },
  accountDeleted: {
    en: {
      subject: "Your {{appName}} account was deactivated",
      body: "Hi {{name}},\n\nYour account was deactivated on {{appName}}. If you believe this is a mistake, please contact an administrator.",
    },
    es: {
      subject: "Tu cuenta de {{appName}} ha sido desactivada",
      body: "Hola {{name}},\n\nTu cuenta ha sido desactivada en {{appName}}. Si crees que se trata de un error, contacta con un administrador.",
    },
    gl: {
      subject: "A túa conta de {{appName}} foi desactivada",
      body: "Ola {{name}},\n\nA túa conta foi desactivada en {{appName}}. Se cres que se trata dun erro, contacta cun administrador.",
    },
  },
  accountReactivated: {
    en: {
      subject: "Your {{appName}} account was reactivated",
      body: "Hi {{name}},\n\nYour account was reactivated on {{appName}} and you can log in again. If you believe this is a mistake, please contact an administrator.",
    },
    es: {
      subject: "Tu cuenta de {{appName}} ha sido reactivada",
      body: "Hola {{name}},\n\nTu cuenta ha sido reactivada en {{appName}} y ya puedes iniciar sesión de nuevo. Si crees que se trata de un error, contacta con un administrador.",
    },
    gl: {
      subject: "A túa conta de {{appName}} foi reactivada",
      body: "Ola {{name}},\n\nA túa conta foi reactivada en {{appName}} e xa podes iniciar sesión de novo. Se cres que se trata dun erro, contacta cun administrador.",
    },
  },
};

/**
 * Maps a `sendAccountChangedEmail` reason to the `templates` key holding its dedicated copy.
 * `"email"`/`"status"`/`"profile"` share the generic `accountChanged` wording (rendered with
 * `{{reason}}`); the other reasons get their own subject/body with no `{{reason}}` token.
 */
const ACCOUNT_CHANGE_TEMPLATE_KEYS = {
  password: "accountPasswordChanged",
  deleted: "accountDeleted",
  reactivated: "accountReactivated",
};

/**
 * Renders and sends a template's HTML version (from `emails/`) plus a
 * plain-text fallback, for a template listed in `TEMPLATE_META`.
 * @param {string} templateKey - One of the keys in `TEMPLATE_META`.
 * @param {object} settings - The result of `getMailSettings()`.
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {object} data - Extra values, plus optionally `infoValue` and `actionUrl`.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
async function sendHtmlTemplatedMail(templateKey, settings, user, data) {
  const meta = TEMPLATE_META[templateKey];
  const locale = loadLocale(templateKey, user.lang);
  const mergedData = { name: user.name, appName: settings.appName, ...data };
  const escapedData = Object.fromEntries(Object.entries(mergedData).map(([key, value]) => [key, escapeHtml(value)]));

  const subject = render(locale.subject, mergedData);
  const text = render(locale.body, mergedData);
  const buttonUrl = data.actionUrl || settings.domain;

  const html = render(loadBaseTemplate(), {
    product_name: escapeHtml(settings.appName),
    preview_text: escapeHtml(subject),
    accent_color: meta.accent,
    badge_bg: meta.badgeBg,
    title: render(locale.title, escapedData),
    body_html: buildBodyHtml(render(locale.body, mergedData)),
    info_label: locale.infoLabel,
    info_value: escapeHtml(render(locale.infoValue, mergedData)),
    button_url: escapeHtml(buttonUrl),
    button_label: locale.buttonLabel,
  });

  const attachments = [
    { filename: "brand-icon.png", path: await ensureBrandIcon(), cid: "brandIcon" },
    { filename: "title-icon.png", path: await ensureIcon(meta.titleIcon), cid: "titleIcon" },
    { filename: "info-icon.png", path: await ensureIcon(meta.infoIcon), cid: "infoIcon" },
  ];

  return sendMail({ to: user.email, subject, text, html, attachments });
}

/**
 * Renders and sends one of the templates above to a user, in their stored
 * locale (falling back to "gl"). Never throws — see `sendMail`. Templates
 * listed in `TEMPLATE_META` use the HTML `emails/` system; the rest use the
 * legacy plain-text `templates` object.
 * @param {string} templateKey - One of the keys in `TEMPLATE_META` or `templates`.
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {object} [data] - Extra values available to the template as `{{tokens}}`.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendTemplatedMail(templateKey, user, data = {}) {
  const settings = await getMailSettings();

  if (TEMPLATE_META[templateKey]) {
    return sendHtmlTemplatedMail(templateKey, settings, user, data);
  }

  const localeTemplates = templates[templateKey];
  if (!localeTemplates) {
    logger.error(`Unknown mail template: ${templateKey}`);
    return false;
  }

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
 * Sends a password-reset email with a reset link. Called from
 * `requestPasswordReset` in `db/userService.js`.
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {string} resetLink - The password-reset URL, including the token.
 * @param {number} [expiryHours] - Hours until the reset link expires, shown in the email.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendPasswordResetEmail(user, resetLink, expiryHours = 1) {
  return sendTemplatedMail("passwordReset", user, { actionUrl: resetLink, expiryHours });
}

/**
 * Sends an "your account changed" notification, wired into the user lifecycle in
 * `db/userService.js` (profile edits, password changes, and soft delete/restore).
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {("email"|"password"|"status"|"profile"|"deleted"|"reactivated")} reason - What changed.
 *   `"deleted"`/`"reactivated"`/`"password"` use dedicated copy; the rest render the generic
 *   "your {{reason}} was changed" wording.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendAccountChangedEmail(user, reason) {
  const templateKey = ACCOUNT_CHANGE_TEMPLATE_KEYS[reason] || "accountChanged";
  return sendTemplatedMail(templateKey, user, { reason });
}
