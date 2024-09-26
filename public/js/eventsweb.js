document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/list", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        mostrarMensajeNoEventos();
      } else {
        const eventosDeLaSemana = filtrarEventosDeLaSemana(data);
        if (eventosDeLaSemana.length > 0) {
          manejarEventos(eventosDeLaSemana);
        }
      }
    })
    .catch((error) => console.error("Error al obtener datos de la API", error));

  actualizarFechaYDia();
  setInterval(actualizarFechaYDia, 60 * 1000);
});

function actualizarFechaYDia() {
  const ahora = new Date();
  document.getElementById("day").innerText = obtenerDia(ahora);
  document.getElementById("date").innerText = formatoFecha(ahora);
  actualizarHora();
}

function actualizarHora() {
  const ahora = new Date();
  document.getElementById("current-time").textContent = obtenerHoraActual(ahora);
}

function obtenerHoraActual(fecha) {
  return fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function manejarEventos(eventos) {
  if (eventos.length === 1) {
    mostrarEvento(eventos[0]);
    setTimeout(() => location.reload(), 10 * 60 * 1000);
  } else {
    let currentIndex = 0;
    let loopCount = 0;
    const maxLoops = 5;

    mostrarEvento(eventos[0]);
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % eventos.length;
      mostrarEvento(eventos[currentIndex]);
      if (currentIndex === 0 && ++loopCount >= maxLoops) {
        clearInterval(intervalId);
        location.reload();
      }
    }, 15000);
  }
}

function mostrarEvento(evento) {
  const headerElement = document.querySelector(".header");
  const ahora = new Date();
  const fechaEvento = new Date(evento.event_date);

  headerElement.classList.toggle("header-onair", esHoy(fechaEvento, ahora));

  document.querySelector(".poster").classList.add("hide");
  document.querySelector(".event-info").classList.add("hide");

  setTimeout(() => {
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
      text: evento.qr_url,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    document.getElementById("poster").src = evento.thumb_url;
    document.getElementById("eventday").innerText = obtenerDia(evento.event_date);
    document.getElementById("eventdate").innerText = formatoFecha(evento.event_date);
    document.getElementById("event-time").innerText = obtenerHoraActual(
      new Date(evento.event_date)
    );
    document.getElementById("description-text").innerHTML = evento.desc;
    document.getElementById("event-title").innerHTML = evento.title;

    const eventCategoryElement = document.getElementById("eventCategory");
    if (evento.type) {
      document.getElementById("categoryText").classList.remove("hide");
      eventCategoryElement.innerText = evento.type;
    } else {
      document.getElementById("categoryText").classList.add("hide");
    }

    document.querySelector(".poster").classList.remove("hide");
    document.querySelector(".event-info").classList.remove("hide");
  }, 500);
}

function mostrarMensajeNoEventos() {
  $("#noMoreEvents").removeClass("hide");
  $("#content").html(
    '<div id="noMoreEvents" class="noMoreEvents">' +
      "<p><b>No hay eventos cargados en el servidor. Vuelve más tarde.</b></p>" +
      "</div>"
  );
  setTimeout(() => location.reload(), 10 * 60 * 1000);
}

function esHoy(fecha, ahora) {
  return (
    fecha.getDate() === ahora.getDate() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getFullYear() === ahora.getFullYear()
  );
}

function filtrarEventosDeLaSemana(eventos) {
  const ahora = new Date();
  const inicioSemana = obtenerInicioSemana(ahora);
  const finSemana = new Date(inicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000);

  return eventos
    .filter((evento) => {
      const fechaEvento = new Date(evento.event_date);
      return fechaEvento >= inicioSemana && fechaEvento <= finSemana;
    })
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
}

function obtenerInicioSemana(fecha) {
  const diaSemana = fecha.getDay();
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - diasHastaLunes);
}

function obtenerDia(fecha) {
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return diasSemana[new Date(fecha).getDay()];
}

function formatoFecha(fecha) {
  const fechaObj = new Date(fecha);
  const dia = fechaObj.getDate().toString().padStart(2, "0");
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
  const año = fechaObj.getFullYear();
  return `${dia}/${mes}/${año}`;
}
