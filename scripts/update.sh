#!/bin/bash

# Función para imprimir la cabecera en ASCII
print_header() {
    clear
    echo -e "\n\033[1m\033[92m"
    echo "  _      _ _            _______   _     "
    echo " | |    (_) |          |__   __| (_)    "
    echo " | |     _| |__   ___ _ __| | ___ _ ___ "
    echo " | |    | | '_ \ / _ \ '__| |/ _ \ / __|"
    echo " | |____| | |_) |  __/ |  | |  __/ \__ \\"
    echo " |______|_|_.__/ \___|_|  |_|\___|_|___/"
    echo -e "\033[0m\n"
}

# Función para actualizar el contenedor Docker
update_container() {
    local container_name="$1"

    # Obtener detalles del contenedor
    local container_info=$(docker inspect "$container_name")

    # Extraer rutas de las carpetas montadas y el puerto del contenedor
    local data_dir=$(echo "$container_info" | jq -r '.[].Mounts[] | select(.Destination == "/app/data") | .Source')
    local uploads_dir=$(echo "$container_info" | jq -r '.[].Mounts[] | select(.Destination == "/app/uploads") | .Source')
    local env_dir=$(echo "$container_info" | jq -r '.[].Mounts[] | select(.Destination == "/app/env") | .Source')
    local container_port=$(echo "$container_info" | jq -r '.[].HostConfig.PortBindings | keys[0]')

    # Detener y eliminar el contenedor existente
    docker stop "$container_name" >/dev/null 2>&1
    docker rm "$container_name" >/dev/null 2>&1

    # Descargar la última imagen del contenedor
    docker pull ghcr.io/alexdeveloperuwu/liberteis:latest >/dev/null 2>&1

    # Volver a crear y ejecutar el contenedor con la nueva imagen
    docker run -d --name "$container_name" -e APP_PORT="$container_port" -p "$container_port":"$container_port" -v "$data_dir":/app/data:rw -v "$uploads_dir":/app/uploads:rw -v "$env_dir":/app/env:rw ghcr.io/alexdeveloperuwu/liberteis:latest >/dev/null 2>&1

    # Comprobar si el contenedor se ha lanzado correctamente
    local container_status=$(docker inspect -f '{{.State.Status}}' "$container_name")

    while [ "$container_status" != "running" ]; do
        sleep 10
        container_status=$(docker inspect -f '{{.State.Status}}' "$container_name")
    done

    echo -e "\nEl contenedor '$container_name' se ha actualizado y se ha lanzado correctamente."
}

print_header

# Verificar si Docker está instalado
if command -v docker &>/dev/null; then
    echo "Docker está instalado en el sistema."

    # Solicitar al usuario el nombre del contenedor
    read -p "Por favor, introduce el nombre del contenedor Docker que deseas actualizar: " container_name

    # Verificar si el contenedor existe
    if docker inspect "$container_name" >/dev/null 2>&1; then
        update_container "$container_name"
    else
        echo -e "\033[91mEl contenedor '$container_name' no existe. Por favor, verifica el nombre e inténtalo de nuevo.\033[0m"
    fi
else
    echo -e "\033[91mLo sentimos, pero Docker no está en el sistema, con lo que no se puede continuar.\033[0m"
fi
