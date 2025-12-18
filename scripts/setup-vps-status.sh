#!/bin/bash
# setup-vps-status.sh - Sets up status endpoint on VPS
# Run this locally, it will SSH to the VPS and configure everything

set -e

VPS_IP="135.181.150.82"
SSH_KEY="$HOME/api-secrets/hetzner-server/id_ed25519"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Setting up status API on VPS ==="

# Copy the status script
echo "Copying status-api.sh to VPS..."
scp -i "$SSH_KEY" "$SCRIPT_DIR/status-api.sh" "root@$VPS_IP:/opt/scripts/"

# Configure on VPS
echo "Configuring VPS..."
ssh -i "$SSH_KEY" "root@$VPS_IP" << 'REMOTE_SCRIPT'
set -e

# Make script executable
chmod +x /opt/scripts/status-api.sh

# Ensure /var/www/html exists
mkdir -p /var/www/html

# Run once to create initial status.json
/opt/scripts/status-api.sh

# Add cron job (every minute)
CRON_JOB="* * * * * /opt/scripts/status-api.sh"
(crontab -l 2>/dev/null | grep -v "status-api.sh"; echo "$CRON_JOB") | crontab -

# Check if nginx is installed
if command -v nginx &> /dev/null; then
    # Create nginx config for status endpoint
    cat > /etc/nginx/sites-available/status << 'NGINX_CONF'
server {
    listen 8080;
    server_name _;

    root /var/www/html;

    location /status.json {
        # CORS headers for cross-origin access
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
        add_header Cache-Control "no-cache, no-store, must-revalidate";

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }

        try_files $uri =404;
    }
}
NGINX_CONF

    # Enable the site
    ln -sf /etc/nginx/sites-available/status /etc/nginx/sites-enabled/

    # Test and reload nginx
    nginx -t && systemctl reload nginx
    echo "Nginx configured on port 8080"
else
    echo "WARNING: nginx not installed. Install nginx or use another web server."
    echo "Status file created at /var/www/html/status.json"
fi

echo "=== Status API setup complete ==="
echo "Test with: curl http://localhost:8080/status.json"
REMOTE_SCRIPT

echo ""
echo "=== Done! ==="
echo "Status endpoint: http://$VPS_IP:8080/status.json"
echo "Test locally: curl http://$VPS_IP:8080/status.json"
