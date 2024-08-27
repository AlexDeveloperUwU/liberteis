const bcrypt = require("bcrypt");
const enmap = require("enmap");
const passgen = require("generate-password");
const users = new enmap({ name: "users" });

//* Función para generar una contraseña segura
function generatePassword() {
  return passgen.generate({
    length: 24,
    numbers: true,
    symbols: false,
    lowercase: true,
    uppercase: true,
  });
}

//* Funciones para gestionar la base de datos de usuarios
async function saveUser(
  fullname,
  email,
  password,
  type = "normalUser",
  createdBy = "SYSTEM",
  lang = "gl"
) {
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
      lang,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function loginUser(email, password) {
  const user = users.get(email);

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
    return [user.fullname, user.email, user.type, user.lang];
  }
}

function userExists(email) {
  const user = users.get(email);
  if (user) {
    return true;
  } else {
    return false;
  }
}

function getUserCount() {
  return users.count;
}

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
      lang: data.lang,
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

async function changePassword(email, password) {
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

async function resetPassword(email) {
  const user = users.get(email);
  if (user) {
    users.set(email, null, "lastLogin");
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(email, hashedPassword, "hashedPassword");
    return password;
  } else {
    return false;
  }
}

function getUserInfo(user) {
  try {
    console.log(user);
    const userData = users.get(user);
    if (userData && userData.hasOwnProperty("hashedPassword")) {
      delete userData.hashedPassword;
    }
    return userData;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function changeUserLang(user, lang) {
  const userData = users.get(user);
  if (userData) {
    users.set(user, lang, "lang");
    return true;
  } else {
    return false;
  }
}

module.exports = {
  saveUser,
  getUserCount,
  userExists,
  loginUser,
  listUsers,
  unregisterUser,
  changePassword,
  resetPassword,
  getUserInfo,
  changeUserLang,
};
