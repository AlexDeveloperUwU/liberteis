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

function dividirTexto(parrafo) {
  var texto = parrafo
  var palabras = texto.split(" ");
  var lineas = [];

  for (var i = 0; i < palabras.length; i += 5) {
    var linea = palabras.slice(i, i + 5).join(" ");
    lineas.push(linea);
  }
  return lineas.join("<br>");
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/list", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const evento = data[0];
        console.log(evento);

        document.getElementById("eventday").innerText = obtenerDia(evento.event_date);
        document.getElementById("eventdate").innerText = formatoFecha(evento.event_date);
        updateEventTime(evento.event_date);
        document.getElementById("description-text").innerText = dividirTexto(evento.desc);
        document.getElementById("event-title").innerText = evento.title;

        // document.querySelector(".poster").src = evento.thumb_url || "ruta_por_defecto";
        // document.querySelector(".qr-code img").src = evento.qr_url || "ruta_por_defecto";
      }
    })
    .catch((error) => console.error("Error al obtener datos de la API", error));
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
