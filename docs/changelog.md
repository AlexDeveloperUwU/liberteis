# Historial de versiones

Aquí encontrarás las distintas versiones con sus cambios, la fecha y datos extras.

<details>
  <summary><b>0.13.21 - 31/08/2024</b></summary>

- <span style="color: green;">Añadido:</span> Docker VNC para poder utilizar las RPi como Thin Clients, para si llega a ser necesario en el futuro.

- <span style="color: yellow;">Arreglado:</span> Optimizaciones en la pantalla de la RPi para menor consumo de RAM y CPU para los dispositivos SBC.

</details>

<details>
  <summary><b>0.13.20 - 11/09/2024</b></summary>

- <span style="color: green;">Añadido:</span> Verificación del aspect ratio de las imágenes que se suben.

</details>

<details>
  <summary><b>0.13.19 - 31/08/2024</b></summary>

- <span style="color: yellow;">Arreglado:</span> Optimizaciones en el Dockerfile.

</details>

<details>
  <summary><b>0.13.18 - 31/08/2024</b></summary>

- <span style="color: green;">Añadido:</span> Toasts de aviso para las operaciones en las páginas de autenticación y en las páginas de la Dashboard para que el usuario sepa como salió la operación solicitada.

- <span style="color: green;">Añadido:</span> Sistema de sesiones persistentes durane 24h almacenadas en ficheros JSON para evitar pérdidas de sesión cuando el servidor se reinicia.

</details>

<details>
  <summary><b>0.13.17 - 27/08/2024</b></summary>

- <span style="color: yellow;">Arreglado:</span> La web se podía abrir desde cualquier dispositivo, ahora solo se puede desde PC.

</details>

<details>
  <summary><b>0.13.16 - 27/08/2024</b></summary>

- <span style="color: green;">Añadido:</span> Sistemas de validación de los formularios.

- <span style="color: green;">Añadido:</span> Sistema multilenguaje de los correos electrónicos que depende del user que los emita (registro o eliminación de cuenta de la persona administradora que los emite y cambio de contraseña además de reset de contraseña por parte del usuario).

- <span style="color: yellow;">Arreglado:</span> Fixes de todo tipo.

</details>

<details>
  <summary><b>0.13.12 => 0.13.15 - 21/08/2024</b></summary>

- <span style="color: green;">Añadido:</span> Botón para mostrar la contraseña en los formularios de auth.

- <span style="color: yellow;">Arreglado:</span> Fixes de todo tipo.

- <span style="color: yellow;">Arreglado:</span> Documentación actualizada para instalación y actualización.

- <span style="color: red;">Eliminado:</span> Eliminado el script de mantenimiento de la db, ya que ya está fixeada la db y no es necesario en nuevas instalaciones.

</details>

<details>
  <summary><b>0.13.12 - 21/08/2024</b></summary>

- <span style="color: green;">Añadido:</span> Botón de logout.

- <span style="color: green;">Añadido:</span> Traducciones del logout.

- <span style="color: green;">Añadido:</span> Script de mantenimiento de la db.

</details>

<details>
  <summary><b>0.13.11 - 02/08/2024 => 20/08/2024</b></summary>

- <span style="color: green;">Añadido:</span> Traducción completa de la dashboard en los 3 idiomas disponibles.

- <span style="color: green;">Añadido:</span> Posbilidad de utilizar password managers con el login.

- <span style="color: green;">Añadido:</span> Sección de ajustes de usuario para cambiar idioma y cerrar sesión.

- <span style="color: yellow;">Arreglado:</span> Traducciones en las páginas de errores.

- <span style="color: yellow;">Arreglado:</span> La dash únicamente será usable desde PC por cuestiones técnicas.

</details>

<details>
  <summary><b>0.13.10 - 01/05/2024 => 02/05/2024</b></summary>

- <span style="color: green;">Añadido:</span> Posibilidad de utilizar la tecla enter en los formularios relacionados con la autenticación.

- <span style="color: green;">Añadido:</span> Script para descargar el manager, darle permisos y ejecutarlo.

- <span style="color: yellow;">Arreglado:</span> Cambiados los mensajes de las páginas de errores.

- <span style="color: yellow;">Arreglado:</span> Actualización de las dependencias.

- <span style="color: red;">Eliminado:</span> Sistema de changelog en la dashboard (no aporta lo suficiente para tener justificación de ser).

- <span style="color: red;">Eliminado:</span> Script para eliminar tags de GitHub.

</details>

<details>
  <summary><b>0.13.7 => 0.13.9 - 17/04/2024</b></summary>

