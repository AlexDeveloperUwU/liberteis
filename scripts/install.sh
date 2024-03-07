#!/bin/bash

# Índice de colores:
# - Color para texto en negrita: \033[1m
# - Color para texto verde (para mensajes de éxito): \033[92m
# - Color para texto azul (para solicitar entrada): \033[94m
# - Color para texto rojo (para mensajes de error): \033[91m
# - Restaurar color de texto a su valor por defecto: \033[0m

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

# Función para solicitar el puerto
ask_port() {
    echo -e "\033[1m\033[94mPor favor, introduzca el puerto donde desea ejecutar la aplicación:\033[0m"
    read -p "Puerto: " port
    echo -e "\n\033[1m\033[94mEl puerto seleccionado es:\033[0m $port\n"
}

# Función para mostrar la ruta predeterminada en caso de ser root
show_default_directory() {
    echo -e "\033[1m\033[92mAl ser usuario root, la aplicación guardará sus datos en la siguiente ruta:\033[0m"
    echo -e "\033[1m/liberteis/\033[0m\n"

    echo -e "\033[1m\033[92mLas rutas de los datos serán las siguientes:\033[0m"
    echo -e "\033[1m/liberteis/env\033[0m => Aquí se guardará el .env con toda la configuración de la aplicación"
    echo -e "\033[1m/liberteis/data\033[0m => Aquí se guardará la base de datos con todos los usuarios y eventos"
    echo -e "\033[1m/liberteis/uploads\033[0m => Aquí se guardarán todos los ficheros que los usuarios suban\n"
}

# Función para solicitar el directorio de datos en caso de no ser root
ask_directory() {
    echo -e "\033[1m\033[94mPor favor, ingrese el directorio donde desea guardar los archivos de la aplicación:\033[0m"
    read -p "Directorio: " directory
    echo -e "\n\033[1m\033[94mEl directorio seleccionado es:\033[0m $directory\n"
}

print_header

# Verificar si Docker está instalado
if command -v docker &>/dev/null; then

    # Verificar si el usuario es root
    if [[ $(id -u) -eq 0 ]]; then
        echo -e "\033[1m\033[92mEl usuario actual es root.\033[0m\n"
        
        ask_port
        show_default_directory
    else
        echo -e "\033[1m\033[92mEl usuario actual no es root.\033[0m\n"
        
        ask_port
        ask_directory
    fi
else
    echo -e "\033[1m\033[91mLo sentimos, pero Docker no está en el sistema, con lo que no se puede continuar.\033[0m\n"
fi
