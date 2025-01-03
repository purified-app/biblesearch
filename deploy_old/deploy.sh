#!/bin/bash

SSH_PORT=22
USERNAME='root'

# Check if an argument was provided
if [ $# -eq 0 ]; then
    # If no argument, prompt for server IP
    read -p "Enter the server IP: " server_ip
    
    # Validate that server_ip is not empty
    if [ -z "$server_ip" ]; then
        echo "Error: Server IP cannot be empty."
        exit 1
    fi
else
    # If an argument was provided, use it
    server_ip=$1
fi

echo "Server IP: $server_ip"

# Copy the necessary files to the remote server
ssh -i ~/.ssh/id_rsa -p $SSH_PORT $USERNAME@$server_ip "mkdir -p app/client app/server"
scp -i ~/.ssh/id_rsa -P $SSH_PORT docker-compose.yml scripts/install-docker.sh $USERNAME@$server_ip:

scp -i ~/.ssh/id_rsa -P $SSH_PORT -r client/www/* $USERNAME@$server_ip:app/client/www
scp -i ~/.ssh/id_rsa -P $SSH_PORT server/bible.db server/package.json $USERNAME@$server_ip:app/server
scp -i ~/.ssh/id_rsa -P $SSH_PORT -r server/src/* $USERNAME@$server_ip:app/server/src

# Execute the remote setup script
ssh -i ~/.ssh/id_rsa -p $SSH_PORT $USERNAME@$server_ip 'bash -s' < scripts/setup.sh