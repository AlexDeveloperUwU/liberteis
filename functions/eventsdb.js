const idGen = require("./idgen");

function saveEvent(db, title, desc, event_date, type, thumb_url = null, published_by) {
  const eventID = idGen.generateUniqueEventID(db);
  const qr_url = `${process.env.APP_URL}/event/${eventID}`
  try {
    const event = {
      title: title,
      desc: desc,
      event_date: event_date,
      type: type,
      thumb_url: thumb_url,
      qr_url: qr_url,
      published_by: published_by,
    };
    db.set(eventID, event);
  } catch (error) {
    console.error(error);
  }
}

function editEvent(db, eventID, title, desc, event_date, type, thumb_url = null, qr_url = null, published_by) {
  try {
    const event = {
      title: title,
      desc: desc,
      event_date: event_date,
      type: type,
      thumb_url: thumb_url,
      qr_url: qr_url,
      published_by: published_by,
    };
    db.set(eventID, event);
  } catch (error) {
    console.error(error);
  }
}

function deleteEvent(db, eventID) {
  try {
    db.delete(eventID);
  } catch (error) {
    console.error(error);
  }
}

function checkEvent(db, eventID) {
  try {
    const response = db.get(eventID);
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
      type: data.type,
      thumb_url: data.thumb_url,
      qr_url: data.qr_url,
      published_by: data.published_by,
    });
  });

  return eventsList;
}

module.exports = { saveEvent, deleteEvent, checkEvent, getEvents, editEvent };
