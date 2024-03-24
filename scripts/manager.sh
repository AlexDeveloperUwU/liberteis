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
if ! command -v docker &> /dev/null; then
    echo "Error: Docker no está instalado. Por favor, instala Docker y vuelve a intentarlo."
    exit 1
fi

# Función para instalar la aplicación
install() {
    # Solicitar al usuario la ubicación base en el host de las carpetas necesarias
    read -p "Por favor, introduce la ubicación base en el host donde se encuentran las carpetas 'data', 'uploads', 'env' y 'logs' (presiona Enter para usar la ubicación predeterminada /liberteis): " base_dir
    base_dir=${base_dir:-/liberteis}

    # Construir las rutas completas de las carpetas en el host
    data_dir="$base_dir/data"
    uploads_dir="$base_dir/uploads"
    env_dir="$base_dir/env"
    logs_dir="$base_dir/logs"

    # Descargar la imagen desde GitHub Container Registry
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest

    # Ejecutar el contenedor con los volúmenes especificados
    docker run -d -v $data_dir:/app/data -v $uploads_dir:/app/uploads -v $env_dir:/app/env -v $logs_dir:/app/logs -e APP_PORT=$port -p $port:$port --name liberteis ghcr.io/alexdeveloperuwu/liberteis:latest

    echo "La aplicación se ha instalado correctamente. Los volúmenes han sido montados en las ubicaciones especificadas en el host."
}

# Función para actualizar la aplicación
update() {
    # Obtener los volúmenes del contenedor existente
    volumes=$(sudo docker inspect --format='{{range .Mounts}}{{printf "%s:%s\n" .Source .Destination}}{{end}}' liberteis)

    # Detener y eliminar el contenedor existente
    docker stop liberteis
    docker rm liberteis

    # Descargar la versión actualizada de la imagen desde GitHub Container Registry
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest

    # Volver a ejecutar el contenedor con los mismos volúmenes
    docker run -d $volumes -e APP_PORT=$port -p $port:$port --name liberteis ghcr.io/alexdeveloperuwu/liberteis:latest

    echo "La aplicación se ha actualizado correctamente. Los volúmenes siguen montados en las mismas ubicaciones especificadas en el host."
}

# Imprimir la cabecera ASCII
print_header

# Menú de opciones
echo "¿Qué acción deseas realizar?"
echo "1. Instalar la aplicación"
echo "2. Actualizar la aplicación"
read -p "Selecciona una opción (1 o 2): " choice

# Ejecutar la acción seleccionada
case $choice in
    1) install ;;
    2) update ;;
    *) echo "Opción no válida. Por favor, selecciona 1 o 2." ;;
esac
