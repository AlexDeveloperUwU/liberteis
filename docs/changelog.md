# Historial de versiones

Aquí encontrarás las distintas versiones con sus cambios, la fecha y datos extras.

<blockquote>
  <p style="font-size: 14px; color: #ff4500; font-weight: bold;">¡Importante! A partir de la versión 0.0.6.4 se realizará una especie de "reestructuramiento" del versionado, debido a que el actual no cumplía con el SemVer, con lo que las versiones de las tag no son correctas.
  </p>
</blockquote>
<blockquote>
  <p style="font-size: 14px; color: #ff4500; font-weight: bold;">Formato de las versiones para el changelog:<br>
  <code>Versión corregida (Versión vieja) - Fecha</code>
</blockquote>


Siempre intento mantener las versiones con el [versionado semántico](https://semver.org/lang/es/), pero cuando son parches tan pequeños, acabo añadiendo una especie de versión nueva, disculpadme por ello.

<details>
  <summary><b>0.7.0 - 15/01/2024 - Version Correction</b></summary>

- Frontend: Añadidos más efectos en la web de la RPi, añadido el fade in y fade out al qr y a la portadilla y un cambio de color smooth del header si es necesario. Añadido el QR del evento en el panel de control. QR generados automáticamente con QRCode.js, editado el texto del formulario de crear evento, que estaba como "Subir miniatura"

- Ficheros: añadido el js de QRCode.js para poder generar los QRs de los eventos

- Backend: además del filtrado de eventos, ahora también hay una organización de eventos por fecha, ya que antes se hacía automáticamente por nombre y por fecha de inserción el la DB, eliminado el qr_url en la función de guardar evento

- Changelog: cambiado al versionado semántico, ya que el anterior no cumplía con el SemVer, cambiadas todas las versiones anteriores para coincidir con el nuevo formato

</details>

<details>
  <summary><b>0.6.4 (0.0.6.4) - 15/01/2024</b></summary>

- Gitignore + Dockerignore: eliminada la carpeta de data, y la carpeta de uploads para evitar problemas al futuro

- Env: añadida la variable de entorno `APP_URL` para poder utilizarla en la ruta de la miniatura

- Env Example: creado el archivo `.env.example` para que se pueda ver qué variables de entorno son necesarias para que la aplicación funcione correctamente

- Readme: añadida la nueva variable de entorno

- Index: editado el secret para que use la variable de entorno

- Postman: eliminada la colección de Postman ya que la API ha sido modificada y necesita alguna actualización. No sé si volveré a subir la colección de Postman, ya que al final la API está pensada para usar con formularios y los datos introducidos de otras formas no se subirán correctamente a la base de datos.

</details>

<details>
  <summary><b>0.6.3 (0.0.6.3) - 14/01/2024</b></summary>

- Frontend: aviso sobre no poder editar miniaturas

- Backend: eliminar la miniatura una vez que se elimina el evento para que no se quede en el servidor ocupando espacio

</details>

<details>
  <summary><b>0.6.2 (0.0.6.2) - 13/01/2024</b></summary>

- Frontend: Formulario para subir miniatura funcionando correctamente, url de la imagen guardada correctamente, eliminada edición de la miniatura

- Backend: ruta para subir miniatura funcionando correctamente

</details>

<details>
  <summary><b>0.6.1 (0.0.6.1) - 12/01/2024</b></summary>

- Frontend: Web de la RPi casi finalizada, falta eliminar el uso de elementos placeholder, fixeado el calendario para que empiece en lunes y no en domingo

</details>

<details>
  <summary><b>0.6.0 (0.0.6) - 12/01/2024</b></summary>

- Frontend: Web de la RPi casi finalizada, le falta animación y no usar elementos placeholder, pero está prácticamente lista

</details>

<details>
  <summary><b>0.5.6 (0.0.5.6) - 11/01/2024</b></summary>

- Backend: cambiado el nombre del archivo de funciones de la base de datos de eventos, para tener mayor claridad en el futuro a la hora de crear la autenticación de usuarios, realizar funciones de generar ID de usuario y de eventos para arreglar un error grave que tenía el código que permitía duplicar IDs de eventos

- "Frontend": subidos los archivos necesarios para posteriormente generar la interfaz de la RPi

- Changelog: mejorar formato para reducir el tamaño del archivo (visualmente) y mejorada la categorización de las distintas versiones

</details>

<details>
  <summary><b>0.5.5 (0.0.5.5) - 09/01/2024</b></summary>

- Docker: añadido un `dockerfile` para poder generar un container con la aplicación (no tengo pensado publicar el container en DockerHub, pero será práctico en el momento en el que se implante en producción)

- Backend: cambiado el puerto para que ya use el del .env

- Package.json: añadido el script `npm run docker:build` para poder generar el container con la aplicación y `docker:run` desplegarlo. Añadido los scripts de versioning.

- Readme: añadido el apartado de instalación con Docker

- Backend: fixeada la ruta de creación de un evento, que no retornaba código 200 cuando todo funcionaba bien

</details>

<details>
  <summary><b>0.5.4 (0.0.5.4) - 08/01/2024</b></summary>

- Postman: exportada la colección de Postman para incluirla en el repositorio (solo tiene las rutas de la API, no las de auth)

- Frontend: añadido el botón de eliminar evento en el modal de visualizar evento, además de un paso intermedio para asegurarse del borrado

- Package.json: añadido el script `npm start` para poder trabajar con auto-reload

</details>

<details>
  <summary><b>0.5.3 (0.0.5.3) - 07/01/2024</b></summary>

- Frontend: ahora, cuando clickas en un evento, tienes la opción de editar el evento

- Backend: añadida la ruta para editar eventos

</details>

<details>
  <summary><b>0.5.2 (0.0.5.2) - 05/01/2024</b></summary>

- Frontend: ahora el calendario además de mostrar el modal con los datos del evento, también muestra un modal con un formulario para añadir un evento cuando pinchas en un día concreto (en el formulario puedes cambiar el día si te has equivocado)

- Estructura de la web: eliminadas todas las webs y formularios creados anteriormente para el testing, poco a poco se está moviendo todo hacia la web final. Además, todo el testing de las apis se está haciendo con POSTMAN, por lo que no es necesario tener una web para ello

- Backend: eliminadas las redirecciones a la página de eventslist, ya que no existe

- Changelog: reordenar el changelog para siempre dejar por encima la última actualización realizada

</details>

<details>
  <summary><b>0.5.1 (0.0.5.1) - 05/01/2024</b></summary>

- Frontend: conteo de eventos funcionando correctamente, calendario muestra ya los eventos correctamente, al clickar en el evento se abre un modal con los datos del evento (añadido también en esta versión)

- Backend: eliminado full_desc ya que al final el planteo será distinto acerca de cómo mirarán los usuarios la info del evento, misma página que ven en la rpi, será a la que acceda el usuario con el qr

</details>

<details>
  <summary><b>0.4.0 (0.0.4) - 04/01/2024</b></summary>

- Backend: añadir rutas a través de un ruter y organización de las rutas por categoría, siendo la primera parte de la url la categoría (api, auth, etc) y la segunda parte la ruta en sí

- Databases: fixear una ruta que usaba una database que no existía

- Frontend: fixear errores de rutas luego del cambio en los distintos formularios

- Postman: creadas las distintas requests necesarias para poder probar el backend, la api y las distintas rutas

</details>

<details>
  <summary><b>0.3.0 (0.0.3) - 24/12/2023</b></summary>

- Backend: hacer que las rutas que añadan automáticamente (con propósitos de testing, luego se eliminará ya que cada ruta tiene unos requisitos distintos)

- DB: eliminar db larga, conservar una sola db y añadir los campos que faltan a la única que existirá sobre las entradas

</details>

<details>
  <summary><b>0.2.2 (0.0.2.2 )- 24/12/2023</b></summary>

- Frontend: añadir formulario para comprobar eventos

</details>

<details>
  <summary><b>0.2.1 (0.0.2.1) - 23/12/2023</b></summary>

- Añadir archivo de changelog

- Añadir archivo de tareas relacionado con las distintas futuras versiones

</details>

<details>
  <summary><b>0.2.0 (0.0.2) - 22/12/2023</b></summary>

- Frontend: eliminar y comprobar existencia de eventos

- Backend: eliminar y comprobar eventos

</details>

<details>
  <summary><b>0.1.0 (0.0.1) - 22/12/2023 - Initial Release</b></summary>

- Commit inicial, añadido backend y un frontend para hacer pruebas

- Frontend: añadir y visualizar eventos

- Backend: añadir, visualizar eventos, gestionar frontend y realizar operaciones en la db

</details>
