# LiberTeis

Una pequeña web que permite la gestión de eventos de la biblioteca del IES de Teis.

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

3- Asegúrate de tener Node.js V18 instalada en tu equipo

4- Instala las dependencias

```bash
  npm i
```

## Despliegue

Para desplegar el proyecto ejecuta el siguiente comando

```bash
  node index.js
```

## Autor

- [@AlexDeveloperUwU](https://www.github.com/AlexDeveloperUwU)