document.addEventListener("DOMContentLoaded", function () {
  const eventImage = document.getElementById("eventImage");
  const eventDateTime = document.getElementById("eventDateTime");
  const eventTitle = document.getElementById("eventTitle");
  const eventCategory = document.getElementById("eventCategory");
  const eventDescription = document.getElementById("eventDescription");
  const imagePopup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");
  const closeButton = document.querySelector(".close-popup");

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function formatDateString(dateString) {
    const parts = dateString.split(" ");
    parts[0] = capitalizeFirstLetter(parts[0]);
    parts[3] = capitalizeFirstLetter(parts[3]);
    return parts.join(" ");
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
