# lofi-stream-frontend

Public-facing status page and sitemap for all lofi streams.

## Purpose

Central hub showing:
- Live status of all streams (fetched from VPS)
- Links to watch on each platform
- Links to each vibe site

## Architecture

```
User visits GitHub Pages
        │
        ▼
┌───────────────────────┐
│  GitHub Pages         │  ← Static HTML/CSS/JS
│  (this repo)          │
└───────────────────────┘
        │
        │ JavaScript fetches
        ▼
┌───────────────────────┐
│  VPS (135.181.150.82) │  ← Dynamic status.json
│  Updated by cron      │
└───────────────────────┘
```

## Files

```
lofi-stream-frontend/
├── index.html      # Main status page
├── style.css       # Styling (dark theme)
├── script.js       # Fetches status, renders cards
├── CLAUDE.md       # This file
└── scripts/
    └── status-api.sh  # Deploy to VPS - generates status.json
```

## Local Development

```bash
cd ~/lofi-stream-frontend
python3 -m http.server 8080
# Open http://localhost:8080
```

## VPS Status Endpoint

The VPS serves `/status.json` via nginx:
- Updated every minute by cron
- Located at `/var/www/html/status.json`
- Served with CORS headers

### Deploy status script to VPS

```bash
scp scripts/status-api.sh root@135.181.150.82:/opt/scripts/
ssh root@135.181.150.82 'chmod +x /opt/scripts/status-api.sh'
ssh root@135.181.150.82 'crontab -l | grep -v status-api; echo "* * * * * /opt/scripts/status-api.sh" | crontab -'
```

## Streams

| ID | Name | Platform | Service |
|----|------|----------|---------|
| youtube | Night City | YouTube | lofi-stream |
| twitch | Coffee Shop | Twitch | lofi-stream-twitch |
| kick | Arcade | Kick | lofi-stream-kick |
| rumble | Library | Rumble | lofi-stream-rumble |

## Adding New Streams

1. Add to `STREAMS` array in `script.js`
2. Add site card in `index.html`
3. Update VPS `status-api.sh` to check new service
