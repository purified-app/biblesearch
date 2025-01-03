#!/bin/bash

# Update the package index
sudo apt-get update

# Install necessary packages for adding Docker's GPG key
sudo apt-get install -y ca-certificates curl

# Create directory for the Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings

# Add Docker's official GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the Docker repository to Apt sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update the package index again
sudo apt-get update

# Install Docker
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Optionally, you might want to start Docker service
sudo systemctl start docker

# Ensure Docker starts on boot
sudo systemctl enable docker

# Verify Docker installation
docker --version

echo "Docker installation completed."