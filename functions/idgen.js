// * Este fichero contiene funciones para generar IDs únicos para eventos

function generateUniqueEventID(db) {
  let idGenerada = generateEventID();

  while (existsId(idGenerada, db)) {
    idGenerada = generateEventID();
  }

  return idGenerada;
}

function existsId(id, db) {
  return db.has(id);
}

function generateEventID() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";

  let idGenerada = "";
  for (let i = 0; i < 3; i++) {
    const indice = Math.floor(Math.random() * letras.length);
    idGenerada += letras.charAt(indice);
  }

  for (let i = 0; i < 3; i++) {
    const indice = Math.floor(Math.random() * numeros.length);
    idGenerada += numeros.charAt(indice);
  }

  idGenerada =
    "E" +
    idGenerada
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

  return idGenerada;
}

module.exports = {
  generateUniqueEventID,
};
