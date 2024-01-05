# Historial de versiones

Este es el historial de versiones de este proyecto.
Aquí encontrarás las distintas versiones con sus cambios, la fecha y datos extras

## 0.0.1 - 22/12/2023

=> Commit inicial, añadido backend y un frontend para hacer pruebas

=> Frontend: añadir y visualizar eventos

=> Backend: añadir, visualizar eventos, gestionar frontend y realizar operaciones en la db

## 0.0.2 - 22/12/2023

=> Frontend: eliminar y comprobar existencia de eventos

=> Backend: eliminar y comprobar eventos

## 0.0.2.1 - 23/12/2023

=> Añadir archivo de changelog

=> Añadir archivo de tareas relacionado con las distintas futuras versiones

## 0.0.2.2 - 24/12/2023

=> Frontend: añadir formulario para comprobar eventos

## 0.0.3 - 24/12/2023

=> Backend: hacer que las rutas que añadan automáticamente (con propósitos de testing, luego se eliminará ya que cada ruta tiene unos requisitos distintos)

=> DB: eliminar db larga, conservar una sola db y añadir los campos que faltan a la única que existirá sobre las entradas

## 0.0.4 - 04/01/2024

=> Backend: añadir rutas a través de un ruter y organización de las rutas por categoría, siendo la primera parte de la url la categoría (api, auth, etc) y la segunda parte la ruta en sí

=> Databases: fixear una ruta que usaba una database que no existía

=> Frontend: fixear errores de rutas luego de el cambio en los distintos formularios

=> Postman: creadas las distintas requests necesarias para poder probar el backend, la api y las distintas rutas

## 0.0.5.1 - 05/01/2024

=> Frontend: conteo de eventos funcionando correctamente, calendario muestra ya los eventos correctamente, al clickar en el evento se abre un modal con los datos del evento (añadido también en esta versión)

=> Backend: eliminado full_desc ya que al final el planteo será distinto acerca de como mirarán los usuarios la info del evento, misma página que ven en la rpi, será a la que acceda el usuario con el qr