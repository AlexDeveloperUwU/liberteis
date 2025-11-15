#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  echo -e "${YELLOW}Usage: $0 [dev|prod]${NC}"
  exit 1
}

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

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
  usage
fi

clear
echo -e "${GREEN}Selected environment: $ENVIRONMENT${NC}"

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
      chmod -R 755 "$dir" || {
        echo -e "${RED}Error setting permissions for $dir${NC}"
        exit 1
      }
      chown -R "$(id -u):$(id -g)" "$dir" || {
        echo -e "${RED}Error setting ownership for $dir${NC}"
        exit 1
      }
      echo -e "${GREEN}Created directory: $dir${NC}"
    else
      echo -e "${YELLOW}Directory already exists: $dir${NC}"
    fi
  done
}

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

generate_random_password() {
  openssl rand -hex 16
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
    echo -e "${GREEN}Database credentials file created.${NC}"
    echo -e "${BLUE}Generated credentials:${NC}"
    echo "MYSQL_ROOT_PASSWORD=$root_password"
    echo "MYSQL_USER=liberteis-app"
    echo "MYSQL_PASSWORD=$user_password"
  else
    echo -e "${YELLOW}Database credentials file already exists.${NC}"
  fi
}

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

set_mysql_host() {
  if [ "$1" == "container" ]; then
    MYSQL_HOST="liberteis-db"
  else
    MYSQL_HOST="localhost"
  fi
}

stop_and_remove_containers() {
  echo -e "${BLUE}Stopping and removing all containers...${NC}"
  docker compose -f docker-compose.yml down || {
    echo -e "${RED}Error stopping and removing containers${NC}"
    exit 1
  }
  echo -e "${GREEN}All containers stopped and removed.${NC}"
}

stop_remove_and_clean_volumes() {
  echo -e "${BLUE}Stopping and removing all containers and volumes...${NC}"
  docker compose down -v || {
    echo -e "${RED}Error stopping and removing containers and volumes${NC}"
    exit 1
  }
  echo -e "${GREEN}All containers and volumes removed.${NC}"
}

create_admin_account_key() {
  admin_key_file="./data/secrets/adminaccount.key"
  if [ ! -f "$admin_key_file" ]; then
    admin_password=$(generate_random_password)
    echo "$admin_password" >"$admin_key_file" || {
      echo -e "${RED}Error creating admin account key file${NC}"
      exit 1
    }
    echo -e "${GREEN}Admin account key file created.${NC}"
  else
    echo -e "${YELLOW}Admin account key file already exists.${NC}"
  fi
}

export_env_variables() {
  creds_file="./data/secrets/dbcreds.env"
  if [ -f "$creds_file" ]; then
    export $(grep -v '^#' "$creds_file" | xargs) || {
      echo -e "${RED}Error exporting environment variables from $creds_file${NC}"
      exit 1
    }
  else
    echo -e "${RED}Credentials file $creds_file not found.${NC}"
    exit 1
  fi
}

grant_mysql_permissions() {
  if ! docker ps --format '{{.Names}}' | grep -q "^liberteis-db$"; then
    echo -e "${YELLOW}MySQL container 'liberteis-db' not found. Skipping granting permissions.${NC}"
    return 0
  fi

  SQL_COMMAND="CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'; \
               ALTER USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'; \
               GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'%'; \
               FLUSH PRIVILEGES;"

  if docker exec liberteis-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" mysql -e "$SQL_COMMAND"; then
    echo -e "${GREEN}Granted MySQL user permissions for any host.${NC}"
  else
    echo -e "${RED}Warning: could not grant MySQL user permissions. You may retry manually once MySQL is ready.${NC}"
  fi
}

initialize() {
  if [ ! -f "./data/init/initialized.txt" ]; then
    echo -e "${BLUE}Running initialization...${NC}"
    create_directories
    set_key
    create_db_creds_file
    create_admin_account_key
    export_env_variables
    echo -e "${GREEN}Initialization complete. MySQL permission grant will run after the DB is started.${NC}"
  else
    echo -e "${YELLOW}Initialization already completed. Skipping.${NC}"
    export_env_variables
  fi
}

initialize
create_init_indicator

if [ "$ENVIRONMENT" == "dev" ]; then
  clear
  echo -e "${BLUE}Setting up development environment...${NC}"
  export_env_variables
  while true; do
    echo "1) Outside container"
    echo "2) Inside container"
    echo "3) Stop and remove all containers"
    echo "4) Stop, remove all containers, and clean volumes"
    read -p "Enter the corresponding number (1, 2, 3, or 4): " dev_choice

    case $dev_choice in
    1)
      clear
      echo -e "${BLUE}Running outside container...${NC}"
      set_mysql_host "local"
      update_mysql_host_in_creds
      docker compose --profile dev up --force-recreate -d mysql || {
        echo -e "${RED}Error starting MySQL with Docker Compose${NC}"
        exit 1
      }
      echo -e "${BLUE}Waiting for MySQL to become healthy...${NC}"
      until [ "$(docker inspect --format='{{.State.Health.Status}}' liberteis-db 2>/dev/null)" == "healthy" ]; do
        sleep 5
      done
      echo -e "${GREEN}MySQL is healthy.${NC}"
      export_env_variables
      grant_mysql_permissions
      npm run dev || {
        echo -e "${RED}Error running development environment${NC}"
        exit 1
      }
      break
      ;;
    2)
      clear
      echo -e "${BLUE}Running inside container...${NC}"
      set_mysql_host "container"
      update_mysql_host_in_creds
      docker compose --profile dev up --force-recreate --build -d || {
        echo -e "${RED}Error starting Docker Compose${NC}"
        exit 1
      }
      echo -e "${BLUE}Waiting for MySQL to become healthy (if present)...${NC}"
      until [ "$(docker inspect --format='{{.State.Health.Status}}' liberteis-db 2>/dev/null)" == "healthy" ] || ! docker ps --format '{{.Names}}' | grep -q "^liberteis-db$"; do
        sleep 5
      done
      export_env_variables
      grant_mysql_permissions
      break
      ;;
    3)
      stop_and_remove_containers
      break
      ;;
    4)
      stop_remove_and_clean_volumes
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
  export_env_variables
  docker compose --profile prod up --force-recreate -d || {
    echo -e "${RED}Error starting Docker Compose${NC}"
    exit 1
  }
  grant_mysql_permissions
fi