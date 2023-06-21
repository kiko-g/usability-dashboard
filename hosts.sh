#!/bin/bash
CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep matomo)
CONFIG_FILE="/var/www/html/config/config.ini.php"
NEW_HOSTS_LINE="trusted_hosts[] = \"vmdsdev01:31089\""

if [ -n "$CONTAINER_NAME" ]; then
    if docker exec "$CONTAINER_NAME" test -f "$CONFIG_FILE"; then
        docker exec -it "$CONTAINER_NAME" sed -i "s/^trusted_hosts\[\] = \"vmdsdev01\"$/$NEW_HOSTS_LINE/" "$CONFIG_FILE"
    else
        echo "Config file '$CONFIG_FILE' not found inside the Matomo container. Have you finished the Matomo setup yet?"
    fi
else
    echo "Matomo container not found. Make sure it is running and check the container name."
fi
