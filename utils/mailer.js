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
 * Non-translatable presentation metadata for each mail template. A template
 * key here renders through `emails/base.html` + `emails/locales/<lang>/<key>.json`.
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
  userCreated: {
    accent: "#2159a3",
    badgeBg: "#d4e2f5",
    titleIcon: "user-plus",
    infoIcon: "key",
  },
  accountChanged: {
    accent: "#2159a3",
    badgeBg: "#d4e2f5",
    titleIcon: "pencil",
    infoIcon: "info",
  },
  accountPasswordChanged: {
    accent: "#2159a3",
    badgeBg: "#d4e2f5",
    titleIcon: "lock",
    infoIcon: "shield-alert",
  },
  accountDeleted: {
    accent: "#b3261e",
    badgeBg: "#f6d3d0",
    titleIcon: "user-x",
    infoIcon: "circle-alert",
  },
  accountReactivated: {
    accent: "#1e8e3e",
    badgeBg: "#d3f0db",
    titleIcon: "user-check",
    infoIcon: "circle-check",
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
 * Builds the optional "info badge" row (icon + label + value) shown below an
 * email's body. Returns "" when there's nothing worth telling the reader,
 * so the row simply doesn't render instead of repeating the body text.
 * @param {string} badgeBg - The badge's background color.
 * @param {string} infoLabel - The small label above the value.
 * @param {string} infoValue - The bold value (already HTML-escaped).
 * @returns {string} The row's HTML, or "" to hide it.
 */
function buildInfoSection(badgeBg, infoLabel, infoValue) {
  if (!infoValue.trim()) return "";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 8px">
    <tr>
      <td width="40" valign="middle">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="40" height="40" align="center" valign="middle" bgcolor="${badgeBg}" style="border-radius: 999px; width: 40px; height: 40px">
              <img src="cid:infoIcon" width="20" height="20" alt="" style="display: block" />
            </td>
          </tr>
        </table>
      </td>
      <td valign="middle" style="padding-left: 14px; font-family: &quot;Lexend&quot;, Arial, sans-serif">
        <p style="margin: 0; font-size: 12px; color: #6c757d">${infoLabel}</p>
        <p style="margin: 2px 0 0; font-size: 16px; font-weight: 700; color: #212529">${infoValue}</p>
      </td>
    </tr>
  </table>`;
}

/**
 * Maps a `sendAccountChangedEmail` reason to the `TEMPLATE_META` key holding its dedicated copy.
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
  const buttonUrl = data.actionUrl || `${settings.domain}/auth/login`;
  const infoValue = escapeHtml(render(locale.infoValue, mergedData));
  const infoSection = buildInfoSection(meta.badgeBg, locale.infoLabel, infoValue);

  const html = render(loadBaseTemplate(), {
    product_name: escapeHtml(settings.appName),
    preview_text: escapeHtml(subject),
    accent_color: meta.accent,
    title: render(locale.title, escapedData),
    body_html: buildBodyHtml(render(locale.body, mergedData)),
    info_section: infoSection,
    button_url: escapeHtml(buttonUrl),
    button_label: locale.buttonLabel,
  });

  const attachments = [
    { filename: "brand-icon.png", path: await ensureBrandIcon(), cid: "brandIcon" },
    { filename: "title-icon.png", path: await ensureIcon(meta.titleIcon), cid: "titleIcon" },
    ...(infoSection ? [{ filename: "info-icon.png", path: await ensureIcon(meta.infoIcon), cid: "infoIcon" }] : []),
  ];

  return sendMail({ to: user.email, subject, text, html, attachments });
}

/**
 * Renders and sends one of the templates in `TEMPLATE_META` to a user, in
 * their stored locale (falling back to "gl"). Never throws — see `sendMail`.
 * @param {string} templateKey - One of the keys in `TEMPLATE_META`.
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {object} [data] - Extra values available to the template as `{{tokens}}`.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendTemplatedMail(templateKey, user, data = {}) {
  if (!TEMPLATE_META[templateKey]) {
    logger.error(`Unknown mail template: ${templateKey}`);
    return false;
  }

  const settings = await getMailSettings();
  return sendHtmlTemplatedMail(templateKey, settings, user, data);
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
 * Sends an account-change notification, wired into the user lifecycle in
 * `db/userService.js` (profile edits, password changes, and soft delete/restore).
 * @param {{email: string, name: string, lang?: string}} user - The recipient.
 * @param {("password"|"profile"|"deleted"|"reactivated")} reason - What changed. `"password"`,
 *   `"deleted"` and `"reactivated"` use dedicated copy; anything else falls back to the generic
 *   "your profile was changed" wording.
 * @param {string} [changedBy] - Display name of the admin who made the change, when it wasn't
 *   the user themselves. Shown in the info badge; omitted, the badge is hidden.
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
export async function sendAccountChangedEmail(user, reason, changedBy) {
  const templateKey = ACCOUNT_CHANGE_TEMPLATE_KEYS[reason] || "accountChanged";
  return sendTemplatedMail(templateKey, user, { reason, changedBy });
}
