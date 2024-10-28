const db = require("./dbController.js");
const idGen = require("../functions/idGenerator.js");

async function addEvent(event) {
  const requiredFields = ["title", "info", "duration", "thumbUrl", "qrUrl", "category", "creator"];

  for (const field of requiredFields) {
    if (!event.hasOwnProperty(field) || event[field] === null) {
      throw new Error(`Missing or null required field: ${field}`);
    }
  }

  const id = idGen.generateId();
  event.id = id;

  db.addEvent(event);
}

module.exports = {
  addEvent,
};
