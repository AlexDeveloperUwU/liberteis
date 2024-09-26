# Eliminar todos los contenedores relacionados con vnc
docker ps -aq --filter "name=vnc" | xargs -r docker rm -f

# Eliminar todas las imágenes relacionadas con vnc
docker images -q --filter "reference=vnc" | xargs -r docker rmi -f

# Construir la nueva imagen
docker build -t vnc .

# Ejecutar el contenedor con la nueva imagen
docker run -dt --name vnc -p 5801:5901 -p 5802:5902 vnc
