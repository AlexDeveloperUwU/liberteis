document.addEventListener("DOMContentLoaded", function () {
  const topBar = document.getElementById("topBar");
  const eventImage = document.getElementById("eventImage");
  const eventDateTime = document.getElementById("eventDateTime");
  const eventTitle = document.getElementById("eventTitle");
  const eventCategory = document.getElementById("eventCategory");
  const eventDescription = document.getElementById("eventDescription");
  const qrCodeElement = document.getElementById("qrCode");

  let events = [];
  let currentEventIndex = 0;

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function formatDateString(dateString) {
    const parts = dateString.split(" ");
    parts[0] = capitalizeFirstLetter(parts[0]);
    parts[3] = capitalizeFirstLetter(parts[3]);
    return parts.join(" ");
  }

  function updateTopBar() {
    const now = new Date();

    const dateElement = document.getElementById("date");
    dateElement.textContent = formatDateString(
      now.toLocaleString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    const timeElement = document.getElementById("time");
    timeElement.textContent = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function filterEvents(allEvents) {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const filteredEvents = allEvents.filter((event) => {
      const eventDate = new Date(event.event_date);
      return eventDate > now || (eventDate <= now && now - eventDate <= 3600000);
    });

    filteredEvents.sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return dateA - dateB;
    });

    console.log(filteredEvents)
    return filteredEvents;
  }

  function displayEvent(event) {
    const eventDate = new Date(event.event_date);

    if (isToday(eventDate)) {
      topBar.classList.remove("bg-blue-600");
      topBar.classList.add("bg-teal-500");
    } else {
      topBar.classList.remove("bg-teal-500");
      topBar.classList.add("bg-blue-600");
    }

    eventImage.src = event.thumb_url;
    eventImage.alt = event.title;
    eventDateTime.textContent = formatDateString(
      eventDate.toLocaleString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    eventTitle.textContent = event.title;
    eventCategory.textContent = event.type;
    eventDescription.textContent = event.desc;

    qrCodeElement.innerHTML = "";
    new QRCode(qrCodeElement, {
      text: event.qr_url,
      width: 128,
      height: 128,
    });
  }

  function rotateEvents() {
    if (events.length > 0) {
      displayEvent(events[currentEventIndex]);
      currentEventIndex = (currentEventIndex + 1) % events.length;
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch("/api/list", { method: "POST" });
      const allEvents = await response.json();
      events = filterEvents(allEvents);
      if (events.length > 0) {
        rotateEvents();
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  updateTopBar();
  setInterval(updateTopBar, 60000);

  fetchEvents();
  setInterval(fetchEvents, 900000);

  setInterval(rotateEvents, 10000);
});