- <span style="color: yellow;">Arreglado:</span> Fix login con las anteriores credenciales.

</details>

<details>
  <summary><b>0.13.0 => 0.13.6 - 23/01/24 => 24/03/2024</b></summary>

- <span style="color: green;">Añadido:</span> Check mínimo de descripción 100 caracteres.

- <span style="color: green;">Añadido:</span> Generación automática del Docker Container.

- <span style="color: green;">Añadido:</span> Apartado de gestión de usuarios y ruta de eliminación de usuarios.

- <span style="color: green;">Añadido:</span> Sistema de correos electrónicos para distintos aspectos.

- <span style="color: green;">Añadido:</span> Formulario de inicio de sesión y de registro.

- <span style="color: green;">Añadido:</span> Traducción al español del calendario de eventos.

- <span style="color: green;">Añadido:</span> Créditos en el footer de la dashboard.

- <span style="color: yellow;">Arreglado:</span> Vulnerabilidad generada por un console.log.

- <span style="color: yellow;">Arreglado:</span> Limpieza de código innecesario.

- <span style="color: yellow;">Arreglado:</span> Mejoras estéticas en los formularios de inicio de sesión y de registro.

- <span style="color: yellow;">Arreglado:</span> Añadido un healthcheck para comprobar si el contenedor se está ejecutando correctamente.

</details>

<details>
  <summary><b>0.12.3 - 22/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Mensaje de que no hay eventos por si no hay eventos en la db.

- <span style="color: yellow;">Arreglado:</span> Links de la barra lateral, ahora llevan a los apartados correspondientes.

- <span style="color: yellow;">Arreglado:</span> Solo se muestran los eventos de la semana y si ya no quedan muestra que ya no quedan.

</details>

<details>
  <summary><b>0.12.3 - 22/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Mensaje de que no hay eventos por si no hay eventos en la db.

- <span style="color: yellow;">Arreglado:</span> Links de la barra lateral, ahora llevan a los apartados correspondientes.

- <span style="color: yellow;">Arreglado:</span> Solo se muestran los eventos de la semana y si ya no quedan muestra que ya no quedan.

</details>

<details>
  <summary><b>0.12.2 - 21/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Columna tipo de evento en la lista de eventos.

- <span style="color: yellow;">Arreglado:</span> Limitado el ancho de la descripción en la pantalla de la RPi.

</details>

<details>
  <summary><b>0.12.1 - 21/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Selección del tipo de evento que es al crearlo y editarlo en todas las páginas.

</details>

<details>
  <summary><b>0.12.0 - 20/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Selección del tipo de evento que es al crearlo y editarlo en la página del calendario.

</details>

<details>
  <summary><b>0.11.1 - 20/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Análisis automático del código para escanear vulnerabilidades.

- <span style="color: green;">Añadido:</span> Documentación para instalar y actualizar el software.

- <span style="color: yellow;">Arreglado:</span> Link de aviso de nueva versión, arreglada la documentación del repositorio.

</details>

<details>
  <summary><b>0.11.0 - 19/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Persistencia de los datos cuando se actualiza la aplicación.

- <span style="color: green;">Añadido:</span> Script `npm run docker:remove` para parar la aplicación y eliminar la imagen.

- <span style="color: yellow;">Arreglado:</span> Ahora la aplicación pesa 3 veces menos.

</details>

<details>
  <summary><b>0.10.1 - 18/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Si no seleccionas eventos múltiples y le das a borrar selección, aparece mensaje de error.

</details>

<details>
  <summary><b>0.10.0 - 18/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Funcionalidad de eliminar eventos desde la tabla de eventos, de forma individual o masiva.

</details>

<details>
  <summary><b>0.9.1 - 18/01/2024</b></summary>

- <span style="color: yellow;">Arreglado:</span> Funcionalidad de comprobar si existe una nueva versión, antes no comparaba correctamente.

</details>

<details>
  <summary><b>0.9.0 - 18/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Alerta por si hay una nueva versión del software.

</details>

<details>
  <summary><b>0.8.1 - 18/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Vista para error 404.

</details>

<details>
  <summary><b>0.8.0 - 17/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Listado de eventos en una tabla con opciones de imprimirla o generar excel / pdf.

</details>

<details>
  <summary><b>0.7.4 - 16/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Limitaciones en la cantidad de caracteres del título.

- <span style="color: green;">Añadido:</span> Vistas para los distintos errores del servidor.

</details>

<details>
  <summary><b>0.7.3 - 16/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Limitaciones de acceso a las páginas web públicas.

