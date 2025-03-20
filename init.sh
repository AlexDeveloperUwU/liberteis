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
    "./data/logs"
  )

  for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir" || {
        echo -e "${RED}Error creating directory $dir${NC}"
        exit 1
      }
      echo -e "${GREEN}Created directory: $dir${NC}"
    else
      echo -e "${YELLOW}Directory already exists: $dir${NC}"
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
    echo -e "${GREEN}Secret key created.${NC}"
  else
    echo -e "${YELLOW}Secret key already exists.${NC}"
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
    echo -e "${GREEN}Database credentials file created.${NC}"
  else
    echo -e "${YELLOW}Database credentials file already exists.${NC}"
  fi
}

# Add MySQL host to credentials
update_mysql_host_in_creds() {
  creds_file="./data/secrets/dbcreds.env"
  if grep -q "^MYSQL_HOST=" "$creds_file"; then
    sed -i "s/^MYSQL_HOST=.*/MYSQL_HOST=$MYSQL_HOST/" "$creds_file" || {
      echo -e "${RED}Error updating MYSQL_HOST in credentials file${NC}"
      exit 1
    }
  else
    echo "MYSQL_HOST=$MYSQL_HOST" >>"$creds_file" || {
      echo -e "${RED}Error adding MYSQL_HOST to credentials file${NC}"
      exit 1
    }
  fi
  echo -e "${GREEN}Updated MYSQL_HOST in credentials file.${NC}"
}

# Create initialization indicator
create_init_indicator() {
  indicator_file="./data/init/initialized.txt"
  if [ ! -f "$indicator_file" ]; then
    touch "$indicator_file" || {
      echo -e "${RED}Error creating initialization indicator file${NC}"
      exit 1
    }
    echo -e "${GREEN}Initialization indicator file created.${NC}"
  else
    echo -e "${YELLOW}Initialization indicator file already exists.${NC}"
  fi
}

# Set MySQL host based on environment
set_mysql_host() {
  if [ "$1" == "container" ]; then
    MYSQL_HOST="liberteis-db"
  else
    MYSQL_HOST="localhost"
  fi
}

# Stop and remove all containers
stop_and_remove_containers() {
  echo -e "${BLUE}Stopping and removing all containers...${NC}"
  docker compose -f docker-compose.yml down || {
    echo -e "${RED}Error stopping and removing containers${NC}"
    exit 1
  }
  echo -e "${GREEN}All containers stopped and removed.${NC}"
}

# Main initialization logic
initialize() {
  if [ ! -f "./data/init/initialized.txt" ]; then
    echo -e "${BLUE}Running initialization...${NC}"
    create_directories
    set_key
    create_db_creds_file
    echo -e "${GREEN}Initialization complete.${NC}"
  else
    echo -e "${YELLOW}Initialization already completed. Skipping.${NC}"
  fi
}

initialize
create_init_indicator

# Environment-specific configuration
if [ "$ENVIRONMENT" == "dev" ]; then
  clear
  echo -e "${BLUE}Setting up development environment...${NC}"
  while true; do
    echo "1) Outside container"
    echo "2) Inside container"
    echo "3) Stop and remove all containers"
    read -p "Enter the corresponding number (1, 2, or 3): " dev_choice

    case $dev_choice in
    1)
      clear
      echo -e "${BLUE}Running outside container...${NC}"
      set_mysql_host "local"
      update_mysql_host_in_creds
      docker compose -f docker-compose.yml --profile dev up -d mysql || {
        echo -e "${RED}Error starting MySQL with Docker Compose${NC}"
        exit 1
      }
      echo -e "${BLUE}Waiting for MySQL to become healthy...${NC}"
      until [ "$(docker inspect --format='{{.State.Health.Status}}' liberteis-db)" == "healthy" ]; do
        sleep 5
      done
      echo -e "${GREEN}MySQL is healthy.${NC}"
      break
      ;;
    2)
      clear
      echo -e "${BLUE}Running inside container...${NC}"
      set_mysql_host "container"
      update_mysql_host_in_creds
      docker compose -f docker-compose.yml --profile dev up --build || {
        echo -e "${RED}Error starting Docker Compose${NC}"
        exit 1
      }
      break
      ;;
    3)
      stop_and_remove_containers
      break
      ;;
    *)
      echo -e "${RED}Invalid option. Please try again.${NC}"
      ;;
    esac
  done
elif [ "$ENVIRONMENT" == "prod" ]; then
  clear
  echo -e "${BLUE}Setting up production environment...${NC}"
  docker compose -f docker-compose.yml --profile prod up || {
    echo -e "${RED}Error starting Docker Compose${NC}"
    exit 1
  }
fi
