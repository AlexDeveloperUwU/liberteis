# LiberTeis‎ ‎ ‎ ‎ ‎‎‎[![wakatime](https://wakatime.com/badge/github/AlexDeveloperUwU/liberteis.svg)](https://wakatime.com/badge/github/AlexDeveloperUwU/liberteis)

Una pequeña aplicación web que permite la gestión de eventos de la biblioteca del IES de Teis.

> [!IMPORTANTE] V1 EN DESARROLLO.
> Actualmente, se está trabajando en una nueva base de datos en la rama `dbRedesign`, lo que también implica cambios en el backend y el frontend, ya que las APIs, los datos a almacenar y otros aspectos adicionales están siendo modificados. Por favor, ten en cuenta que la rama `main` no está actualizada y que la rama `dbRedesign` contiene los cambios más recientes. <br> Además, esta versión rompe completamente la compatibilidad con la base de datos de la última versión disponible, por lo que se recomienda exportar todos los datos antes de actualizar. Al instalar la nueva versión, se creará una base de datos nueva sin opción de migración.

[Puedes consultar el historial de cambios aquí](./docs/changelog.md)

## Características

- Gestión de eventos mediante un calendario
- Visualización de los eventos a través de un calendario o de una tabla que los lista todos
- Apartado específico para las pantallas (por ejemplo, una RPi o similares) donde se muestran los eventos de la semana y un QR para que las personas puedan obtener toda la información del evento que deseen
- Página web generada automáticamente con todos los detalles de un evento en concreto
- Autenticación de usuarios local y cifrada

## Noticia sobre el versionado semántico

He notado que, sin darme cuenta, apliqué incorrectamente la semántica de versionado (SemVer) en la versión 0.13.x. Como se puede ver en el changelog, varios cambios que deberían haberse clasificado como versiones menores se registraron erróneamente como parches.

Para corregir esto, después de introducir la nueva interfaz pública en las versiones v0.13.22 y v0.13.23, he decidido actualizar la versión a 0.14.0. En esta nueva versión, se implementa un nuevo manejador de imágenes que optimiza su procesamiento.

## Objetivos cumplidos

A pesar de que este proyecto fue una especie de reto / encargo por parte de una profesora, me he propuesto una serie de objetivos que voy cumpliendo poco a poco.

### Objetivos relacionados con Docker:

[✔️] Crear un Dockerfile desde 0.  
[✔️] Pasar la aplicación a un container de Docker.  
[✔️] Conseguir uniformidad en el uso del puerto en el host, el container y la app.  
[✔️] Generar automáticamente builds de mis containers, publicarlos en GitHub y que sean multiarquitectura.  
[✔️] Usar HealthChecks en Docker para comprobar que todo funciona correctamente.  
[✔️] Crear un script en Linux para replicar la configuración de un contenedor en un nuevo Docker para actualizarlo.

### Objetivos relacionados con Git y GitHub:

[✔️] Utilizar GPG para firmar commits y tags, y que aparezca en GitHub.  
[✔️] Aprender a usar el versionado semántico.  
[✔️] Crear y subir tags a GitHub.  
[✔️] Usar la API de GitHub para comprobar actualizaciones.  
[✔️] Generar fixes de problemas de CodeQL automáticamente con GitHub Copilot.  
[✔️] Utilizar revisiones automáticas de código con CodeQL.

### Objetivos relacionados con APIs y herramientas:

[✔️] Aprender a usar Postman y crear una API completa.  
[✔️] Usar Nodemailer para el envío de correos electrónicos.  
[✔️] Enviar correos electrónicos con plantillas HTML.  
[✔️] Aprender a gestionar contraseñas usando encriptado HASH.  
[✔️] Limitar el acceso a dispositivos mediante User-Agents.

### Objetivos relacionados con desarrollo web y aplicaciones:

[✔️] Uso de sesiones permanentes en Express con archivos JSON.  
[✔️] Validación de formularios para comprobar los datos de entrada.  
[✔️] Creación de un sistema de traducciones desde 0 con i18n y JSON.  
[✔️] Conversión y optimización de tipos de imágenes.

## Tiempo invertido en desarrollo

Primer año de desarrollo: 22/12/2023 - 10/09/2024 => Aproximadamente 120h acomuladas en desarrollo  
Segundo año de desarrollo: 11/09/2024 - Actualidad

## Stats del repo

![Alt](https://repobeats.axiom.co/api/embed/31271bb411db22e430e939d345535195abc7ede4.svg "Repobeats analytics image")

## Autor

- [@AlexDeveloperUwU](https://www.github.com/AlexDeveloperUwU)
