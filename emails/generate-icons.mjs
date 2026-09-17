/**
 * Regenerates emails/assets/*.png from Lucide icons (via lucide-static), plus the brand icon.
 *
 * Email clients (Gmail, Outlook, ...) don't render inline <svg> and Gmail strips
 * `data:` image URIs, so icons ship as real PNG attachments instead. Icon SVGs are pulled
 * straight from lucide-static (the same icon set the frontend uses via lucide-vue-next),
 * not hand-copied, so they can't drift from the real icon. Add an entry to ICONS below and
 * re-run this to add a new one.
 *
 * Usage: node emails/generate-icons.mjs
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

/** Icons to generate: output filename -> { lucide icon name, stroke color }. */
const ICONS = {
  key: { lucide: "key", color: "#2159a3" },
  clock: { lucide: "clock", color: "#2159a3" },
};

fs.mkdirSync(ASSETS_DIR, { recursive: true });

for (const [name, { lucide, color }] of Object.entries(ICONS)) {
  const svg = fs.readFileSync(path.join(LUCIDE_ICONS_DIR, `${lucide}.svg`), "utf8").replaceAll("currentColor", color);
  await sharp(Buffer.from(svg))
    .resize(ICON_SIZE, ICON_SIZE)
    .png()
    .toFile(path.join(ASSETS_DIR, `${name}.png`));
  console.log(`generated ${name}.png (lucide:${lucide})`);
}

await sharp(BRAND_SOURCE)
  .resize(BRAND_SIZE, BRAND_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(ASSETS_DIR, "brand-icon.png"));
console.log("generated brand-icon.png");
