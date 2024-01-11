function generateUniqueEventID(db) {
  let idGenerada = generateEventID();

  while (isIDExist(idGenerada, db)) {
    idGenerada = generateEventID();
  }

  return idGenerada;
}

function generateUniqueUserID(db) {
  let idGenerada = generateUserID();

  while (isIDExist(idGenerada, db)) {
    idGenerada = generateUserID();
  }

  return idGenerada;
}

function isIDExist(id, db) {
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

function generateUserID() {
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
    "U" +
    idGenerada
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

  return idGenerada;
}

module.exports = {
  generateUniqueEventID,
  generateUniqueUserID,
};
