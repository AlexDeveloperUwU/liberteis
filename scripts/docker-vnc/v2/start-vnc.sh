#!/bin/bash

# Actualizar el archivo /etc/hosts
echo 'Actualizando el archivo /etc/hosts...'
HOSTNAME=$(hostname)
echo "127.0.1.1\t$HOSTNAME" >>/etc/hosts

# Configurar la variable USER
export USER=root

echo "Iniciando servidores VNC con diferentes resoluciones..."

# Iniciar la primera pantalla (16:9)
vncserver -kill :1 || true
vncserver -geometry 1280x720 -depth 16 :1 &

# Iniciar la segunda pantalla (5:4)
vncserver -kill :2 || true
vncserver -geometry 1280x1024 -depth 16 :2 &

echo "Servidores VNC iniciados en las resoluciones 1280x720 y 1280x1024!"

# Iniciar openbox (gestor de ventanas ligero)
openbox &

# Esperar un momento para asegurarse de que los servidores VNC estén listos
sleep 2

mkdir -p /root/.mozilla/firefox/profile1
mkdir -p /root/.mozilla/firefox/profile2

# Iniciar Firefox en modo quiosco en la URL deseada
DISPLAY=:1 firefox -no-remote --profile /root/.mozilla/firefox/profile1 --kiosk https://actividades.biblio.iesteis.gal/rpi &
DISPLAY=:2 firefox -no-remote --profile /root/.mozilla/firefox/profile2 --kiosk https://actividades.biblio.iesteis.gal/rpi &

# Mantener el contenedor en ejecución
tail -f /dev/null
