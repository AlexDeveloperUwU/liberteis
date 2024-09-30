# LiberTeis‎ ‎ ‎ ‎ ‎‎‎[![wakatime](https://wakatime.com/badge/github/AlexDeveloperUwU/liberteis.svg)](https://wakatime.com/badge/github/AlexDeveloperUwU/liberteis)

Una pequeña aplicación web que permite la gestión de eventos de la biblioteca del IES de Teis.

[Puedes consultar el historial de cambios aquí](./docs/changelog.md)

[Puedes consultar las tareas a futuro aquí](./docs/tasks.md)

## Características

- Gestión de eventos mediante un calendario
- Visualización de los eventos a través de un calendario o de una tabla que los lista todos
- Apartado específico para las pantallas (por ejemplo, una RPi o similares) donde se muestran los eventos de la semana y un QR para que las personas puedan obtener toda la información del evento que deseen
- Página web generada automáticamente con todos los detalles de un evento en concreto
- Autenticación de usuarios local y cifrada

## Noticia sobre el versionado semántico

He notado que, sin darme cuenta, apliqué incorrectamente la semántica de versionado (SemVer) en la versión 0.13.x. Como se puede ver en el changelog, varios cambios que deberían haberse clasificado como versiones menores se registraron erróneamente como parches.

Para corregir esto, después de introducir la nueva interfaz pública en las versiones v0.13.22 y v0.13.23, he decidido actualizar la versión a 0.14.0. En esta nueva versión, se implementa un nuevo manejador de imágenes que optimiza su procesamiento.

## Objetivos logrados

A pesar de que este proyecto fue una especie de reto / encargo por parte de una profesora, me he propuesto una serie de objetivos que voy cumpliendo poco a poco.

Estos son los objetivos que he logrado hasta ahora:

- [✅] Crear un dockerfile desde 0
- [✅] Pasar la aplicación a un container de Docker
- [✅] Conseguir que la app entera, incluyendo los comandos de Docker, tengan uniformidad en cuanto al puerto usado (usa el mismo puerto el host, el container y la app)
- [✅] Aprender a usar Postman y a crear una API completa
- [✅] Utilizar GPG para firmar commits y tags y que aparezca en GitHub
- [✅] Aprender a usar el versionado semántico
- [✅] Aprender a crear y subir tags a GitHub
- [✅] Aprender a usar la API de GitHub para saber cuando hay nuevas actualizaciones
- [✅] Aprender a gestionar contraseñas con encriptado HASH
- [✅] Aprender a limitar el acceso de los distintos dispositivos utilizando los User-Agents
- [✅] Envío de correos electrónicos con Nodemailer
- [✅] Correos electrónicos con plantillas HTML
- [✅] Generar automáticamente builds de mis containers, publicarlos en GitHub y que sean multiarquitectura
- [✅] Generar automáticamente la documentación con VitePress en un único lugar donde tendré la documentación de todos los proyectos que haga
- [✅] Usar HealthChecks en Docker para comprobar que todo funciona correctamente
- [✅] Un script de Linux que puede obtener los datos de un contenedor para replicar la configuración en el nuevo Docker para actualizarlo
- [✅] Uso de sesiones permanentes en Express usando ficheros JSON
- [✅] Uso de validaciones en los formularios para comprobar los datos de entrada
- [✅] Creación de un sistema de traducciones desde 0 con i18n y los JSON
- [✅] Conversión entre tipo de imágenes y optimización de las mismas

## Autor

- [@AlexDeveloperUwU](https://www.github.com/AlexDeveloperUwU)
