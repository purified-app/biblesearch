#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ Error: .env file not found."
  exit 1
fi

echo "🚀 Deploying database to server..."
scp -P ${SSH_PORT:-22} database/bible.db ${SSH_USER}@${SSH_HOST}:biblesearch/database/

echo "🎉 Database deployment complete!"
