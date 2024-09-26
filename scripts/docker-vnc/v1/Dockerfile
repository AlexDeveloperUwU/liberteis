# Usar una imagen base oficial de Debian Slim
FROM debian:bullseye-slim

# Evitar advertencias al cambiar a modo no interactivo
ENV DEBIAN_FRONTEND=noninteractive

# Instalar XFCE, servidor VNC, dbus-x11, xfonts-base y Firefox
RUN apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    xfce4-goodies \
    tightvncserver \
    dbus-x11 \
    xfonts-base \
    firefox-esr \
    tzdata &&
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Configurar la zona horaria a Madrid
RUN ln -snf /usr/share/zoneinfo/Europe/Madrid /etc/localtime && echo "Europe/Madrid" >/etc/timezone

# Configurar el servidor VNC
RUN mkdir /root/.vnc &&
    echo "@LTRPi32" | vncpasswd -f >/root/.vnc/passwd &&
    chmod 600 /root/.vnc/passwd

# Crear un archivo .Xauthority
RUN touch /root/.Xauthority

# Exponer puertos para las pantallas VNC
EXPOSE 5801 5802

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar un script para iniciar el servidor VNC
COPY start-vnc.sh start-vnc.sh
RUN chmod +x start-vnc.sh

# Ejecutar el script al iniciar el contenedor
CMD ["bash", "start-vnc.sh"]
