/**
 * Lazily generates and caches emails/assets/*.png icons on first use.
 *
 * Email clients (Gmail, Outlook, ...) don't render inline <svg> and Gmail strips
 * `data:` image URIs, so icons ship as real PNG attachments instead. Icon SVGs are pulled
 * straight from lucide-static (the same icon set the frontend uses via lucide-vue-next),
 * not hand-copied, so they can't drift from the real icon. Any Lucide icon name works with
 * `ensureIcon` — there is no registration step.
 *
 * Run directly (`node emails/generate-icons.mjs` / `npm run email:icons`) to clear every
 * cached icon (they're regenerated lazily on next use) and rebuild the brand icon — e.g.
 * after bumping lucide-static.
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
const ICON_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Stroke color used when a template doesn't specify one. */
const DEFAULT_COLOR = "#2159a3";

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
 * Returns the path to the PNG for Lucide icon `name` drawn in `color`, generating and caching
 * it on disk the first time that name/color pair is requested. The color is part of the
 * filename, so the same icon in different colors never collides.
 * @param {string} name Lucide icon name (kebab-case), e.g. "circle-check".
 * @param {string} [color] Hex stroke color (`#rgb` or `#rrggbb`).
 * @returns {Promise<string>}
 * @throws {Error} If `name` isn't a Lucide icon or `color` isn't a hex color.
 */
export async function ensureIcon(name, color = DEFAULT_COLOR) {
  if (typeof name !== "string" || !ICON_NAME_RE.test(name)) {
    throw new Error(`Invalid Lucide icon name: ${JSON.stringify(name)} (expected kebab-case, e.g. "circle-check")`);
  }
  if (typeof color !== "string" || !HEX_COLOR_RE.test(color)) {
    throw new Error(`Invalid icon color for "${name}": ${JSON.stringify(color)} (expected hex like "#2159a3")`);
  }

  const outPath = path.join(ASSETS_DIR, `${name}-${color.slice(1).toLowerCase()}.png`);
  if (fs.existsSync(outPath)) return outPath;

  const svgPath = path.join(LUCIDE_ICONS_DIR, `${name}.svg`);
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Unknown Lucide icon "${name}": no ${name}.svg in lucide-static (see https://lucide.dev/icons)`);
  }
  const svg = fs.readFileSync(svgPath, "utf8").replaceAll("currentColor", color);
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
  for (const file of fs.existsSync(ASSETS_DIR) ? fs.readdirSync(ASSETS_DIR) : []) {
    if (file.endsWith(".png")) fs.rmSync(path.join(ASSETS_DIR, file), { force: true });
  }
  console.log("cleared cached icons (regenerated on next use)");
  await ensureBrandIcon();
  console.log("generated brand-icon.png");
}
