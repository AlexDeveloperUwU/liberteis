const fs = require("fs");
const path = require("path");

// Función para obtener la fecha y hora actual en formato YYYY-MM-DD-HHMMSS
const getTimeDate = () => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.toLocaleTimeString("es-ES", { hour12: false }).replace(/:/g, "");
  return `${fecha}-${hora}`;
};

// Función para obtener la fecha y hora actual en formato YYYY-MM-DD => HH:MM:SS
const getTimeDate2 = () => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.getHours().toString().padStart(2, "0");
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");
  return `${fecha} => ${hora}:${minutos}:${segundos}`;
};

// Definición del directorio y archivo de logs
const logsDirectorio = path.join(__dirname, "../logs");
const nombreArchivo = `${getTimeDate()}.log`;
const rutaArchivo = path.join(logsDirectorio, nombreArchivo);

// Crear el directorio de logs si no existe
if (!fs.existsSync(logsDirectorio)) {
  fs.mkdirSync(logsDirectorio);
}

// Función para mantener solo los últimos 4 archivos .log
const mantenerUltimos4Logs = () => {
  const archivos = fs
    .readdirSync(logsDirectorio)
    .filter((file) => file.endsWith(".log"))
    .map((file) => ({
      nombre: file,
      tiempo: fs.statSync(path.join(logsDirectorio, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.tiempo - a.tiempo);

  const archivosAEliminar = archivos.slice(4);

  archivosAEliminar.forEach((archivo) => {
    fs.unlinkSync(path.join(logsDirectorio, archivo.nombre));
  });
};

// Middleware para registrar las solicitudes
const logRequests = (req, res, next) => {
  const ip = req.ip.replace(/^::ffff:/, "");
  const metodo = req.method;
  const url = req.url;
  const registro = `${ip} [${getTimeDate2()}] ${metodo} ${url}\n`;

  fs.writeFileSync(rutaArchivo, registro, { flag: "a" });

  mantenerUltimos4Logs();
  next();
};

// Exportar el middleware
module.exports = { logRequests };
