#!/bin/bash
# status-api.sh - Generates status.json for the frontend
# Deployed to: /opt/scripts/status-api.sh
# Run by cron every minute

OUTPUT_FILE="/var/www/html/status.json"

# Check if a systemd service is running
check_service() {
    local service=$1
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo "running"
    else
        echo "stopped"
    fi
}

# Build JSON
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

YOUTUBE_STATUS=$(check_service "lofi-stream")
TWITCH_STATUS=$(check_service "lofi-stream-twitch")
KICK_STATUS=$(check_service "lofi-stream-kick")
RUMBLE_STATUS=$(check_service "lofi-stream-rumble")

cat > "$OUTPUT_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "server": "production",
  "streams": {
    "youtube": {
      "status": "$YOUTUBE_STATUS",
      "service": "lofi-stream",
      "display": ":99",
      "platform": "YouTube"
    },
    "twitch": {
      "status": "$TWITCH_STATUS",
      "service": "lofi-stream-twitch",
      "display": ":98",
      "platform": "Twitch"
    },
    "kick": {
      "status": "$KICK_STATUS",
      "service": "lofi-stream-kick",
      "display": ":97",
      "platform": "Kick"
    },
    "rumble": {
      "status": "$RUMBLE_STATUS",
      "service": "lofi-stream-rumble",
      "display": ":96",
      "platform": "Rumble"
    }
  }
}
EOF

# Set permissions so nginx can serve it
chmod 644 "$OUTPUT_FILE"
