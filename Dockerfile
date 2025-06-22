FROM node:22-alpine AS build-client

# Establece el directorio de trabajo para la construcción del cliente
WORKDIR /app/client

# Copia toda la carpeta client
COPY client ./

# Instala dependencias y construye el proyecto
RUN npm install && npm run build

# Etapa final
FROM node:22-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Instala herramientas necesarias y configura la zona horaria
RUN apk add --no-cache tzdata && \
  cp /usr/share/zoneinfo/Europe/Madrid /etc/localtime && \
  echo "Europe/Madrid" > /etc/timezone

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala dependencias, considerando entorno de producción
RUN npm install --production && npm cache clean --force

# Copia el resto del código de la aplicación
COPY . .

# Copia los contenidos de dist a views desde la etapa de construcción
COPY --from=build-client /app/client/dist /app/views

# Copia el archivo de credenciales al contenedor
COPY ./data/secrets/dbcreds.env /app/secrets/dbcreds.env

# Establece la variable de entorno para que dotenv pueda cargarla
ENV DOTENV_CONFIG_PATH=/app/secrets/dbcreds.env

# Establece un valor por defecto para el puerto
ARG PORT=3000
ENV PORT=$PORT

# Expone el puerto
EXPOSE $PORT

# Asegurar permisos para el directorio de logs
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Cambiar al usuario node para evitar problemas de permisos
USER node

# Comando para iniciar la aplicación
CMD ["npm", "run", "prod"]
