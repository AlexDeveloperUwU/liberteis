#!/bin/bash

usage() {
  echo "Uso: $0 [dev|prod]"
  exit 1
}

if [ -n "$1" ]; then
  ENVIRONMENT=$1
else
  echo "Seleccione el entorno de desarrollo:"
  echo "1) Dev"
  echo "2) Prod"
  read -p "Ingrese el número correspondiente (1 o 2): " choice

  case $choice in
  1)
    ENVIRONMENT="dev"
    ;;
  2)
    ENVIRONMENT="prod"
    ;;
  *)
    echo "Opción no válida."
    usage
    ;;
  esac
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Entorno no válido: $ENVIRONMENT"
  usage
fi

echo "Entorno seleccionado: $ENVIRONMENT"

create_directories() {
  directories=(
    "./data"
    "./data/secrets"
    "./data/db"
    "./data/uploads"
    "./data/init"
  )

  for dir in "${directories[@]}"; do
    mkdir -p "$dir" || {
      echo "Error creando el directorio $dir"
      exit 1
    }
  done
}

set_key() {
  key=$(openssl rand -hex 32)
  echo "$key" >"./data/secrets/secret.key" || {
    echo "Error creando el archivo de clave"
    exit 1
  }
}

generate_random_password() {
  openssl rand -hex 32
}

create_db_creds_file() {
  root_password=$(generate_random_password)
  user_password=$(generate_random_password)
  cat <<EOF >"./data/secrets/dbcreds.env"
MYSQL_ROOT_PASSWORD=$root_password
MYSQL_DATABASE=liberteis-db
MYSQL_USER=liberteis-app
MYSQL_PASSWORD=$user_password
EOF
}

create_init_indicator() {
  touch "./data/init/initialized.txt" || {
    echo "Error creando el archivo de indicador de inicialización"
    exit 1
  }
}

initialize() {
  if [ ! -f "./data/init/initialized.txt" ]; then
    echo "Ejecutando inicialización..."
    create_directories
    set_key
    create_db_creds_file
    create_init_indicator
    echo "Inicialización completa."
  else
    echo "Inicialización ya completada. Omitiendo."
  fi
}

initialize

if [ "$ENVIRONMENT" == "dev" ]; then
  echo "Configurando entorno de desarrollo..."
  echo "Seleccione la opción de desarrollo:"
  echo "1) Fuera de container"
  echo "2) Dentro de container"
  read -p "Ingrese el número correspondiente (1 o 2): " dev_choice

  case $dev_choice in
  1)
    echo "Ejecutando fuera de container..."
    docker-compose -f docker-compose.dev.yml up -d mysql || {
      echo "Error al iniciar MySQL con Docker Compose"
      exit 1
    }
    echo "Esperando a que MySQL esté saludable..."
    until [ "$(docker inspect --format='{{.State.Health.Status}}' liberteis-app)" == "healthy" ]; do
      sleep 5
    done
    echo "MySQL está saludable."
    ;;
  2)
    echo "Ejecutando dentro de container..."
    docker-compose -f docker-compose.dev.yml up --build || {
      echo "Error al iniciar Docker Compose"
      exit 1
    }
    ;;
  *)
    echo "Opción no válida."
    exit 1
    ;;
  esac
elif [ "$ENVIRONMENT" == "prod" ]; then
  echo "Configurando entorno de producción..."
  docker-compose -f docker-compose.prod.yml up || {
    echo "Error al iniciar Docker Compose"
    exit 1
  }
fi
