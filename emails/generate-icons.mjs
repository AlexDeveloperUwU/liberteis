/**
 * Lazily generates and caches emails/assets/*.png icons on first use.
 *
 * Email clients (Gmail, Outlook, ...) don't render inline <svg> and Gmail strips
 * `data:` image URIs, so icons ship as real PNG attachments instead. Icon SVGs are pulled
 * straight from lucide-static (the same icon set the frontend uses via lucide-vue-next),
 * not hand-copied, so they can't drift from the real icon. Add an entry to ICONS below to
 * make a new one available to `ensureIcon`.
 *
 * Run directly (`node emails/generate-icons.mjs` / `npm run email:icons`) to force-regenerate
 * every icon, bypassing the cache — e.g. after bumping lucide-static or changing a color.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LUCIDE_ICONS_DIR = path.join(__dirname, "..", "node_modules", "lucide-static", "icons");
const ASSETS_DIR = path.join(__dirname, "assets");
const ICON_SIZE = 64;
const BRAND_SOURCE = path.join(__dirname, "..", "client", "src", "assets", "img", "icon.png");
const BRAND_SIZE = 56;

/** Icons available to `ensureIcon`: name -> { lucide icon name, stroke color }. */
const ICONS = {
  key: { lucide: "key", color: "#2159a3" },
  clock: { lucide: "clock", color: "#2159a3" },
  "user-plus": { lucide: "user-plus", color: "#2159a3" },
  pencil: { lucide: "pencil", color: "#2159a3" },
  info: { lucide: "info", color: "#2159a3" },
  lock: { lucide: "lock", color: "#2159a3" },
  "shield-alert": { lucide: "shield-alert", color: "#2159a3" },
  "user-x": { lucide: "user-x", color: "#b3261e" },
  "circle-alert": { lucide: "circle-alert", color: "#b3261e" },
  "user-check": { lucide: "user-check", color: "#1e8e3e" },
  "circle-check": { lucide: "circle-check", color: "#1e8e3e" },
};

/**
 * Writes `outPath` via a temp file + rename so a concurrent read of a half-written file
 * (two requests racing to generate the same missing icon) can never happen.
 * @param {string} outPath
 * @param {(tmpPath: string) => Promise<unknown>} build
 */
async function writeAtomic(outPath, build) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const tmpPath = `${outPath}.${process.pid}.tmp`;
  await build(tmpPath);
  fs.renameSync(tmpPath, outPath);
}

/**
 * Returns the path to `name`'s PNG (a key in `ICONS`), generating and caching it on disk
 * the first time it's requested.
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function ensureIcon(name) {
  const outPath = path.join(ASSETS_DIR, `${name}.png`);
  if (fs.existsSync(outPath)) return outPath;

  const { lucide, color } = ICONS[name];
  const svg = fs.readFileSync(path.join(LUCIDE_ICONS_DIR, `${lucide}.svg`), "utf8").replaceAll("currentColor", color);
  await writeAtomic(outPath, (tmpPath) => sharp(Buffer.from(svg)).resize(ICON_SIZE, ICON_SIZE).png().toFile(tmpPath));
  return outPath;
}

/**
 * Returns the path to the app's brand icon PNG, generating and caching it on disk the
 * first time it's requested.
 * @returns {Promise<string>}
 */
export async function ensureBrandIcon() {
  const outPath = path.join(ASSETS_DIR, "brand-icon.png");
  if (fs.existsSync(outPath)) return outPath;

  await writeAtomic(outPath, (tmpPath) =>
    sharp(BRAND_SOURCE)
      .resize(BRAND_SIZE, BRAND_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(tmpPath),
  );
  return outPath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of Object.keys(ICONS)) {
    fs.rmSync(path.join(ASSETS_DIR, `${name}.png`), { force: true });
    await ensureIcon(name);
    console.log(`generated ${name}.png`);
  }
  fs.rmSync(path.join(ASSETS_DIR, "brand-icon.png"), { force: true });
  await ensureBrandIcon();
  console.log("generated brand-icon.png");
}
