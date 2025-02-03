#!/bin/bash

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage function
usage() {
  echo -e "${YELLOW}Usage: $0 [dev|prod]${NC}"
  exit 1
}

# Prompt for environment if not provided
if [ -n "$1" ]; then
  ENVIRONMENT=$1
else
  clear
  echo -e "${BLUE}Select the development environment:${NC}"
  echo "1) Dev"
  echo "2) Prod"
  read -p "Enter the corresponding number (1 or 2): " choice

  case $choice in
  1) ENVIRONMENT="dev" ;;
  2) ENVIRONMENT="prod" ;;
  *)
    echo -e "${RED}Invalid option.${NC}"
    usage
    ;;
  esac
fi

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
  usage
fi

clear
echo -e "${GREEN}Selected environment: $ENVIRONMENT${NC}"

# Create necessary directories
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
        echo -e "${RED}Error creating directory $dir${NC}"
        exit 1
      }
    fi
  done
}

# Set a secret key
set_key() {
  key_file="./data/secrets/secret.key"
  if [ ! -f "$key_file" ]; then
    key=$(openssl rand -hex 32)
    echo "$key" >"$key_file" || {
      echo -e "${RED}Error creating key file${NC}"
      exit 1
    }
  fi
}

# Generate random password
generate_random_password() {
  openssl rand -hex 16
}

# Create database credentials file
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

# Add MySQL host to credentials
add_mysql_host_to_creds() {
  creds_file="./data/secrets/dbcreds.env"
  echo "MYSQL_HOST=$MYSQL_HOST" >>"$creds_file" || {
    echo -e "${RED}Error adding MYSQL_HOST to credentials file${NC}"
    exit 1
  }
}

# Create initialization indicator
create_init_indicator() {
  indicator_file="./data/init/initialized.txt"
  if [ ! -f "$indicator_file" ]; then
    touch "$indicator_file" || {
      echo -e "${RED}Error creating initialization indicator file${NC}"
      exit 1
    }
  fi
}

# Set MySQL host based on environment
set_mysql_host() {
  if [ "$1" == "container" ]; then
    MYSQL_HOST="liberteis-mysql"
  else
    MYSQL_HOST="localhost"
  fi
}

# Main initialization logic
initialize() {
  if [ ! -f "./data/init/initialized.txt" ]; then
    echo -e "${BLUE}Running initialization...${NC}"
    create_directories
    set_key
    create_db_creds_file
    create_init_indicator
    echo -e "${GREEN}Initialization complete.${NC}"
  else
    echo -e "${YELLOW}Initialization already completed. Skipping.${NC}"
  fi
}

initialize

# Environment-specific configuration
if [ "$ENVIRONMENT" == "dev" ]; then
  clear
  echo -e "${BLUE}Setting up development environment...${NC}"
  echo "1) Outside container"
  echo "2) Inside container"
  read -p "Enter the corresponding number (1 or 2): " dev_choice

  case $dev_choice in
  1)
    clear
    echo -e "${BLUE}Running outside container...${NC}"
    set_mysql_host "local"
    add_mysql_host_to_creds
    docker compose -f compose-db.yml up -d mysql || {
      echo -e "${RED}Error starting MySQL with Docker Compose${NC}"
      exit 1
    }
    echo -e "${BLUE}Waiting for MySQL to become healthy...${NC}"
    until [ "$(docker inspect --format='{{.State.Health.Status}}' liberteis-db)" == "healthy" ]; do
      sleep 5
    done
    echo -e "${GREEN}MySQL is healthy.${NC}"
    ;;
  2)
    clear
    echo -e "${BLUE}Running inside container...${NC}"
    set_mysql_host "container"
    add_mysql_host_to_creds
    docker compose -f docker-compose.dev.yml up --build || {
      echo -e "${RED}Error starting Docker Compose${NC}"
      exit 1
    }
    ;;
  *)
    echo -e "${RED}Invalid option.${NC}"
    exit 1
    ;;
  esac
elif [ "$ENVIRONMENT" == "prod" ]; then
  clear
  echo -e "${BLUE}Setting up production environment...${NC}"
  docker compose -f docker-compose.prod.yml up || {
    echo -e "${RED}Error starting Docker Compose${NC}"
    exit 1
  }
fi
