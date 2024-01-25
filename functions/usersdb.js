const bcrypt = require("bcrypt");
const enmap = require("enmap");
const users = new enmap({ name: "users" });


// Función para guardar un usuario, por defecto se crea como usuario normal
async function saveUser(fullname, email, password, type = "normalUser") {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(email, { email, fullname, hashedPassword, type });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function loginUser(email, password) {
  const user = users.get(email);
}

// Función para comprobar si un usuario existe en la base de datos
function userExists(email) {
  const user = users.get(email);
  if (user) {
    return true;
  } else {
    return false;
  }
}

// Función para obtener el número de usuarios en la base de datos
function getUserCount() {
  return users.count;
}

module.exports = { saveUser, getUserCount, userExists };
