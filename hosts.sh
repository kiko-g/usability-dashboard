#!/bin/bash
CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep matomo)
CONFIG_FILE="/var/www/html/config/config.ini.php"
NEW_HOSTS_LINE="trusted_hosts[] = \"localhost:31089\"\ntrusted_hosts[] = \"vmdsdev01:31089\""

if [ "$1" == "docker" ]; then
    if [ -n "$CONTAINER_NAME" ]; then
        if docker exec "$CONTAINER_NAME" test -f "$CONFIG_FILE"; then
            docker exec -i "$CONTAINER_NAME" sed -i "/^trusted_hosts\[\]/d" "$CONFIG_FILE"
            echo -e "$NEW_HOSTS_LINE" | docker exec -i "$CONTAINER_NAME" tee -a "$CONFIG_FILE" >/dev/null
            echo "Trusted hosts updated successfully inside the Docker container."
        else
            echo "Config file '$CONFIG_FILE' not found inside the Matomo container. Have you finished the Matomo setup yet?"
        fi
    else
        echo "Matomo container not found. Make sure it is running and check the container name."
    fi
else
    sed -i "/^trusted_hosts\[\]/d" "$CONFIG_FILE"
    echo -e "$NEW_HOSTS_LINE" >> "$CONFIG_FILE"
    echo "Trusted hosts updated successfully outside the Docker container."
fi
