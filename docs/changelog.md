# Historial de versiones

Aquí encontrarás las distintas versiones con sus cambios, la fecha y datos extras.

Siempre intento mantener las versiones con el [versionado semántico](https://semver.org/lang/es/), pero cuando son parches tan pequeños, acabo añadiendo una especie de versión nueva, disculpadme por ello.

## 0.0.5.5 - 09/01/2024

=> Docker: añadido un `dockerfile` para poder generar un container con la aplicación (no tengo pensado publicar el container en DockerHub, pero será práctico en el momento en el que se implante en producción)

=> Backend: cambiado el puerto para que ya use el del .env

=> Package.json: añadido el script `npm run docker:build` para poder generar el container con la aplicación y `docker:run` desplegarlo. Añadido los scripts de versioning.

=> Readme: añadido el apartado de instalación con Docker

=> Backend: fixeada la ruta de creación de un evento, que no retornaba código 200 cuando todo funcionaba bien

## 0.0.5.4 - 08/01/2024

=> Postman: exportada la colección de Postman para incluírla en el repositorio (solo tiene las rutas de la API, no las de auth)

=> Frontend: añadido el botón de eliminar evento en el modal de visualizar evento, además de un paso intermedio para asegurarse del borrado

=> Package.json: añadido el script `npm start` para poder trabajar con auto-reload

## 0.0.5.3 - 07/01/2024

=> Frontend: ahora, cuando clickas en un evento, tienes la opción de editar el evento

=> Backend: añadida la ruta para editar eventos

## 0.0.5.2 - 05/01/2024

=> Frontend: ahora el calendario además de mostrar el modal con los datos del evento, también muestra un modal con un formulario para añadir un evento cuando pinchas en un día concreto (en el formulario puedes cambiar el día si te has equivocado)

=> Estructura de la web: eliminadas todas las webs y formularios creados anteriormente para el testing, poco a poco se está moviendo todo hacia la web final. Además, todo el testing de las apis se está haciendo con POSTMAN, por lo que no es necesario tener una web para ello

=> Backend: eliminadas las redirecciones a la página de eventslist, ya que no existe

=> Changelog: reordenar el changelog para siempre dejar por encima la última actualización realizada

## 0.0.5.1 - 05/01/2024

=> Frontend: conteo de eventos funcionando correctamente, calendario muestra ya los eventos correctamente, al clickar en el evento se abre un modal con los datos del evento (añadido también en esta versión)

=> Backend: eliminado full_desc ya que al final el planteo será distinto acerca de como mirarán los usuarios la info del evento, misma página que ven en la rpi, será a la que acceda el usuario con el qr

## 0.0.4 - 04/01/2024

=> Backend: añadir rutas a través de un ruter y organización de las rutas por categoría, siendo la primera parte de la url la categoría (api, auth, etc) y la segunda parte la ruta en sí

=> Databases: fixear una ruta que usaba una database que no existía

=> Frontend: fixear errores de rutas luego de el cambio en los distintos formularios

=> Postman: creadas las distintas requests necesarias para poder probar el backend, la api y las distintas rutas

## 0.0.3 - 24/12/2023

=> Backend: hacer que las rutas que añadan automáticamente (con propósitos de testing, luego se eliminará ya que cada ruta tiene unos requisitos distintos)

=> DB: eliminar db larga, conservar una sola db y añadir los campos que faltan a la única que existirá sobre las entradas

## 0.0.2.2 - 24/12/2023

=> Frontend: añadir formulario para comprobar eventos

## 0.0.2.1 - 23/12/2023

=> Añadir archivo de changelog

=> Añadir archivo de tareas relacionado con las distintas futuras versiones

## 0.0.2 - 22/12/2023

=> Frontend: eliminar y comprobar existencia de eventos

=> Backend: eliminar y comprobar eventos

## 0.0.1 - 22/12/2023

=> Commit inicial, añadido backend y un frontend para hacer pruebas

=> Frontend: añadir y visualizar eventos

=> Backend: añadir, visualizar eventos, gestionar frontend y realizar operaciones en la db
