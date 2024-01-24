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
  fetch("/api/list", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.length === 0) {
        $("#noMoreEvents").removeClass("hide");
        $("#content").html(
          '<div id="noMoreEvents" class="noMoreEvents">' +
            "   <p><b>No hay eventos cargados en el servidor, vuelve más tarde para ver si ya hay alguna actividad que te divierta, que te llame la atención o que sirva para desarrollar tus cualidades!</b></p>" +
            "</div>"
        );
        setTimeout(() => {
          location.reload();
        }, 15 * 60 * 1000);
      } else {
        const eventosDeLaSemana = filtrarEventosDeLaSemana(data);
        if (eventosDeLaSemana.length > 0) {
          if (eventosDeLaSemana.length === 1) {
            mostrarEvento(eventosDeLaSemana[0]);
            setTimeout(() => {
              location.reload();
            }, 15 * 60 * 1000);
          } else {
            let currentIndex = 1;
            let loopCount = 0;
            const maxLoops = 5;
            console.log(eventosDeLaSemana);

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
            }, 15000);
            mostrarEvento(eventosDeLaSemana[0]);
          }
        }
      }
    })
    .catch((error) => console.error("Error al obtener datos de la API", error));
});

function filtrarEventosDeLaSemana(eventos) {
  const ahora = new Date();
  const diaSemana = ahora.getDay();

  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const inicioSemana = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - diasHastaLunes
  );

  const finSemana = new Date(ahora.getFullYear(), ahora.getMonth(), inicioSemana.getDate() + 6);

  const retrasoEliminarEventos = 60 * 60 * 1000; // 1 hora en milisegundos

  const eventosSemanaActual = eventos
    .filter((evento) => {
      const fechaEvento = new Date(evento.event_date);
      const tiempoActualConRetraso = ahora.getTime() - retrasoEliminarEventos;
      return fechaEvento >= inicioSemana && fechaEvento <= finSemana && fechaEvento > tiempoActualConRetraso;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.event_date);
      const fechaB = new Date(b.event_date);
      return fechaA - fechaB;
    });

  if (eventosSemanaActual.length === 0) {
    const inicioProximaSemana = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() + (8 - diaSemana)
    );

    const finProximaSemana = new Date(
      inicioProximaSemana.getFullYear(),
      inicioProximaSemana.getMonth(),
      inicioProximaSemana.getDate() + 6
    );

    const eventosProximaSemana = eventos
      .filter((evento) => {
        const fechaEvento = new Date(evento.event_date);
        return fechaEvento >= inicioProximaSemana && fechaEvento <= finProximaSemana;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.event_date);
        const fechaB = new Date(b.event_date);
        return fechaA - fechaB;
      });

    return eventosProximaSemana;
  }

  return eventosSemanaActual;
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

  const eventInfoElement = document.querySelector(".event-info");
  eventInfoElement.classList.add("hide");
  document.getElementById("qrcode").classList.add("hide");
  document.querySelector(".poster").classList.add("hide");

  setTimeout(function () {
    document.getElementById("qrcode").innerHTML = "";
    document.getElementById("qrcode").classList.add("hide");
    document.getElementById("poster").src = evento.thumb_url;
    document.getElementById("eventday").innerText = obtenerDia(evento.event_date);
    document.getElementById("eventdate").innerText = formatoFecha(evento.event_date);
    updateEventTime(evento.event_date);
    document.getElementById("description-text").innerHTML = evento.desc;
    document.getElementById("event-title").innerHTML = evento.title;
    document.getElementById("eventCategory").innerText = evento.type;
    var qrcode = new QRCode(document.getElementById("qrcode"), {
      text: evento.qr_url,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    document.getElementById("qrcode").classList.remove("hide");
    eventInfoElement.classList.remove("hide");
    document.querySelector(".subtitle").classList.remove("hide");
    document.querySelector(".poster").classList.remove("hide");
  }, 500);
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
