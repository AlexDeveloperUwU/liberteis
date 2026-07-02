import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import sharp from "sharp";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

const convertToAvif = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = "event-" + uniqueSuffix + ".avif";
    const outputPath = path.join(__dirname, "../data/uploads", filename);

    await sharp(req.file.buffer)
      .avif({
        quality: 75,
        effort: 1,
      })
      .toFile(outputPath);

    req.file.path = outputPath;
    req.file.filename = filename;

    next();
  } catch (error) {
    logger.error(`Error converting to AVIF: ${error.message}`);
    next(error);
  }
};

export const uploadEventImage = [upload.single("image"), convertToAvif];

export const deleteEventImage = (filename) => {
  if (!filename) return;

  const filePath = path.join(__dirname, "../data/uploads", filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      logger.info(`Image deleted: ${filename}`);
    } catch (error) {
      logger.error(`Error deleting image ${filename}: ${error.message}`);
    }
  }
};
