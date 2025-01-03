#!/bin/bash

if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Installing Docker..."
    echo "Changing permissions of install-docker.sh"
    chmod +x install-docker.sh
    ./install-docker.sh
else
    echo "Docker is already installed."
fi

# Create Caddyfile
echo "Creating Caddyfile..."
cat << 'CADDYFILE_EOF' > Caddyfile
biblesearch.app {
    reverse_proxy biblesearch:3000 # Must match service name docker-compose.yml
}
CADDYFILE_EOF
echo "Caddyfile created."

docker compose -f docker-compose.yml up -d