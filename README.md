# LiberTeis‎ ‎ ‎ ‎ ‎‎‎[![wakatime](https://wakatime.com/badge/github/AlexDeveloperUwU/liberteis.svg)](https://wakatime.com/badge/github/AlexDeveloperUwU/liberteis)

Una pequeña web que permite la gestión de eventos de la biblioteca del IES de Teis.

[Puedes consultar el historial de cambios aquí](./docs/changelog.md)

[Puedes consultar las tareas a futuro aquí](./docs/tasks.md)

## Características

- Gestión de eventos mediante un calendario
- Visualización de los eventos a través de un calendario o de una tabla que los lista todos
- Apartado específico para las pantallas (por ejemplo, una RPi o similares) donde se muestran los eventos de la semana y un QR para que las personas puedan obtener toda la información del evento que deseen
- Página web generada automáticamente con todos los detalles de un evento en concreto
- Autenticación de usuarios local y cifrada

## Variables de entorno

Asegúrate de tener las siguientes variables de entorno en tu archivo .env

`SESSION_SECRET` Una string aleatoria con letras, números y símbolos que se utilizará para proteger las sesiones de usuario con los logins

`DB_SECRET` Una string aleatoria con letras, números y símbolos que se utilizará para encriptar y desencriptar los datos de la base de datos

`APP_URL` La URL de la aplicación, por ejemplo, `http://localhost:3002` (utiliza la URL de la app pública para que funcione correctamente)

## Instalación

Estes son los pasos a realizar:

1- Clona el respositorio de GitHub

```bash
  git clone https://github.com/AlexDeveloperUwU/liberteis
```

2- Entra en la carpeta del respositorio

```bash
  cd liberteis
```

3- Asegúrate de tener Node.js V18 instalado en tu equipo

### Instalación con Docker (recomendada y más sencilla)

4- Construye la imagen de Docker

```bash
  npm run docker:build
```

5- Ejecuta la imagen de Docker (cambia el puerto si es necesario)

```bash
  PORT=3002 npm run docker:run
```

### Instalación manual (con Node.js)

4- Instala las dependencias

```bash
  npm i
```

5- Ejecuta la aplicación

```bash
  npm start
```

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
- [✅] Aprender a limitar el acceso de los distintos dispositivos utilizando los User-Agents

## Autor

- [@AlexDeveloperUwU](https://www.github.com/AlexDeveloperUwU)
