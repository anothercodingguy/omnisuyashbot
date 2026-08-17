#!/bin/bash
set -e

# Load environment variables if .env or .env.local exists
if [ -f "../.env.local" ]; then
    export $(grep -v '^#' ../.env.local | xargs)
elif [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "Starting Suyash Voice Agent Worker..."
echo "LiveKit URL: $LIVEKIT_URL"

python agent.py dev
