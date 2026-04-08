#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ Error: .env file not found."
  exit 1
fi

# 1. Build Client
echo "🏗  Building Angular Client..."
bun run client-build

# 2. Deploy Everything
echo "🚀 Deploying all files to server..."
scp -P ${SSH_PORT:-22} -r server/api server/.htaccess client/dist/browser/* ${SSH_USER}@${SSH_HOST}:biblesearch/

echo "🎉 Deployment complete!"