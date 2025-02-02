#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' 

usage() {
  echo -e "${YELLOW}Uso: $0 [dev|prod]${NC}"
  exit 1
}

if [ -n "$1" ]; then
  ENVIRONMENT=$1
else
  clear
  echo -e "${BLUE}Seleccione el entorno de desarrollo:${NC}"
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
    echo -e "${RED}Opción no válida.${NC}"
    usage
    ;;
  esac
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo -e "${RED}Entorno no válido: $ENVIRONMENT${NC}"
  usage
fi

clear
echo -e "${GREEN}Entorno seleccionado: $ENVIRONMENT${NC}"

create_directories() {
  directories=(
    "./data"
    "./data/secrets"
    "./data/uploads"
    "./data/init"
  )

  for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir" || {
        echo -e "${RED}Error creando el directorio $dir${NC}"
        exit 1
      }
    fi
  done
}

set_key() {
  key_file="./data/secrets/secret.key"
  if [ ! -f "$key_file" ]; then
    key=$(openssl rand -hex 32)
    echo "$key" >"$key_file" || {
      echo -e "${RED}Error creando el archivo de clave${NC}"
      exit 1
    }
  fi
}

generate_random_password() {
  openssl rand -hex 32
}

create_db_creds_file() {
  creds_file="./data/secrets/dbcreds.env"
  if [ ! -f "$creds_file" ]; then
    root_password=$(generate_random_password)
    user_password=$(generate_random_password)
    cat <<EOF >"$creds_file"
MYSQL_ROOT_PASSWORD=$root_password
MYSQL_DATABASE=liberteis-db
MYSQL_USER=liberteis-app
MYSQL_PASSWORD=$user_password
EOF
  fi
}

create_init_indicator() {
  indicator_file="./data/init/initialized.txt"
  if [ ! -f "$indicator_file" ]; then
    touch "$indicator_file" || {
      echo -e "${RED}Error creando el archivo de indicador de inicialización${NC}"
      exit 1
    }
  fi
}

initialize() {
  if [ ! -f "./data/init/initialized.txt" ]; then
    echo -e "${BLUE}Ejecutando inicialización...${NC}"
    create_directories
    set_key
    create_db_creds_file
    create_init_indicator
    echo -e "${GREEN}Inicialización completa.${NC}"
  else
    echo -e "${YELLOW}Inicialización ya completada. Omitiendo.${NC}"
  fi
}

initialize

if [ "$ENVIRONMENT" == "dev" ]; then
  clear
  echo -e "${BLUE}Configurando entorno de desarrollo...${NC}"
  echo "Seleccione la opción de desarrollo:"
  echo "1) Fuera de container"
  echo "2) Dentro de container"
  read -p "Ingrese el número correspondiente (1 o 2): " dev_choice

  case $dev_choice in
  1)
    clear
    echo -e "${BLUE}Ejecutando fuera de container...${NC}"
    docker compose -f compose-db.yml up -d mysql || {
      echo -e "${RED}Error al iniciar MySQL con Docker Compose${NC}"
      exit 1
    }
    echo -e "${BLUE}Esperando a que MySQL esté saludable...${NC}"
    until [ "$(docker inspect --format='{{.State.Health.Status}}' liberteis-app)" == "healthy" ]; do
      sleep 5
    done
    echo -e "${GREEN}MySQL está saludable.${NC}"
    ;;
  2)
    clear
    echo -e "${BLUE}Ejecutando dentro de container...${NC}"
    docker compose -f docker-compose.dev.yml up --build || {
      echo -e "${RED}Error al iniciar Docker Compose${NC}"
      exit 1
    }
    ;;
  *)
    echo -e "${RED}Opción no válida.${NC}"
    exit 1
    ;;
  esac
elif [ "$ENVIRONMENT" == "prod" ]; then
  clear
  echo -e "${BLUE}Configurando entorno de producción...${NC}"
  docker compose -f docker-compose.prod.yml up || {
    echo -e "${RED}Error al iniciar Docker Compose${NC}"
    exit 1
  }
fi
