document.addEventListener("DOMContentLoaded", function () {
  const eventList = document.getElementById("eventList");
  const imagePopup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function formatDateString(dateString) {
    const parts = dateString.split(" ");
    parts[0] = capitalizeFirstLetter(parts[0]);
    parts[3] = capitalizeFirstLetter(parts[3]);
    return parts.join(" ");
  }

  function createEventCard(event) {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    const isToday = eventDate.toDateString() === today.toDateString();

    // Elimina cualquier lógica de corte de la descripción
    const fullDesc = event.desc;

    const eventCard = document.createElement("div");
    eventCard.className = "bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer";

    eventCard.innerHTML = `
        <img class="w-full h-48 object-cover" src="${event.thumb_url}" alt="${event.title}">
        <div class="p-4">
          <span class="text-gray-600 block mb-2 ${isToday ? "bg-yellow-200" : ""}">
            ${formatDateString(
              eventDate.toLocaleString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            )}
          </span>
          <h2 class="text-2xl font-bold mb-2">
            <a href="/event/${event.id}" class="underline">${event.title}</a>
          </h2>
          <span class="inline-block bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded mb-4">
            ${event.type}
          </span>
          <p class="text-gray-700 mb-4" id="description-${event.id}">
            ${fullDesc}
          </p>
        </div>
      `;

    const eventImage = eventCard.querySelector("img");

    eventImage.addEventListener("click", function (e) {
      popupImage.src = event.thumb_url;
      popupImage.alt = event.title;
      imagePopup.style.display = "flex";
      e.stopPropagation();
    });

    return eventCard;
  }

  function displayEvents(events) {
    eventList.innerHTML = "";
    events.forEach((event) => {
      const eventCard = createEventCard(event);
      eventList.appendChild(eventCard);
    });
  }

  async function fetchEvents() {
    try {
      const response = await fetch("/api/list?days=7", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const eventsData = await response.json();
      displayEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  fetchEvents();
});
