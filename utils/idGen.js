import * as dbc from "../db/dbController.js";

export async function generateId(type) {
  const typeToLetterMap = {
    event: "E",
    user: "U",
    booking: "B",
    space: "S",
    category: "C",
  };

  const typeToTableMap = {
    event: "events",
    user: "users",
    booking: "bookings",
    space: "spaces",
    category: "categories",
  };

  const letter = typeToLetterMap[type];
  if (!letter) {
    throw new Error(`Invalid type: ${type}`);
  }

  let uniqueId;
  do {
    uniqueId = generateCombination(letter);
  } while (await dbc.dbCheckExistence(typeToTableMap[type], uniqueId));

  return uniqueId;
}

function generateCombination(letter) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  const randomNumbers = Array.from({ length: 2 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join("");

  const combined = `${randomLetters}${randomNumbers}`
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return `${letter}${combined}`;
}
