<details>
  <summary><b>0.14.3 - (24/01/2024 - 27/02/2024)</b></summary>

- Auth: migración del sistema de autenticación a un archivo (un módulo externo) para mejor mantenimiento y migradas las rutas para el uso de este nuevo módulo

- Changelog: migración muy lenta y readaptación del changelog para un nuevo sistema que genera automáticamente el changelog de GitHub y el que está integrado en la web (muestra las 2 últimas entradas del changelog de GitHub)

- Frontend: link a la web de gestión de usuarios, apartado de gestión de usuarios, ruta de eliminación de usuarios

- Backend: limpieza de código innecesario

- Sistema de e-mails: implementado un nuevo sistema de correo electrónico para notificar sobre distintos eventos sobre las cuentas y creación de las plantillas HTML que se utilizarán en este nuevo sistema de correos electrónicos

</details>

<details>
  <summary><b>0.14.2 - 24/01/2024</b></summary>

- Changelog: añadido un changelog generado automáticamente para que sea más consistente y fácil de mantener, además de que sea más sencillo de entender para el usuario

- changelogGen.js: script para generar el changelog automáticamente a partir de un JSON que se usará en la siguiente versión para el frontend (así los usuarios que usan la app están pendientes de los cambios que se realizan)

- Auth: fix un console.log que estaba marcado como fallo de seguridad por exponer la contraseña del usuario en consola

</details>


<details>
  <summary><b>0.14.1 - 24/01/2024</b></summary>

- Frontend: mejoras estéticas en la página de inicio de sesión y de registro

- Backend: cambios en las API de autenticación de usuarios

</details>

<details>
  <summary><b>0.14.0 - 23/01/2024</b></summary>

- Frontend: formulario de inicio de sesión y de registro

- Backend: autenticación básica de usuarios

</details>

<details>
  <summary><b>0.13.0 - 22/01/2024</b></summary>

- Frontend: añadir botón de clonar evento, que carga los datos del evento seleccionado para clonar, y los pone en el formulario de creación de evento y luego te permite editar todo menos la miniatura

- Backend: rework del sistema de eliminar los ficheros de póster, evitando que borre la miniatura si hay otra entrada usándola para que sea más sencillo, más seguro y para ahorrar espacio en el servidor (evitando tener que subir la misma cada vez que se crea un evento igual a otro)

</details>

<details>
  <summary><b>0.12.3 - 22/01/2024</b></summary>

- Frontend: añadir clase hide a subtitle para que no se vea nada cuando aún está obteniendo la información de los eventos, fixeados los links del sidebar para que lleven a las páginas correctas, añadir mensaje por si no hay eventos en el servidor

- Backend: rework completo del js que muestra la pantalla de la rpi, para mostrar los eventos de la semana siguiente si no quedan más esta semana, si no hay eventos entonces muestra un mensaje diciendo que no tiene mensajes

</details>

<details>
  <summary><b>0.12.2 - 21/01/2024</b></summary>

- Frontend: se ve la columna de tipo de evento en la lista de eventos, limitado el ancho de la descripción para que no se salga de la pantalla de la rpi

</details>
