document.addEventListener("DOMContentLoaded", function () {
  const eventImage = document.getElementById("eventImage");
  const eventDateTime = document.getElementById("eventDateTime");
  const eventTitle = document.getElementById("eventTitle");
  const eventCategory = document.getElementById("eventCategory");
  const eventDescription = document.getElementById("eventDescription");
  const imagePopup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");
  const closeButton = document.querySelector(".close-popup");

  const googleCalendarLink = document.getElementById("googleCalendarLink");
  const iCalendarLink = document.getElementById("iCalendarLink");

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function formatDateString(dateString) {
    const parts = dateString.split(" ");
    parts[0] = capitalizeFirstLetter(parts[0]);
    parts[3] = capitalizeFirstLetter(parts[3]);
    return parts.join(" ");
  }

  function formatDateForICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}00`;
  }

  function generateGoogleCalendarLink(event) {
    const startDate = formatDateForICS(new Date(event.event_date));
    const endDate = new Date(event.event_date);
    endDate.setHours(endDate.getHours() + 1);
    const endDateFormatted = formatDateForICS(endDate);
    const reminder = "15";

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startDate}/${endDateFormatted}&details=${encodeURIComponent(event.desc)}&sf=true&output=xml&reminders=%5B%7B%22method%22:%22popup%22,%22minutes%22:${reminder}%7D%5D`;
  }

  function generateICalendarFile(event) {
    const startDate = new Date(event.event_date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const startDateFormatted = formatDateForICS(startDate);
    const endDateFormatted = formatDateForICS(endDate);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDateFormatted}
DTEND:${endDateFormatted}
SUMMARY:${event.title}
DESCRIPTION:${event.desc}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Recordatorio
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const fileName = `${startDate.toISOString().split("T")[0]}_${event.title}.ics`.replace(/\s+/g, "_");
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
  }

  function displayEvent(event) {
    const eventDate = new Date(event.event_date);

    eventImage.src = event.thumb_url;
    eventImage.alt = event.title;
    eventDateTime.textContent = formatDateString(
      eventDate.toLocaleString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    eventTitle.textContent = event.title;
    eventCategory.textContent = event.type;
    eventDescription.textContent = event.desc;

    googleCalendarLink.href = generateGoogleCalendarLink(event);
    iCalendarLink.addEventListener("click", function () {
      generateICalendarFile(event);
    });

    eventImage.addEventListener("click", function () {
      popupImage.src = event.thumb_url;
      popupImage.alt = event.title;
      imagePopup.style.display = "flex";
    });
  }

  function closeImagePopup() {
    imagePopup.style.display = "none";
  }

  closeButton.addEventListener("click", function (event) {
    closeImagePopup();
    event.stopPropagation();
  });

  async function fetchEvent() {
    const url = window.location.href;
    const segments = url.split("/");
    const eventID = segments.pop().toString();

    try {
      const response = await fetch("/api/eventdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: eventID,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const eventData = await response.json();
      displayEvent(eventData);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  }

  fetchEvent();
});
