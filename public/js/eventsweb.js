function updateCurrentTime() {
  const currentTimeElement = document.getElementById("current-time");
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0"); // Agregar cero al inicio si es necesario
  currentTimeElement.textContent = `${hours}:${minutes}`;
}

// Update current time every minute
setInterval(updateCurrentTime, 1);

// Initial update
updateCurrentTime();

function dividirTexto() {
  var parrafo = document.getElementById("description-text");
  var texto = parrafo.textContent;
  var palabras = texto.split(" ");
  var lineas = [];

  for (var i = 0; i < palabras.length; i += 5) {
    var linea = palabras.slice(i, i + 5).join(" ");
    lineas.push(linea);
  }

  parrafo.innerHTML = lineas.join("<br>");
}
window.onload = dividirTexto;
