const db = require("../../functions/dbController.js");
const Router = require("express").Router;
const router = Router();
const multer = require("multer");
const sharp = require("sharp");

router.get("/", (res) => {
  res.status(404).send("API Endpoint not avaliable.");
});

//! Gestor de uploads para los eventos

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("thumbnailfile"), async (req, res) => {
  try {
    /* 
    Aquí lo que hago es utilizar la imagen original que se sube al servidor para crear una versión en formato AVIF,
    que es un formato web mucho más ligero y eficiente que el JPEG o el PNG. Una vez que se ha creado la versión AVIF,
    se elimina la versión original y devuelve la URL de la nueva versión del fichero.
    */

    const fileName = req.file.filename;
    const filePath = path.join("uploads", fileName);
    const avifFileName = `${path.parse(fileName).name}.avif`;
    const avifFilePath = path.join("uploads", avifFileName);

    await sharp(filePath).toFormat("avif").toFile(avifFilePath);

    fs.unlinkSync(filePath);

    const fileURL = `${process.env.APP_URL}/thumbs/${avifFileName}`;

    res.status(200).send({ url: fileURL });
  } catch (error) {
    res.status(500).send("Error al procesar la imagen. Por favor, inténtalo de nuevo.");
  }
});

//! Rutas para gestionar los eventos



//! Exportamos el router para añadirlo al index de la web
module.exports = router;
