function updateCurrentTime() {
  const currentTimeElement = document.getElementById("current-time");
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  currentTimeElement.textContent = `${hours}:${minutes}`;
}

setInterval(updateCurrentTime, 1);
updateCurrentTime();

function updateEventTime(eventTime) {
  const eventTimeElement = document.getElementById("event-time");
  const eventDate = new Date(eventTime);
  const hours = eventDate.getHours().toString().padStart(2, "0");
  const minutes = eventDate.getMinutes().toString().padStart(2, "0");
  eventTimeElement.textContent = `${hours}:${minutes}`;
}

document.addEventListener("DOMContentLoaded", function () {
  var url = window.location.href;
  var segments = url.split("/");
  var eventID = segments.pop().toString();

  $.ajax({
    url: "/api/eventdata",
    type: "POST",
    data: {
      id: eventID,
    },
    success: function (data) {
      const headerElement = document.querySelector(".header");
      const ahora = new Date();
      const fechaEvento = new Date(data.event_date);

      if (
        fechaEvento.getDate() === ahora.getDate() &&
        fechaEvento.getMonth() === ahora.getMonth() &&
        fechaEvento.getFullYear() === ahora.getFullYear()
      ) {
        headerElement.classList.add("header-onair");
      } else {
        headerElement.classList.remove("header-onair");
      }

      const eventInfoElement = document.querySelector(".event-info");
      eventInfoElement.classList.add("hide");

      document.getElementById("eventday").innerText = obtenerDia(data.event_date);
      document.getElementById("eventdate").innerText = formatoFecha(data.event_date);
      updateEventTime(data.event_date);
      document.getElementById("description-text").innerHTML = data.desc;
      document.getElementById("event-title").innerText = data.title;
      document.getElementById("eventCategory").innerText = data.type;
      eventInfoElement.classList.remove("hide");
    },
    error: function (error) {
      console.error(error);
    },
  });
});

function obtenerDia(fecha) {
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const fechaObj = new Date(fecha);
  const diaSemana = fechaObj.getDay();
  return diasSemana[diaSemana];
}

function formatoFecha(fecha) {
  const fechaObj = new Date(fecha);
  const dia = fechaObj.getDate().toString().padStart(2, "0");
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
  const año = fechaObj.getFullYear();
  return `${dia}/${mes}/${año}`;
}

function obtenerHoraActual() {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, "0");
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  return `${horas}:${minutos}`;
}

function actualizarFechaYDia() {
  const dayElement = document.getElementById("day");
  const dateElement = document.getElementById("date");
  const ahora = new Date();

  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const diaActual = diasSemana[ahora.getDay()];
  const fechaActual = formatoFecha2(ahora);

  dayElement.innerText = diaActual;
  dateElement.innerText = fechaActual;
}

actualizarFechaYDia();

function formatoFecha2(fecha) {
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año}`;
}

actualizarFechaYDia();
