const db = require("./dbController");

function generateUniqueId(type) {
  let letter;
  let uniqueId;
  switch (type) {
    case "event":
      letter = "E";
      do {
        uniqueId = generateId(letter);
      } while (db.checkExistence("events", uniqueId));
      return uniqueId;
    case "user":
      letter = "U";
      do {
        uniqueId = generateId(letter);
      } while (db.checkExistence("events", uniqueId));
      return uniqueId;
    case "booking":
      letter = "B";
      do {
        uniqueId = generateId(letter);
      } while (db.checkExistence("events", uniqueId));
      return uniqueId;
    case "space":
      letter = "S";
      do {
        uniqueId = generateId(letter);
      } while (db.checkExistence("events", uniqueId));
      return uniqueId;
    case "category":
      letter = "C";
      do {
        uniqueId = generateId(letter);
      } while (db.checkExistence("events", uniqueId));
      return uniqueId;
  }
}

function generateId(letter) {
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

module.exports = { generateUniqueId };
