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

# Función para solicitar el puerto
ask_port() {
    echo "Por favor, introduzca el puerto donde desea ejecutar la aplicación:"
    read -p "Puerto: " port
}

# Función para mostrar la ruta predeterminada en caso de ser root
show_default_directory() {
    echo "Al ser usuario root, la aplicación guardará sus datos en la siguiente ruta para asegurarse de que no se borrarán accidentalmente:"
    echo ""
    echo "/liberteis/env => Aquí se guardará el .env con toda la configuración de la aplicación"
    echo "/liberteis/data => Aquí se guardará la base de datos con todos los usuarios y eventos"
    echo "/liberteis/uploads => Aquí se guardarán todos los ficheros que los usuarios suban"
}

# Función para solicitar el directorio de datos en caso de no ser root
ask_directory() {
    echo "Por favor, introduzca el directorio donde desea guardar los archivos de la aplicación:"
    read -p "Directorio: " directory
    echo "El directorio seleccionado es: $directory"
}

# Función para generar un secreto de sesión aleatorio de 24 caracteres con caracteres especiales
generate_session_secret() {
    session_secret=$(openssl rand -base64 24)
}

# Función para pedir información sensible al usuario
ask_sensitive_info() {
    echo "Por favor, introduce la siguiente información para guardar en el .env:"
    read -p "URL de la aplicación (por defecto http://localhost:3000): " app_url
    read -s -p "Tu secreto de sesión: " session_secret
    echo ""
    read -p "URL del servidor de correo: " mail_host
    read -p "Puerto del servidor de correo: " mail_port
    read -p "Tu usuario de correo: " mail_user
    read -s -p "Tu contraseña de correo: " mail_pass
    echo ""
}

# Función para descargar el archivo .env.example y modificarlo con la información proporcionada
setup_env_file() {
    echo "Descargando el fichero de ejemplo para posterior configuración"
    wget -q -O .env.example https://raw.githubusercontent.com/AlexDeveloperUwU/liberteis/main/env/.env.example
    echo "Configurando el archivo .env..."
    sed -i "s#APP_URL=.*#APP_URL=${app_url:-http://localhost:3000}#g" .env.example
    sed -i "s#SESSION_SECRET=.*#SESSION_SECRET=${session_secret}#g" .env.example
    sed -i "s#MAIL_HOST=.*#MAIL_HOST=${mail_host}#g" .env.example
    sed -i "s#MAIL_PORT=.*#MAIL_PORT=${mail_port}#g" .env.example
    sed -i "s#MAIL_USER=.*#MAIL_USER=${mail_user}#g" .env.example
    sed -i "s#MAIL_PASS=.*#MAIL_PASS=${mail_pass}#g" .env.example
    mv .env.example .env
}

print_header

# Verificar si Docker está instalado
if command -v docker &>/dev/null; then
    echo "Docker está instalado en el sistema."
    # Verificar si el usuario es root
    if [[ $(id -u) -eq 0 ]]; then
        echo "El usuario actual es root."
        ask_port
        show_default_directory
        generate_session_secret
        ask_sensitive_info
        setup_env_file
        echo "Ejecutando el contenedor Docker..."
        docker run -d --name liberteis -e APP_PORT=${port:-3000} -p ${port:-3000}:${port:-3000} -v /liberteis/data:/app/data:rw -v /liberteis/uploads:/app/uploads:rw -v /liberteis/env:/app/env:rw ghcr.io/alexdeveloperuwu/liberteis:latest >/dev/null 2>&1
        cd /liberteis/env || exit
        echo -e "\033[0m\nLa instalación se ha completado exitosamente."
    else
        echo "El usuario actual no es root."
        ask_port
        ask_directory
        generate_session_secret
        ask_sensitive_info
        setup_env_file
        echo "Ejecutando el contenedor Docker..."
        docker run -d --name liberteis -e APP_PORT=${port:-3000} -p ${port:-3000}:${port:-3000} -v $directory:/app/data:rw -v $directory:/app/uploads:rw -v $directory:/app/env:rw ghcr.io/alexdeveloperuwu/liberteis:latest >/dev/null 2>&1
        cd $directory/env || exit
        echo -e "\033[0m\nLa instalación se ha completado exitosamente."
    fi
else
    echo -e "\033[91mLo sentimos, pero Docker no está en el sistema, con lo que no se puede continuar."
fi