- <span style="color: red;">Eliminado:</span> Archivos de assets que no se usan.

</details>

<details>
  <summary><b>0.7.2 - 15/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Archivos de rutas separadas para cada tipo de rutas.

- <span style="color: green;">Añadido:</span> Archivos de log para las peticiones del servidor.

</details>

<details>
  <summary><b>0.7.1 - 15/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Registro de las peticiones que se le hacen al servidor.

</details>

<details>
  <summary><b>0.7.0 - 15/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Efectos visuales en la vista de la RPi.

- <span style="color: yellow;">Arreglado:</span> El changelog ahora tiene un nuevo formato y una nueva versión.

- <span style="color: red;">Eliminado:</span> Carpetas de data y de uploads para evitar problemas en el repositorio.

</details>

<details>
  <summary><b>0.6.4 - 15/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Ejemplo de .env para configurar la app correctamente.

- <span style="color: green;">Añadido:</span> Variable de entorno `APP_URL`.

- <span style="color: red;">Eliminado:</span> Carpetas de data y de uploads para evitar problemas en el repositorio.

</details>

<details>
  <summary><b>0.6.3 - 14/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Cuando eliminas un evento, ahora también se elimina la miniatura.

</details>

<details>
  <summary><b>0.6.2 - 13/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Formulario para subir miniaturas en los eventos.

</details>

<details>
  <summary><b>0.6.1 - 12/01/2024</b></summary>

- <span style="color: yellow;">Arreglado:</span> Calendario ahora empieza en Lunes.

</details>

<details>
  <summary><b>0.6.0 - 12/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Frontend para las pantallas de la biblioteca.

</details>

<details>
  <summary><b>0.5.6 - 11/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Fichero con las funciones de la base de datos de eventos.

- <span style="color: yellow;">Arreglado:</span> Los eventos ya no se pueden duplicar por su ID.

</details>

<details>
  <summary><b>0.5.5 - 09/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Fichero de Docker para generar containers de la app.

- <span style="color: green;">Añadido:</span> Script `npm run docker:build` para poder generar el container con la aplicación y `docker:run` desplegarlo. Añadido los scripts de versioning.

</details>

<details>
  <summary><b>0.5.4 - 08/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Botón de eliminar evento con modal de confirmación.

- <span style="color: green;">Añadido:</span> Script de inicio en package.json.

</details>

<details>
  <summary><b>0.5.3 - 07/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Formulario para editar evento cuando pulsas en él.

</details>

<details>
  <summary><b>0.5.2 - 05/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Formulario para añadir evento cuando pulsas una fecha en el calendario.

- <span style="color: yellow;">Arreglado:</span> Changelog ordenado para siempre tener la última actualización por encima.

- <span style="color: yellow;">Arreglado:</span> Links rotos en la barra de navegación.

</details>

<details>
  <summary><b>0.5.0 + 0.5.1 - 05/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Calendario funcionando y con información del evento si le pulsas click en él.

- <span style="color: yellow;">Arreglado:</span> Conteo de eventos.

- <span style="color: red;">Eliminado:</span> Campo full_desc de la base de datos.

</details>

<details>
  <summary><b>0.4.0 - 04/01/2024</b></summary>

- <span style="color: green;">Añadido:</span> Rutas a través del ruter de express.

- <span style="color: yellow;">Arreglado:</span> Una ruta usaba una DB no existente.

- <span style="color: yellow;">Arreglado:</span> Formulario apuntando a las nuevas rutas.

</details>

<details>
  <summary><b>0.3.0 - 24/12/2023</b></summary>

- <span style="color: green;">Añadido:</span> Rutas automatizadas para testing.

- <span style="color: red;">Eliminado:</span> Varias bases de datos para tener una única.

</details>

<details>
  <summary><b>0.2.2 - 24/12/2023</b></summary>

- <span style="color: green;">Añadido:</span> Formulario para comprobar la existencia de un evento.

</details>

<details>
  <summary><b>0.2.1 - 23/12/2023</b></summary>

- <span style="color: green;">Añadido:</span> Archivo de changelog.

- <span style="color: green;">Añadido:</span> Archivo con tareas futuras.

</details>

<details>
  <summary><b>0.2.0 - 22/12/2023</b></summary>

- <span style="color: green;">Añadido:</span> Eliminar y comprobar eventos.

</details>

<details>
  <summary><b>0.1.0 - 22/12/2023</b></summary>

- <span style="color: green;">Añadido:</span> Código base.

</details>
