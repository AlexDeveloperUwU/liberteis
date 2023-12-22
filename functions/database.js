function saveEvent(db, title, desc, event_date) {
  const oldID = db.get("savedid");
  const eventID = (db.get("savedid") + 1).toString();
  try {
    db.set("savedid", oldID + 1);
    const event = {
      title: title,
      desc: desc,
      event_date: event_date,
    };
    db.set(eventID, event);
  } catch (error) {
    console.error(error);
  }
}

function deleteEvent(db, eventID) {
  try {
    const oldID = db.get("savedid");
    db.set("savedid", oldID - 1);
    const strID = eventID.toString();
    db.delete(strID);
  } catch (error) {
    console.error(error);
  }
}

function checkEvent(db, eventID) {
  try {
    const strID = eventID.toString();
    const response = db.get(strID);
    return response;
  } catch (error) {
    console.error(error);
  }
}

function getEvents(db) {
  const eventsList = [];
  db.forEach((data, id) => {
    if (id == "savedid") {
      return;
    }
    eventsList.push({
      id: id,
      title: data.title,
      desc: data.desc,
      event_date: data.event_date,
    });
  });

  return eventsList;
}

module.exports = { saveEvent, deleteEvent, checkEvent, getEvents };
