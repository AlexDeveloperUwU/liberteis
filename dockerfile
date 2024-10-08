# Usa la imagen base Node.js v18
FROM node:18-alpine

# Establece el directorio de trabajo en /app
WORKDIR /app

# Instala curl y tzdata para la configuración de la zona horaria
RUN apk add --no-cache curl tzdata

# Configura la zona horaria a Europa/Madrid
RUN cp /usr/share/zoneinfo/Europe/Madrid /etc/localtime && \
    echo "Europe/Madrid" > /etc/timezone

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto especificado en el archivo .env o el predeterminado (3000)
ARG PORT
ENV PORT $PORT
EXPOSE $PORT

# Comando para iniciar la aplicación
CMD ["npm", "run", "prod"]
