const bcrypt = require("bcrypt");
const enmap = require("enmap");
const users = new enmap({ name: "users" });

// Función para guardar un usuario, por defecto se crea como usuario normal
async function saveUser(fullname, email, password, type = "normalUser", createdBy = "SYSTEM") {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0] + "T00:00";
    users.set(email, {
      email,
      fullname,
      hashedPassword,
      type,
      createdBy,
      createdDate: formattedDate,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function loginUser(email, password) {
  const user = users.get(email);

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return false;
  } else {
    return user.fullname;
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

function listUsers() {
  const usersList = [];
  db.forEach((data, key) => {
    usersList.push({
      email: data.email,
      fullname: data.fullname,
      type: data.type,
      createdDate: data.createdDate,
      createdBy: data.createdBy,
    });
  });

  return usersList;
}

module.exports = { saveUser, getUserCount, userExists, loginUser, listUsers };
