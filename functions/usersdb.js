const bcrypt = require("bcrypt");
const enmap = require("enmap");
const users = new enmap({ name: "users" });

// Función para guardar un usuario, por defecto se crea como usuario normal
async function saveUser(fullname, email, password, type = "normalUser", createdBy = "SYSTEM") {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const currentDate = new Date();
    const formattedDate =
      currentDate.toISOString().split("T")[0] +
      "T" +
      ("0" + currentDate.getHours()).slice(-2) +
      ":" +
      ("0" + currentDate.getMinutes()).slice(-2);

    users.set(email, {
      email,
      fullname,
      hashedPassword,
      type,
      createdBy,
      createdDate: formattedDate,
      lastLogin: null,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Función para iniciar sesión
async function loginUser(email, password) {
  const user = users.get(email);

  // Guardamos la fecha del último inicio de sesión
  const currentDate = new Date();
  const formattedDate =
    currentDate.toISOString().split("T")[0] +
    "T" +
    ("0" + currentDate.getHours()).slice(-2) +
    ":" +
    ("0" + currentDate.getMinutes()).slice(-2);

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return false;
  } else {
    users.set(email, formattedDate, "lastLogin");
    return [user.fullname, user.email, user.type];
  }
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

// Función para listar los usuarios de la base de datos
function listUsers() {
  const usersList = [];
  users.forEach((data, key) => {
    usersList.push({
      email: data.email,
      fullname: data.fullname,
      type: data.type,
      createdDate: data.createdDate,
      createdBy: data.createdBy,
      lastLogin: data.lastLogin,
    });
  });

  return usersList;
}

function unregisterUser(email) {
  const user = users.get(email);
  if (user) {
    users.delete(email);
    return true;
  } else {
    return false;
  }
}

async function resetPassword(email, password) {
  const user = users.get(email);
  if (user) {
    const currentDate = new Date();
    const formattedDate =
      currentDate.toISOString().split("T")[0] +
      "T" +
      ("0" + currentDate.getHours()).slice(-2) +
      ":" +
      ("0" + currentDate.getMinutes()).slice(-2);

    users.set(email, formattedDate, "lastLogin");

    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(email, hashedPassword, "hashedPassword");
    return true;
  } else {
    return false;
  }
}

function forcePasswordReset(email) {
  const user = users.get(email);
  if (user) {
    const isnull = user.lastLogin;
    if (isnull === null) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = {
  saveUser,
  getUserCount,
  userExists,
  loginUser,
  listUsers,
  unregisterUser,
  resetPassword,
  forcePasswordReset,
};
