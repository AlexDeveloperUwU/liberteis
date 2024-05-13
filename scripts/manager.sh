#!/bin/bash

# Función para imprimir la cabecera ASCII
print_header() {
    clear
    echo -e "\n\033[1m\033[92m"
    echo "  _      _ _            _______   _     "
    echo " | |    (_) |          |__   __| (_)    "
    echo " | |     _| |__   ___ _ __| | ___ _ ___ "
    echo " | |    | | '_ \ / _ \ '__| |/ _ \ / __|"
    echo " | |____| | |_) |  __/ |  | |  __/ \__ \\"
    echo " |______|_|_.__/ \___|_|  |_|\___|_|___/"
    echo -e "\033[0m"
}

# Verificar si Docker está instalado
if ! command -v docker &>/dev/null; then
    echo "Error: Docker no está instalado. Por favor, instala Docker y vuelve a intentarlo."
    exit 1
fi

# Función para instalar la aplicación
install() {
    # Solicitar al usuario el puerto de la aplicación
    read -p "Por favor, introduce el puerto de la aplicación: " port

    # Solicitar al usuario la URL de la aplicación
    read -p "Por favor, introduce la URL de la aplicación (por ejemplo, http://localhost:$port): " app_url

    # Generar el secreto de sesión
    session_secret=$(openssl rand -hex 16)

    # Solicitar al usuario la configuración del servidor de correo
    read -p "Por favor, introduce la URL del servidor de correo: " mail_host
    read -p "Por favor, introduce el puerto del servidor de correo: " mail_port
    read -p "Por favor, introduce tu usuario de correo: " mail_user
    read -s -p "Por favor, introduce tu contraseña de correo: " mail_pass
    echo

    # Definir la ubicación base en el host de las carpetas necesarias
    read -p "Por favor, introduce la ubicación base en el host donde se encuentran las carpetas 'data', 'uploads', 'env' y 'logs' (presiona Enter para usar la ubicación predeterminada /liberteis): " base_dir
    base_dir=${base_dir:-/liberteis}

    # Construir las rutas completas de las carpetas en el host
    data_dir="$base_dir/data"
    uploads_dir="$base_dir/uploads"
    env_dir="$base_dir/env"
    logs_dir="$base_dir/logs"

    # Crear el archivo .env
    echo "PORT=$port" >"$env_dir/.env"
    echo "APP_URL=\"$app_url\"" >>"$env_dir/.env"
    echo "SESSION_SECRET=\"$session_secret\"" >>"$env_dir/.env"
    echo "MAIL_HOST=\"$mail_host\"" >>"$env_dir/.env"
    echo "MAIL_PORT=\"$mail_port\"" >>"$env_dir/.env"
    echo "MAIL_USER=\"$mail_user\"" >>"$env_dir/.env"
    echo "MAIL_PASS=\"$mail_pass\"" >>"$env_dir/.env"

    # Descargar la imagen desde GitHub Container Registry
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest &>/dev/null

    # Ejecutar el contenedor con los volúmenes especificados y el healthcheck
    docker run -d -v $data_dir:/app/data -v $uploads_dir:/app/uploads -v $env_dir:/app/env -v $logs_dir:/app/logs -e APP_PORT=$port -p $port:$port --name liberteis --health-cmd="curl --silent --fail localhost:$port/health || exit 1" --health-interval=30s --health-retries=3 --health-start-period=10s ghcr.io/alexdeveloperuwu/liberteis:latest
    sleep 10
    docker exec -it liberteis apk add --no-cache curl &>/dev/null

    # Esperar hasta que el contenedor esté en funcionamiento y saludable
    echo "Esperando a que el contenedor se inicie y sea saludable..."
    until docker inspect --format '{{.State.Running}}' liberteis &>/dev/null && [ "$(docker inspect --format '{{.State.Health.Status}}' liberteis)" = "healthy" ]; do
        sleep 1
    done

    echo "La aplicación se ha instalado correctamente. Los volúmenes han sido montados en las ubicaciones especificadas en el host."
}

# Función para actualizar la aplicación
update() {
    # Obtener el puerto del contenedor existente
    port=$(docker port liberteis | awk -F ":" '{print $2}')

    # Obtener los volúmenes del contenedor existente
    volumes=$(sudo docker inspect --format='{{range .Mounts}}{{printf "%s:%s\n" .Source .Destination}}{{end}}' liberteis)

    # Detener y eliminar el contenedor existente
    docker stop liberteis &>/dev/null
    docker rm liberteis &>/dev/null

    # Descargar la versión actualizada de la imagen desde GitHub Container Registry
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest &>/dev/null

    # Volver a ejecutar el contenedor con el mismo puerto y los mismos volúmenes, y el healthcheck
    docker run -d $volumes -e APP_PORT=$port -p $port:$port --name liberteis --health-cmd="curl --silent --fail localhost:$port/health || exit 1" --health-interval=30s --health-retries=3 --health-start-period=10s ghcr.io/alexdeveloperuwu/liberteis:latest
    sleep 10
    docker exec -it liberteis apk add --no-cache curl &>/dev/null

    # Esperar hasta que el contenedor esté en funcionamiento y saludable
    echo "Esperando a que el contenedor se reinicie y sea saludable..."
    until docker inspect --format '{{.State.Running}}' liberteis &>/dev/null && [ "$(docker inspect --format '{{.State.Health.Status}}' liberteis)" = "healthy" ]; do
        sleep 1
    done

    echo "La aplicación se ha actualizado correctamente. Los volúmenes siguen montados en las mismas ubicaciones especificadas en el host."
}

# Función para verificar el estado de salud de la aplicación
healthcheck() {
    # Verificar si el contenedor está en ejecución
    if docker inspect --format '{{.State.Running}}' liberteis &>/dev/null; then
        echo "La aplicación está en ejecución."
        # Verificar el estado de salud del contenedor
        docker inspect --format '{{json .State.Health.Status}}' liberteis
    else
        echo "Error: La aplicación no está en ejecución."
        exit 1
    fi
}

# Imprimir la cabecera ASCII
print_header

# Menú de opciones
echo "¿Qué acción deseas realizar?"
echo "1. Instalar la aplicación"
echo "2. Actualizar la aplicación"
echo "3. Verificar el estado de salud de la aplicación"
read -p "Selecciona una opción (1, 2 o 3): " choice

# Ejecutar la acción seleccionada
case $choice in
1) install ;;
2) update ;;
3) healthcheck ;;
*) echo "Opción no válida. Por favor, selecciona 1, 2 o 3." ;;
esac

