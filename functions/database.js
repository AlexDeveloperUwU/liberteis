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
    return 200;
    
  } catch (error) {
    console.error(error);
    return 500;
  }
}

function getEvents(db) {
  const eventsList = [];
  db.forEach((data, id) => {
    if (id == "savedid") {
      return;
    }
    eventsList.push({
      title: data.title,
      desc: data.desc,
      event_date: data.event_date,
    });
  });

  return eventsList;
}

module.exports = { saveEvent, getEvents };
