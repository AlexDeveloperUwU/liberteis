# Usar una imagen más ligera de Debian
FROM debian:bullseye-slim

# Establecer la zona horaria
ENV TZ=Europe/Madrid

# Evitar advertencias de interacción durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    openbox \
    tightvncserver \
    dbus-x11 \
    xfonts-base \
    firefox-esr &&
    apt-get clean &&
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Crear la contraseña del VNC
RUN mkdir /root/.vnc &&
    echo "@LTRPi32" | vncpasswd -f >/root/.vnc/passwd &&
    chmod 600 /root/.vnc/passwd

# Exponer puertos VNC
EXPOSE 5901 5902

# Copiar el script de inicio
COPY start-vnc.sh /usr/local/bin/start-vnc.sh
RUN chmod +x /usr/local/bin/start-vnc.sh

# Establecer el script como punto de entrada
ENTRYPOINT ["/usr/local/bin/start-vnc.sh"]
