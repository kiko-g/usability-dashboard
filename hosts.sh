#!/bin/bash
CONFIG_FILE=/var/www/html/config/config.ini.php
HOST_LINE='trusted_hosts[] = "localhost:8081"'

# Check if the trusted_hosts line already exists
if ! grep -q "$HOST_LINE" $CONFIG_FILE; then
  echo "$HOST_LINE" >> $CONFIG_FILE
fi
