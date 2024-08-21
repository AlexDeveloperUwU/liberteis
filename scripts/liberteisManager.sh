#!/bin/bash

# Función para mostrar el header del script
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

# Comprobamos si Docker está instalado y en funcionamiento
check_docker() {
    # Verifica si el binario de Docker está disponible
    if ! command -v docker &>/dev/null; then
        echo "Error: Docker no está instalado. Por favor, instala Docker y vuelve a intentarlo."
        exit 1
    fi

    # Verifica si el daemon de Docker está corriendo
    if ! systemctl is-active --quiet docker; then
        echo "Error: El daemon de Docker no está corriendo. Inicia el servicio Docker y vuelve a intentarlo."
        exit 1
    fi

    # Ejecuta un comando simple para verificar que Docker funciona correctamente
    if ! docker info >/dev/null 2>&1; then
        echo "Error: Docker está instalado pero no puede comunicarse con el daemon. Verifica la instalación y configuración de Docker."
        exit 1
    fi
}

install() {
    check_docker
    print_header
    read -p "Introduce el puerto donde quieres ejecutar la aplicación: " port
    read -p "Introduce la URL desde la que accederás a la aplicación (por ejemplo, http://localhost:$port): " app_url

    # Para la sesión, se genera una clave aleatoria para mayor seguridad
    session_secret=$(openssl rand -hex 16)

    read -p "Introduce la URL del servidor de correo electrónico a usar: " mail_host
    read -p "Introduce el puerto del servidor de correo electrónico a usar: " mail_port
    read -p "Introduce el usuario de correo electrónico que usará la aplicación: " mail_user
    read -s -p "Por favor, introduce tu contraseña del correo electrónico que usará la aplicación: " mail_pass
    echo

    if [[ -z $mail_host || -z $mail_port || -z $mail_user || -z $mail_pass ]]; then
        echo "Error: No se proporcionaron todas las configuraciones necesarias del servidor de correo."
        exit 1
    fi

    read -p "Por favor, introduce la ubicación base en el host donde se guardarán las carpetas de la aplicación (presiona Enter para usar la ubicación predeterminada => /liberteis): " base_dir

    print_header

    echo "Instalando la aplicación, por favor, espera..."

    # Generamos las rutas y creamos las carpetas necesarias
    base_dir=${base_dir:-/liberteis}
    data_dir="$base_dir/data"
    uploads_dir="$base_dir/uploads"
    env_dir="$base_dir/env"
    logs_dir="$base_dir/logs"

    mkdir -p $data_dir
    mkdir -p $uploads_dir
    mkdir -p $env_dir
    mkdir -p $logs_dir

    port=${port:-3000}
    app_url=${app_url:-http://localhost:$port}

    # Creamos el archivo .env con las variables de entorno necesarias
    echo "PORT=$port" >"$env_dir/.env"
    echo "APP_URL=\"$app_url\"" >>"$env_dir/.env"
    echo "SESSION_SECRET=\"$session_secret\"" >>"$env_dir/.env"
    echo "MAIL_HOST=\"$mail_host\"" >>"$env_dir/.env"
    echo "MAIL_PORT=\"$mail_port\"" >>"$env_dir/.env"
    echo "MAIL_USER=\"$mail_user\"" >>"$env_dir/.env"
    echo "MAIL_PASS=\"$mail_pass\"" >>"$env_dir/.env"

    config_file="$base_dir/config.json"
    cat <<EOF >"$config_file"
{
    "port": "$port",
    "volumes": {
        "data_dir": "$data_dir",
        "uploads_dir": "$uploads_dir",
        "env_dir": "$env_dir",
        "logs_dir": "$logs_dir"
    }
}
EOF

    # Hacemos pull de la imagen
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest &>/dev/null

    # Ejecutamos el contenedor con todos los parámetros necesarios
    docker run -d -v $data_dir:/app/data -v $uploads_dir:/app/uploads -v $env_dir:/app/env -v $logs_dir:/app/logs -e APP_PORT=$port -p $port:$port --name liberteis --health-cmd="curl --silent --fail localhost:$port/health || exit 1" --health-interval=30s --health-retries=3 --health-start-period=10s ghcr.io/alexdeveloperuwu/liberteis:latest &>/dev/null
    sleep 10

    print_header
    # Esperamos a que el contenedor se inicie y sea saludable
    echo "Instalación finalizada. Esperando a que el contenedor se inicie y sea saludable..."
    until docker inspect --format '{{.State.Running}}' liberteis &>/dev/null && [ "$(docker inspect --format '{{.State.Health.Status}}' liberteis)" = "healthy" ]; do
        sleep 1
    done

    echo "La aplicación se ha instalado correctamente. Los volúmenes han sido montados en las ubicaciones especificadas en el host."
    read -n 1 -s -r -p "Presiona cualquier tecla para continuar..."
}

update() {
    check_docker
    print_header

    # Le pedimos la ruta base para poder leer la configuración
    read -p "Por favor, introduce la ubicación base en el host donde se encuentran las carpetas de la aplicación (presiona Enter para usar la ubicación predeterminada => /liberteis): " base_dir
    base_dir=${base_dir:-/liberteis}

    # Intentamos leer el fichero de configuración
    config_file="$base_dir/config.json"
    if [[ ! -f $config_file ]]; then
        echo "Error: El archivo de configuración no existe."
        exit 1
    fi

    # Leemos las variables necesarias del archivo de configuración
    port=$(grep -oP '(?<="port": ")[^"]*' $config_file)
    data_dir=$(grep -oP '(?<="data_dir": ")[^"]*' $config_file)
    uploads_dir=$(grep -oP '(?<="uploads_dir": ")[^"]*' $config_file)
    env_dir=$(grep -oP '(?<="env_dir": ")[^"]*' $config_file)
    logs_dir=$(grep -oP '(?<="logs_dir": ")[^"]*' $config_file)

    # Eliminamos el contenedor
    docker stop liberteis &>/dev/null
    docker rm liberteis &>/dev/null

    # Hacemos pull de la imagen nueva
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest &>/dev/null

    # Ejecutamos el contenedor con los mismos parámetros que en la instalación
    docker run -d -v $data_dir:/app/data -v $uploads_dir:/app/uploads -v $env_dir:/app/env -v $logs_dir:/app/logs -e APP_PORT=$port -p $port:$port --name liberteis --health-cmd="curl --silent --fail localhost:$port/health || exit 1" --health-interval=30s --health-retries=3 --health-start-period=10s ghcr.io/alexdeveloperuwu/liberteis:latest &>/dev/null
    sleep 10

    print_header
    # Esperamos a que el contenedor se reinicie y sea saludable
    echo "Instalación finalizada. Esperando a que el contenedor se reinicie y sea saludable..."
    until docker inspect --format '{{.State.Running}}' liberteis &>/dev/null && [ "$(docker inspect --format '{{.State.Health.Status}}' liberteis)" = "healthy" ]; do
        sleep 1
    done

    echo "La aplicación se ha actualizado correctamente. Los volúmenes siguen montados en las mismas ubicaciones especificadas en el host."
    read -n 1 -s -r -p "Presiona cualquier tecla para continuar..."
}

healthcheck() {
    check_docker
    print_header

    # Comprobamos si el contenedor está en ejecución y si es saludable
    if docker inspect --format '{{.State.Running}}' liberteis &>/dev/null; then
        echo "La aplicación está en ejecución."
        docker inspect --format '{{json .State.Health.Status}}' liberteis
    else
        echo "Error: La aplicación no está en ejecución."
        exit 1
    fi
    read -n 1 -s -r -p "Presiona cualquier tecla para continuar..."
}

# Función principal del menú
menu() {
    print_header
    echo "¿Qué acción deseas realizar?"
    echo "1. Instalar la aplicación"
    echo "2. Actualizar la aplicación"
    echo "3. Verificar que la aplicación esté funcionando correctamente"
    echo "4. Salir"
}

# Bucle para mostrar el menú y procesar la opción seleccionada
while true; do
    menu
    read -p "Selecciona una opción (1, 2, 3 o 4): " choice
    choice=$(echo $choice | tr -d '[:space:]') # Eliminar espacios en blanco

    # Depuración: Mostrar la opción leída
    echo "Opción leída: '$choice'"

    case $choice in
    1) install ;;
    2) update ;;
    3) healthcheck ;;
    4)
        echo "Saliendo..."
        exit 0
        ;;
    *) echo "Opción no válida. Por favor, selecciona 1, 2, 3 o 4." ;;
    esac
done
