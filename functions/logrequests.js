const fs = require("fs");
const path = require("path");

const getTimeDate = () => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.toLocaleTimeString("es-ES", { hour12: false }).replace(/:/g, "");
  return `${fecha}-${hora}`;
};

const getTimeDate2 = () => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.getHours().toString().padStart(2, "0");
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");
  return `${fecha} => ${hora}:${minutos}:${segundos}`;
};

const logsDirectorio = path.join(__dirname, "../logs");
const nombreArchivo = `${getTimeDate()}.log`;
const rutaArchivo = path.join(logsDirectorio, nombreArchivo);

if (!fs.existsSync(logsDirectorio)) {
  fs.mkdirSync(logsDirectorio);
}

const logRequests = (req, res, next) => {
  const ip = req.ip.replace(/^::ffff:/, "");
  const metodo = req.method;
  const url = req.url;
  const registro = `${ip} [${getTimeDate2()}] ${metodo} ${url}\n`;
  fs.writeFileSync(rutaArchivo, registro, { flag: "a" });
  next();
};

module.exports = { logRequests };
