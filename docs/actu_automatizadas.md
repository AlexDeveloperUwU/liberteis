# Actualizaciones automatizadas


<aside>
📔 Automatización en general

</aside>

<br>

- La idea sería que haya siempre un script automatizado que ejecutará y mantendrá actualizado el software, permitiendo así que siempre esté con las últimas funciones y características
- Estaría cada hora haciendo una comprobación de cual es la última tag subida a GitHub, ya que a pesar de que el desarrollo se lleva a cabo en la rama main, únicamente se crea una tag cuando la funcionalidad que se quiere añadir o el bug que se quiere corregir está completa, habiendo pasado por un proceso de corrección anteriormente

<br>
<aside>
📔 Automatización de Docker

</aside>

<br>

1- Si `version` es `null`, entonces se obtendría la última versión disponible de la API de GitHub

2- Si `version` no es `null`, entonces se obtendría la última versión disponible de la API de GitHub, se compararía, y aquí los pasos difieren dependiendo de si es distinta a la que está ahora mismo en el servidor a la de GitHub o no

3a- Si version es igual a la que está en el servidor, entonces no se haría nada y esperaría hasta la siguiente comprobación

3b- Si version es distinta, entonces procede a realizar las siguientes cosas:

4- Hace stop del container

5- Elimina el container

6- Elimina la imagen

7- Hace git pull de la última tag

8- Crea la nueva imagen del container

9- Crea el nuevo container con la última versión

<br>

<aside>
📔 Automatización instalación manual

</aside>

1- Si `version` es `null`, entonces se obtendría la última versión disponible de la API de GitHub

2- Si `version` no es `null`, entonces se obtendría la última versión disponible de la API de GitHub, se compararía, y aquí los pasos difieren dependiendo de si es distinta a la que está ahora mismo en el servidor a la de GitHub o no

3a- Si version es igual a la que está en el servidor, entonces no se haría nada y esperaría hasta la siguiente comprobación

3b- Si version es distinta, entonces procede a realizar las siguientes cosas:

4- Mata el screen

5- Hace git pull de la última tag

6- Inicia el screen con la última tag