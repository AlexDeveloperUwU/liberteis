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
  var texto = parrafo;
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
        const eventosDeLaSemana = filtrarEventosDeLaSemana(data);

        if (eventosDeLaSemana.length > 0) {
          let currentIndex = 0;
          let loopCount = 0;
          const maxLoops = 5;

          const intervalId = setInterval(() => {
            mostrarEvento(eventosDeLaSemana[currentIndex]);
            currentIndex = (currentIndex + 1) % eventosDeLaSemana.length;
            if (currentIndex === 0) {
              loopCount++;
              if (loopCount >= maxLoops) {
                clearInterval(intervalId);
                location.reload();
              }
            }
          }, 60000);

          mostrarEvento(eventosDeLaSemana[0]);
        }
      }
    })
    .catch((error) => console.error("Error al obtener datos de la API", error));
});

function filtrarEventosDeLaSemana(eventos) {
  const ahora = new Date();
  const inicioSemana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const finSemana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 7);

  return eventos.filter((evento) => {
    const fechaEvento = new Date(evento.event_date);
    return fechaEvento >= inicioSemana && fechaEvento < finSemana;
  });
}

function mostrarEvento(evento) {
  const headerElement = document.querySelector(".header");
  const ahora = new Date();
  const fechaEvento = new Date(evento.event_date);
  if (
    fechaEvento.getDate() === ahora.getDate() &&
    fechaEvento.getMonth() === ahora.getMonth() &&
    fechaEvento.getFullYear() === ahora.getFullYear()
  ) {
    headerElement.classList.add("header-onair");
  } else {
    headerElement.classList.remove("header-onair");
  }
  document.getElementById("eventday").innerText = obtenerDia(evento.event_date);
  document.getElementById("eventdate").innerText = formatoFecha(evento.event_date);
  updateEventTime(evento.event_date);
  document.getElementById("description-text").innerHTML = dividirTexto(evento.desc);
  document.getElementById("event-title").innerText = evento.title;
}

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
